import {
  testSingleParent,
  testTrio,
  verifyParentage,
  trioDetail,
  cpeOverLoci,
} from "@/imports/core/engine/parentage.js";
import {
  relatednessPair,
  freqByLocusFromPanel,
} from "@/imports/core/engine/relatedness.js";
import { rankCandidates } from "@/imports/core/engine/reverseSearch.js";
import { auditEdges as runAuditEdges } from "@/imports/core/engine/audit.js";

function hash01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function microchipFor(id) {
  const n = Math.floor(hash01(id + "chip") * 1e9)
    .toString()
    .padStart(9, "0");
  return `826 0${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 9)}`;
}

export function createAccess(dataset) {
  const { animals, profiles, owners, panel } = dataset;

  const byId = new Map(animals.map((a) => [a.id, a]));
  const profByCamel = new Map(profiles.map((p) => [p.camelId, p]));
  const ownerById = new Map(owners.map((o) => [o.id, o]));

  const childrenBySire = new Map();
  const childrenByDam = new Map();
  for (const a of animals) {
    if (a._trueSireId) {
      if (!childrenBySire.has(a._trueSireId))
        childrenBySire.set(a._trueSireId, []);
      childrenBySire.get(a._trueSireId).push(a);
    }
    if (a._trueDamId) {
      if (!childrenByDam.has(a._trueDamId)) childrenByDam.set(a._trueDamId, []);
      childrenByDam.get(a._trueDamId).push(a);
    }
  }

  function parentCheck(animalId, parentId) {
    if (!parentId) return null;
    const off = profByCamel.get(animalId);
    const par = profByCamel.get(parentId);
    if (!off || !par) return null;
    return testSingleParent(off, par);
  }

  function computeFlags(a) {
    const prof = profByCamel.get(a.id);
    const flags = [];
    const sireCheck = parentCheck(a.id, a.registeredParentSireId);
    if (sireCheck?.verdict === "excluded")
      flags.push({
        sev: "critical",
        type: "Impossible parentage",
        detail: `declared sire excluded · ${sireCheck.mismatchCount} loci`,
      });
    if (!a.registeredParentDamId)
      flags.push({
        sev: "high",
        type: "Missing maternal",
        detail: "no dam recorded",
      });
    if (!a.registeredParentSireId)
      flags.push({
        sev: "medium",
        type: "Missing paternal",
        detail: "no sire recorded",
      });
    if (prof && prof.completeness < 1)
      flags.push({
        sev: "medium",
        type: "Incomplete profile",
        detail: `${prof.genotypes.length} loci typed (${Math.round(prof.completeness * 100)}%)`,
      });
    if (a._duplicateOf)
      flags.push({
        sev: "high",
        type: "Duplicate suspected",
        detail: "near-identical profile on file",
      });
    return flags;
  }

  function parentageStatusOf(a) {
    const hasDeclared = a.registeredParentSireId || a.registeredParentDamId;
    if (!hasDeclared) return "unknown";
    const sireCheck = parentCheck(a.id, a.registeredParentSireId);
    const damCheck = parentCheck(a.id, a.registeredParentDamId);
    if (sireCheck?.verdict === "excluded" || damCheck?.verdict === "excluded")
      return "conflict";
    return "verified";
  }

  for (const a of animals) {
    const prof = profByCamel.get(a.id);
    const owner = ownerById.get(a.ownerId);
    a._search =
      `${a.name} ${a.nameArabic || ""} ${a.registrationId} ${a.breed} ${a.region} ${owner ? owner.name : ""}`.toLowerCase();
    a.microchipId = a.microchipId || microchipFor(a.id);
    a.ownerName = owner ? owner.name : "—";
    a.completenessScore = prof ? prof.completeness : 0;
    a.hasDNA = Boolean(prof && prof.genotypes.length > 0);
    a.parentageStatus = parentageStatusOf(a);
    a.integrityFlags = computeFlags(a);
    a.alertCount = a.integrityFlags.length;
    a.hasCriticalAlert = a.integrityFlags.some((f) => f.sev === "critical");
    a.inbreedingF = +(hash01(a.id + "F") * 0.34).toFixed(3);
    a.updatedAt = a.updatedAt || a.createdAt;
    a.age = new Date().getFullYear() - a.birthYear;
    a.heterozygosity =
      prof && prof.genotypes.length
        ? prof.genotypes.filter((g) => g.alleleA !== g.alleleB).length /
          prof.genotypes.length
        : 0;
    a.analysisYear = prof
      ? Number(String(prof.analysisDate || "").slice(0, 4))
      : null;
  }

  const sortedF = animals.map((a) => a.inbreedingF).sort((x, y) => x - y);
  function inbreedingPercentile(f) {
    let lo = 0;
    let hi = sortedF.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sortedF[mid] < f) lo = mid + 1;
      else hi = mid;
    }
    return Math.round((lo / Math.max(1, sortedF.length)) * 100);
  }
  for (const a of animals)
    a.inbreedingPercentile = inbreedingPercentile(a.inbreedingF);

  function histogram(values, min, max, nbins) {
    const bins = new Array(nbins).fill(0);
    const span = max - min || 1;
    for (const v of values) {
      let idx = Math.floor(((v - min) / span) * nbins);
      if (idx < 0) idx = 0;
      if (idx >= nbins) idx = nbins - 1;
      bins[idx] += 1;
    }
    return bins;
  }

  const loci = panel.loci || [];
  const meanHe = loci.length
    ? loci.reduce((s, l) => s + (l.He || 0), 0) / loci.length
    : 0;
  const meanRichness = loci.length
    ? loci.reduce(
        (s, l) => s + (l.na || (l.knownAlleles ? l.knownAlleles.length : 0)),
        0,
      ) / loci.length
    : 0;
  const popMeanF =
    animals.reduce((s, a) => s + a.inbreedingF, 0) / (animals.length || 1);
  const diversity = {
    meanHe: +meanHe.toFixed(3),
    meanRichness: +meanRichness.toFixed(1),
    gdi: Math.round(
      (meanHe * 0.45 +
        Math.min(meanRichness / 15, 1) * 0.25 +
        (1 - popMeanF) * 0.3) *
        100,
    ),
    hetBins: histogram(
      animals.map((a) => a.heterozygosity),
      0,
      1,
      10,
    ),
    inbreedingBins: histogram(
      animals.map((a) => a.inbreedingF),
      0,
      0.35,
      9,
    ),
  };

  function topAlerts(limit = 5) {
    const withFlags = animals.filter((a) => a.alertCount > 0);
    withFlags.sort(
      (x, y) =>
        (y.hasCriticalAlert ? 1 : 0) - (x.hasCriticalAlert ? 1 : 0) ||
        y.alertCount - x.alertCount,
    );
    return withFlags.slice(0, limit).map((a) => {
      const f = a.integrityFlags[0];
      return {
        id: a.id,
        sev: f.sev,
        type: f.type,
        subject: a.registrationId,
        detail: f.detail,
      };
    });
  }

  function clusters() {
    const byOwner = new Map();
    for (const a of animals) {
      if (a.inbreedingF > 0.18) {
        const o = byOwner.get(a.ownerId) || { count: 0, sumF: 0 };
        o.count += 1;
        o.sumF += a.inbreedingF;
        byOwner.set(a.ownerId, o);
      }
    }
    const list = [...byOwner.entries()]
      .filter(([, o]) => o.count >= 5)
      .map(([id, o]) => ({
        owner: ownerById.get(id),
        size: o.count,
        meanF: +(o.sumF / o.count).toFixed(2),
      }))
      .sort((x, y) => y.size - x.size);
    return { count: list.length, largest: list[0] || null };
  }

  function analyzedCount(period) {
    const years = animals.filter((a) => a.hasDNA).map((a) => a.analysisYear);
    if (period === "all") return years.length;
    const now = new Date().getFullYear();
    if (period === "365") return years.filter((y) => y >= now - 1).length;
    return years.filter((y) => y >= now).length;
  }

  const uniq = (arr) => [...new Set(arr)].sort();
  const facets = {
    breeds: uniq(animals.map((a) => a.breed)),
    regions: uniq(animals.map((a) => a.region)),
    statuses: uniq(animals.map((a) => a.status)),
    sexes: ["male", "female"],
    owners: owners.map((o) => ({ id: o.id, name: o.name })),
  };

  function getAnimal(id) {
    return byId.get(id) || null;
  }
  function getProfile(camelId) {
    return profByCamel.get(camelId) || null;
  }
  function getOwner(id) {
    return ownerById.get(id) || null;
  }

  function regionCounts() {
    const m = new Map();
    for (const a of animals) m.set(a.region, (m.get(a.region) || 0) + 1);
    return [...m.entries()]
      .map(([region, count]) => ({ region, count }))
      .sort((x, y) => y.count - x.count);
  }

  function statusCounts() {
    const m = { active: 0, deceased: 0, exported: 0, unknown: 0 };
    for (const a of animals) m[a.status] = (m[a.status] || 0) + 1;
    return m;
  }

  function summary() {
    const profiled = animals.filter((a) => a.hasDNA).length;
    const verified = animals.filter(
      (a) => a.parentageStatus === "verified",
    ).length;
    const conflicts = animals.filter(
      (a) => a.parentageStatus === "conflict",
    ).length;
    const missingMaternal = animals.filter(
      (a) => !a.registeredParentDamId,
    ).length;
    const alerts = animals.reduce((n, a) => n + a.alertCount, 0);
    const critical = animals.filter((a) => a.hasCriticalAlert).length;
    const meanF =
      animals.reduce((n, a) => n + a.inbreedingF, 0) / (animals.length || 1);
    return {
      total: animals.length,
      profiled,
      verified,
      conflicts,
      missingMaternal,
      alerts,
      critical,
      meanF: +meanF.toFixed(3),
    };
  }

  function relatives(id) {
    const a = byId.get(id);
    if (!a) return { sire: null, dam: null, offspring: [], fullSibs: [] };
    const sire = a._trueSireId ? byId.get(a._trueSireId) : null;
    const dam = a._trueDamId ? byId.get(a._trueDamId) : null;
    const offspring = [
      ...(childrenBySire.get(id) || []),
      ...(childrenByDam.get(id) || []),
    ];
    const fullSibs =
      a._trueSireId && a._trueDamId
        ? (childrenBySire.get(a._trueSireId) || []).filter(
            (c) => c.id !== id && c._trueDamId === a._trueDamId,
          )
        : [];
    return { sire, dam, offspring, fullSibs };
  }

  const freqByLocus = freqByLocusFromPanel(panel);
  // Shared ComputedRelationship cache (Master §5.1), keyed by
  // (animalA, animalB, panelId, estimator) so PopGen/Verification can reuse it.
  const relCache = new Map();
  function pairKey(x, y, estimator) {
    const pair = x < y ? `${x}|${y}` : `${y}|${x}`;
    return `${pair}|${panel.id}|${estimator}`;
  }
  const ZERO_IBS = { share0: 0, share1: 0, share2: 0 };
  function relatednessTo(aId, bId, { estimator = "lr" } = {}) {
    if (aId === bId)
      return {
        r: 1,
        kinship: 0.5,
        inferred: "Self",
        loci: panel.loci.length,
        ibs: { ...ZERO_IBS },
        confidence: "n/a",
      };
    const key = pairKey(aId, bId, estimator);
    if (relCache.has(key)) return relCache.get(key);
    const pa = profByCamel.get(aId);
    const pb = profByCamel.get(bId);
    if (!pa || !pb) {
      const none = {
        r: 0,
        kinship: 0,
        inferred: "Unrelated",
        loci: 0,
        ibs: { ...ZERO_IBS },
        confidence: "insufficient loci",
      };
      relCache.set(key, none);
      return none;
    }
    const res = relatednessPair(
      pa.genotypes,
      pb.genotypes,
      freqByLocus,
      estimator,
    );
    const out = {
      r: res.r,
      kinship: res.kinship,
      inferred: res.category,
      loci: res.lociUsed,
      ibs: res.ibs,
      confidence: res.confidence,
      estimator,
    };
    relCache.set(key, out);
    return out;
  }

  const rankedRelCache = new Map();
  function rankedRelatives(id, { limit = 12, threshold = 0.12 } = {}) {
    if (rankedRelCache.has(id)) return rankedRelCache.get(id);
    const prof = profByCamel.get(id);
    if (!prof) return [];
    const out = [];
    for (const other of animals) {
      if (other.id === id || !profByCamel.get(other.id)) continue;
      const rel = relatednessTo(id, other.id);
      if (rel.r >= threshold)
        out.push({
          animal: other,
          r: rel.r,
          inferred: rel.inferred,
          loci: rel.loci,
        });
    }
    out.sort((x, y) => y.r - x.r);
    const top = out.slice(0, limit);
    rankedRelCache.set(id, top);
    return top;
  }

  function pedigree(id) {
    const a = byId.get(id);
    if (!a) return null;
    const node = (animal) =>
      animal
        ? { id: animal.id, name: animal.name, reg: animal.registrationId }
        : null;
    const bioSire = a._trueSireId ? byId.get(a._trueSireId) : null;
    const bioDam = a._trueDamId ? byId.get(a._trueDamId) : null;
    const decSire = a.registeredParentSireId
      ? byId.get(a.registeredParentSireId)
      : null;
    const decDam = a.registeredParentDamId
      ? byId.get(a.registeredParentDamId)
      : null;
    return {
      self: node(a),
      sire: {
        biology: node(bioSire),
        registry: node(decSire),
        conflict: Boolean(decSire && bioSire && decSire.id !== bioSire.id),
      },
      dam: {
        biology: node(bioDam),
        registry: node(decDam),
        conflict: Boolean(decDam && bioDam && decDam.id !== bioDam.id),
      },
    };
  }

  function verify(offspringId, parentId, opts = {}) {
    const off = profByCamel.get(offspringId);
    const par = profByCamel.get(parentId);
    if (!off || !par) return null;
    return verifyParentage(off, par, panel, freqByLocus, opts);
  }

  function verifyTrio(offspringId, sireId, damId, opts = {}) {
    const off = profByCamel.get(offspringId);
    const s = profByCamel.get(sireId);
    const d = profByCamel.get(damId);
    if (!off || !s || !d) return null;
    const res = testTrio(off, s, d, opts);
    const detail = trioDetail(off, s, d);
    const cpe = cpeOverLoci(
      panel,
      detail.map((x) => x.locus),
    );
    return { ...res, cpe, detail };
  }

  function reverseSearch(
    offspringId,
    {
      target = "sire",
      tolerance = 1,
      minParentAge = 3,
      region = "",
      owner = "",
      otherParentId = "",
    } = {},
  ) {
    const off = byId.get(offspringId);
    const offProf = profByCamel.get(offspringId);
    if (!off || !offProf)
      return { error: "offspring-unprofiled", poolSize: 0, survivors: [] };
    const wantSex = target === "dam" ? "female" : "male";
    const otherProf = otherParentId ? profByCamel.get(otherParentId) : null;
    const candidates = [];
    for (const a of animals) {
      if (a.id === offspringId) continue;
      if (target !== "both" && a.sex !== wantSex) continue;
      if (!a.hasDNA) continue;
      if (a.birthYear > off.birthYear - minParentAge) continue;
      if (region && a.region !== region) continue;
      if (owner && a.ownerId !== owner) continue;
      const prof = profByCamel.get(a.id);
      if (!prof) continue;
      candidates.push({ animal: a, genotypes: prof.genotypes });
    }
    return rankCandidates({
      offspringGenotypes: offProf.genotypes,
      candidates,
      freqByLocus,
      tolerance,
      otherParentGenotypes: otherProf ? otherProf.genotypes : null,
    });
  }

  // Build the list of declared edges to audit (cheap — no verdicts yet).
  function buildAuditEdges({ scope = "sire", ids = null } = {}) {
    const targets = ids ? ids.map((i) => byId.get(i)).filter(Boolean) : animals;
    const edges = [];
    for (const a of targets) {
      const offProf = profByCamel.get(a.id);
      const pushEdge = (parentId, role) => {
        if (!parentId) return;
        const parentProf = profByCamel.get(parentId);
        const parent = byId.get(parentId);
        edges.push({
          offspringId: a.id,
          parentId,
          role,
          offspringGenotypes: offProf ? offProf.genotypes : null,
          parentGenotypes: parentProf ? parentProf.genotypes : null,
          meta: {
            offspring: a.registrationId,
            offspringName: a.name,
            parent: parent ? parent.registrationId : "—",
            region: a.region,
            breed: a.breed,
            ownerName: a.ownerName,
          },
        });
      };
      if (scope === "sire" || scope === "both")
        pushEdge(a.registeredParentSireId, "sire");
      if (scope === "dam" || scope === "both")
        pushEdge(a.registeredParentDamId, "dam");
    }
    return edges;
  }

  // Verify a (chunk of) pre-built edges — used for incremental, cancellable audits.
  function auditEdgeList(edges, { tolerance = 1 } = {}) {
    return runAuditEdges(edges, { tolerance });
  }

  function auditEdges({ scope = "sire", tolerance = 1, ids = null } = {}) {
    return runAuditEdges(buildAuditEdges({ scope, ids }), { tolerance });
  }

  function search({
    query = "",
    breed = "",
    region = "",
    sex = "",
    status = "",
    owner = "",
    dna = "",
    parentage = "",
    alerts = "",
    ranges = {},
    sort = "registrationId",
    dir = "asc",
    sorts = null,
    page = 0,
    pageSize = 50,
  } = {}) {
    const q = query.trim().toLowerCase();
    const nowYear = new Date().getFullYear();
    const num = (v) => (v === "" || v == null ? null : Number(v));
    const ageMin = num(ranges.ageMin);
    const ageMax = num(ranges.ageMax);
    const complMin = num(ranges.complMin);
    const complMax = num(ranges.complMax);
    const fMin = num(ranges.fMin);
    const fMax = num(ranges.fMax);
    const bornFrom = num(ranges.bornFrom);
    const bornTo = num(ranges.bornTo);

    const rows = animals.filter((a) => {
      if (q && !a._search.includes(q)) return false;
      if (breed && a.breed !== breed) return false;
      if (region && a.region !== region) return false;
      if (sex && a.sex !== sex) return false;
      if (status && a.status !== status) return false;
      if (owner && a.ownerId !== owner) return false;
      if (dna === "yes" && !a.hasDNA) return false;
      if (dna === "no" && a.hasDNA) return false;
      if (parentage && a.parentageStatus !== parentage) return false;
      if (alerts === "yes" && a.alertCount === 0) return false;
      if (alerts === "critical" && !a.hasCriticalAlert) return false;
      const age = nowYear - a.birthYear;
      if (ageMin != null && age < ageMin) return false;
      if (ageMax != null && age > ageMax) return false;
      const compl = a.completenessScore * 100;
      if (complMin != null && compl < complMin) return false;
      if (complMax != null && compl > complMax) return false;
      if (fMin != null && a.inbreedingF < fMin) return false;
      if (fMax != null && a.inbreedingF > fMax) return false;
      if (bornFrom != null && a.birthYear < bornFrom) return false;
      if (bornTo != null && a.birthYear > bornTo) return false;
      return true;
    });
    const total = rows.length;
    const sortKeys = sorts && sorts.length ? sorts : [{ key: sort, dir }];
    const sorted = rows.slice().sort((x, y) => {
      for (const s of sortKeys) {
        const a = x[s.key];
        const b = y[s.key];
        const cmp = a < b ? -1 : a > b ? 1 : 0;
        if (cmp !== 0) return s.dir === "asc" ? cmp : -cmp;
      }
      return 0;
    });
    if (!Number.isFinite(pageSize)) return { rows: sorted, total };
    const start = page * pageSize;
    return { rows: sorted.slice(start, start + pageSize), total };
  }

  function matchGenotype(query, { limit = 8 } = {}) {
    const qMap = new Map(query.map((g) => [g.locus, g]));
    const results = [];
    for (const a of animals) {
      const prof = profByCamel.get(a.id);
      if (!prof) continue;
      let compared = 0;
      let exact = 0;
      const mismatchLoci = [];
      for (const g of prof.genotypes) {
        const q = qMap.get(g.locus);
        if (!q) continue;
        compared += 1;
        const same =
          (g.alleleA === q.alleleA && g.alleleB === q.alleleB) ||
          (g.alleleA === q.alleleB && g.alleleB === q.alleleA);
        if (same) exact += 1;
        else mismatchLoci.push(g.locus);
      }
      if (compared === 0) continue;
      results.push({
        animal: a,
        compared,
        exact,
        score: exact / compared,
        mismatchLoci,
      });
    }
    results.sort((x, y) => y.score - x.score || y.exact - x.exact);
    return results.slice(0, limit);
  }

  const auditLog = [];
  function addAudit(entry) {
    auditLog.unshift({
      id: `audit_${auditLog.length + 1}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });
    return auditLog[0];
  }
  function getAudit(entityId) {
    return entityId
      ? auditLog.filter((e) => e.entityId === entityId)
      : auditLog.slice();
  }

  return {
    panel,
    facets,
    total: animals.length,
    animals,
    owners,
    getAnimal,
    getProfile,
    getOwner,
    relatives,
    rankedRelatives,
    relatednessTo,
    pedigree,
    verify,
    verifyTrio,
    reverseSearch,
    auditEdges,
    buildAuditEdges,
    auditEdgeList,
    freqByLocus,
    flagsFor: (id) => byId.get(id)?.integrityFlags || [],
    parentageStatusOf: (id) => byId.get(id)?.parentageStatus || "unknown",
    inbreedingPercentile,
    regionCounts,
    statusCounts,
    summary,
    diversity,
    topAlerts,
    clusters,
    analyzedCount,
    search,
    matchGenotype,
    addAudit,
    getAudit,
  };
}
