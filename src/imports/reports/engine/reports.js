export const REPORT_TYPES = [
  {
    id: "identity_certificate",
    label: "Identity Certificate",
    icon: "identification-badge",
    subject: "animal",
    blurb:
      "Certifies a registered animal's DNA identity and individualization power.",
  },
  {
    id: "parentage_certificate",
    label: "Parentage Certificate",
    icon: "git-fork",
    subject: "trio",
    blurb: "Certifies a parentage verdict with combined exclusion power.",
  },
  {
    id: "population_report",
    label: "Population / Diversity Report",
    icon: "chart-scatter",
    subject: "population",
    blurb: "Summarizes population diversity and structure metrics.",
  },
  {
    id: "integrity_report",
    label: "Integrity Report",
    icon: "shield-check",
    subject: "population",
    blurb: "Registry integrity & data-quality status snapshot.",
  },
];

export const TEMPLATES = [
  {
    id: "manhal_official",
    name: "Manhal Official",
    brand: "Manhal",
    accent: "#1f6feb",
    seal: "Manhal · National Camel DNA",
  },
  {
    id: "kfsh_lab",
    name: "KFSH Laboratory",
    brand: "KFSH",
    accent: "#0f766e",
    seal: "KFSH Genetics Laboratory",
  },
  {
    id: "camel_club",
    name: "Saudi Camel Club",
    brand: "Camel Club",
    accent: "#9a6b1f",
    seal: "Saudi Camel Club Registry",
  },
];

const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateVerificationCode(seed) {
  let h = 2166136261;
  const s = `${seed}-${Date.now()}-${Math.random()}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const block = () => {
    let out = "";
    for (let i = 0; i < 4; i++) {
      h = Math.imul(h ^ (h >>> 13), 16777619) >>> 0;
      out += ABC[h % ABC.length];
    }
    return out;
  };
  return `MNHL-${block()}-${block()}`;
}

export function qrMatrix(code, size = 21) {
  let h = 5381;
  for (let i = 0; i < code.length; i++) h = (h * 33 + code.charCodeAt(i)) >>> 0;
  const grid = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      h = Math.imul(h ^ (x * 73856093) ^ (y * 19349663), 2654435761) >>> 0;
      row.push((h & 7) > 3);
    }
    grid.push(row);
  }
  const finder = (ox, oy) => {
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[oy + y][ox + x] = edge || core;
      }
    for (let i = -1; i <= 7; i++) {
      if (oy + 7 < size && ox + i >= 0 && ox + i < size)
        grid[oy + 7][ox + i] = false;
      if (ox + 7 < size && oy + i >= 0 && oy + i < size)
        grid[oy + i][ox + 7] = false;
    }
  };
  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);
  return grid;
}

const AR = {
  "DNA Identity Certificate": "شهادة الهوية الوراثية (DNA)",
  "Parentage Verification Certificate": "شهادة التحقق من النسب",
  "Population & Diversity Report": "تقرير التنوع الوراثي للمجتمع",
  "Registry Integrity Report": "تقرير سلامة السجل",
  "Registration ID": "رقم التسجيل",
  Name: "الاسم",
  "Line / Breed": "السلالة",
  Sex: "الجنس",
  "Date of birth": "تاريخ الميلاد",
  Region: "المنطقة",
  "Owner / Stable": "المالك / الحظيرة",
  Microchip: "الشريحة الإلكترونية",
  Offspring: "المولود",
  "Declared sire": "الأب المُعلن",
  "Declared dam": "الأم المُعلنة",
  "Tested parent": "الوالد المختبَر",
  "Test type": "نوع الاختبار",
  Case: "رقم الحالة",
  Scope: "النطاق",
  "Whole registry": "السجل بالكامل",
  "National population": "المجتمع الوطني",
  "Animals analysed": "عدد الحيوانات المُحللة",
  Profiled: "المُبصمة وراثياً",
  "Total records": "إجمالي السجلات",
  "Genetic evidence": "الأدلة الوراثية",
  "Parentage evidence": "أدلة النسب",
  "Diversity metrics": "مؤشرات التنوع",
  "Data-quality status": "حالة جودة البيانات",
  "DNA profile": "البصمة الوراثية",
  "Loci typed": "المواقع المُحللة",
  Panel: "اللوحة",
  "Individualization (PI)": "قوة التفرد (PI)",
  Verdict: "النتيجة",
  "Combined exclusion power (CPE)": "قوة الاستبعاد المجمعة (CPE)",
  "Parentage index (PI)": "مؤشر النسب (PI)",
  "Loci compared": "المواقع المقارَنة",
  "Mismatch loci": "المواقع غير المتطابقة",
  "Genetic Diversity Index": "مؤشر التنوع الوراثي",
  "Mean He": "متوسط التغايُر المتوقع",
  "Allelic richness": "الثراء الأليلي",
  "Mean inbreeding F": "متوسط معامل القرابة F",
  "Parentage verified": "النسب مُتحقق منه",
  "Missing maternal": "أمومة مفقودة",
  "Missing paternal": "أبوة مفقودة",
  "Incomplete profiles": "بصمات غير مكتملة",
  "Suspected duplicates": "تكرارات مُشتبهة",
  male: "ذكر",
  female: "أنثى",
  consistent: "متوافق",
  excluded: "مُستبعد",
  "On file": "مُسجلة",
  "Not profiled": "غير مُبصمة",
};

export const CHROME_AR = {
  draft: "مسودة",
  issued: "صادرة",
  revoked: "ملغاة",
  "Verification code": "رمز التحقق",
  "Verify at manhal.sa/reports/verify": "تحقق عبر manhal.sa/reports/verify",
  "Authorized issuer": "جهة الإصدار المعتمدة",
};

const tr = (s) => AR[s] || s;

export function localizeContent(content, lang) {
  if (!content || lang !== "ar") return content;
  return {
    ...content,
    heading: tr(content.heading),
    statement:
      content.heading === "Parentage Verification Certificate"
        ? content.statement.startsWith("The genetic evidence EXCLUDES")
          ? "تستبعد الأدلة الوراثية النسب المُعلن في موقع واحد أو أكثر."
          : "تتوافق الأدلة الوراثية مع النسب المُعلن في المواقع المختبَرة."
        : content.statement,
    facts: content.facts.map(([k, v]) => [tr(k), tr(String(v))]),
    evidence: {
      ...content.evidence,
      title: tr(content.evidence.title),
      rows: content.evidence.rows.map(([k, v]) => [tr(k), tr(String(v))]),
    },
  };
}

function fmtPI(pi) {
  if (pi == null) return "—";
  if (pi >= 1000) return pi.toExponential(2);
  return pi.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function animalSummary(access, id) {
  const a = access.getAnimal(id);
  if (!a) return null;
  return {
    id: a.id,
    reg: a.registrationId,
    name: a.name,
    breed: a.breed,
    sex: a.sex,
    region: a.region,
    dob: a.dateOfBirth || String(a.birthYear),
    owner: a.ownerName,
    microchip:
      a.microchip || a.registrationId.replace(/[^0-9]/g, "").slice(0, 15),
    hasDNA: a.hasDNA,
  };
}

export function buildReportContent(access, type, subjectIds = []) {
  if (type === "identity_certificate") {
    const a = animalSummary(access, subjectIds[0]);
    if (!a) return null;
    const prof = access.getProfile(a.id);
    const loci = prof ? prof.genotypes.length : 0;
    return {
      heading: "DNA Identity Certificate",
      subjectLabel: `${a.reg} · ${a.name}`,
      facts: [
        ["Registration ID", a.reg],
        ["Name", a.name],
        ["Line / Breed", a.breed],
        ["Sex", a.sex],
        ["Date of birth", a.dob],
        ["Region", a.region],
        ["Owner / Stable", a.owner],
        ["Microchip", a.microchip],
      ],
      evidence: {
        title: "Genetic evidence",
        rows: [
          ["DNA profile", a.hasDNA ? "On file" : "Not profiled"],
          ["Loci typed", `${loci} / ${access.panel.loci.length}`],
          ["Panel", `${access.panel.name} v${access.panel.version}`],
          [
            "Individualization (PI)",
            fmtPI(prof ? prof.genotypes.length * 1e6 : null),
          ],
        ],
      },
      statement:
        "This certificate confirms the above animal's STR DNA profile is recorded in the national registry under the stated identity.",
    };
  }

  if (type === "parentage_certificate") {
    const [offId, sireId, damId] = subjectIds;
    const off = animalSummary(access, offId);
    if (!off) return null;
    let verdict = "—";
    let cpe = null;
    let pi = null;
    if (sireId && damId) {
      const trio = access.verifyTrio(offId, sireId, damId);
      if (trio) {
        verdict = trio.verdict;
        cpe = trio.cpe;
      }
    } else if (sireId) {
      const v = access.verify(offId, sireId);
      if (v) {
        verdict = v.verdict;
        cpe = v.cpe;
        pi = v.parentageIndex;
      }
    }
    const sire = sireId ? animalSummary(access, sireId) : null;
    const dam = damId ? animalSummary(access, damId) : null;
    return {
      heading: "Parentage Verification Certificate",
      subjectLabel: `${off.reg} · ${off.name}`,
      facts: [
        ["Offspring", `${off.reg} · ${off.name}`],
        ["Declared sire", sire ? `${sire.reg} · ${sire.name}` : "—"],
        ["Declared dam", dam ? `${dam.reg} · ${dam.name}` : "—"],
        ["Line / Breed", off.breed],
        ["Owner / Stable", off.owner],
      ],
      evidence: {
        title: "Parentage evidence",
        rows: [
          ["Verdict", verdict],
          [
            "Combined exclusion power (CPE)",
            cpe != null ? `${(cpe * 100).toFixed(4)}%` : "—",
          ],
          ["Parentage index (PI)", fmtPI(pi)],
          ["Panel", `${access.panel.name} v${access.panel.version}`],
        ],
      },
      verdict,
      statement:
        verdict === "excluded"
          ? "The genetic evidence EXCLUDES the declared parentage at one or more loci."
          : "The genetic evidence is CONSISTENT with the declared parentage at the tested loci.",
    };
  }

  if (type === "population_report") {
    const d = access.diversity || {};
    const s = typeof access.summary === "function" ? access.summary() : null;
    return {
      heading: "Population & Diversity Report",
      subjectLabel: "National population",
      facts: [
        ["Scope", "Whole registry"],
        ["Animals analysed", (s ? s.total : access.total).toLocaleString()],
        ["Profiled", s ? `${s.profiled.toLocaleString()}` : "—"],
      ],
      evidence: {
        title: "Diversity metrics",
        rows: [
          ["Genetic Diversity Index", String(d.gdi ?? "—")],
          ["Mean He", String(d.meanHe ?? "—")],
          ["Allelic richness", String(d.meanRichness ?? "—")],
          ["Mean inbreeding F", String(s?.meanF ?? "—")],
        ],
      },
      statement:
        "This report summarizes genetic diversity and structure across the national camel registry for the stated period.",
    };
  }

  if (type === "integrity_report") {
    const q = access.qualityMetrics ? access.qualityMetrics() : null;
    return {
      heading: "Registry Integrity Report",
      subjectLabel: "Registry-wide",
      facts: [
        ["Scope", "Whole registry"],
        ["Total records", (q ? q.total : access.total).toLocaleString()],
      ],
      evidence: {
        title: "Data-quality status",
        rows: q
          ? [
              ["Profiled", `${q.pctProfiled}%`],
              ["Parentage verified", `${q.pctVerified}%`],
              ["Missing maternal", q.missingMat.toLocaleString()],
              ["Missing paternal", q.missingPat.toLocaleString()],
              ["Incomplete profiles", q.incomplete.toLocaleString()],
              ["Suspected duplicates", q.duplicates.toLocaleString()],
            ]
          : [],
      },
      statement:
        "This report attests to the data-quality and integrity status of the registry at the time of issue.",
    };
  }

  return null;
}
