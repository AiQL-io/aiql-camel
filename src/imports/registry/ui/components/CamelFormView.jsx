"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Input } from "@/imports/core/components/Input.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { useCamelForm } from "@/imports/registry/hooks/useCamelForm.js";

const VERDICT_TONE = {
  consistent: "success",
  inconclusive: "warning",
  excluded: "danger",
};

function ParentSelect({ label, value, onChange, options }) {
  return (
    <Field>
      <span className="lbl">{label}</span>
      <Select
        block
        value={value}
        placeholder="Not recorded"
        onChange={(v) => onChange(v)}
        options={[
          { value: "", label: "Not recorded" },
          ...options.map((a) => ({
            value: a.id,
            label: `${a.name} · ${a.registrationId}`,
          })),
        ]}
      />
    </Field>
  );
}

export function CamelFormView({ access, id }) {
  const f = useCamelForm(access, id);
  const { can } = useRole();
  const canEdit = can("editRecords");

  return (
    <>
      <Link
        href={f.editing ? `/registry/${id}` : "/registry"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "var(--text-sm)",
          color: "var(--fg-subtle)",
        }}
      >
        <Icon name="arrow-left" size={14} />{" "}
        {f.editing ? "Profile" : "Registry"}
      </Link>
      <Head>
        <Overline>{f.editing ? "Edit record" : "New record"}</Overline>
        <h1>{f.editing ? f.animal.name : "Register a camel"}</h1>
      </Head>

      <Layout>
        <Card>
          <Grid2>
            <Field>
              <span className="lbl">Name</span>
              <Input
                value={f.form.name}
                onChange={(e) => f.setField("name", e.target.value)}
                placeholder="Name"
              />
            </Field>
            <Field>
              <span className="lbl">Name (Arabic)</span>
              <Input
                value={f.form.nameArabic}
                onChange={(e) => f.setField("nameArabic", e.target.value)}
                placeholder="الاسم"
              />
            </Field>
          </Grid2>
          <Grid2>
            <Field>
              <span className="lbl">Sex</span>
              <Select
                block
                value={f.form.sex}
                onChange={(v) => f.setField("sex", v)}
                options={[
                  { value: "female", label: "Female" },
                  { value: "male", label: "Male" },
                ]}
              />
            </Field>
            <Field>
              <span className="lbl">Date of birth</span>
              <Input
                type="date"
                value={f.form.dateOfBirth}
                onChange={(e) => f.setField("dateOfBirth", e.target.value)}
              />
            </Field>
          </Grid2>
          <Grid2>
            <Field>
              <span className="lbl">Breed</span>
              <Select
                block
                value={f.form.breed}
                onChange={(v) => f.setField("breed", v)}
                options={f.facets.breeds.map((b) => ({ value: b, label: b }))}
              />
            </Field>
            <Field>
              <span className="lbl">Region</span>
              <Select
                block
                value={f.form.region}
                onChange={(v) => f.setField("region", v)}
                options={f.facets.regions.map((r) => ({ value: r, label: r }))}
              />
            </Field>
          </Grid2>
          <Field>
            <span className="lbl">Owner</span>
            <Select
              block
              value={f.form.ownerId}
              onChange={(v) => f.setField("ownerId", v)}
              options={f.owners.map((o) => ({ value: o.id, label: o.name }))}
            />
          </Field>
          <Grid2>
            <ParentSelect
              label="Declared sire"
              value={f.form.registeredParentSireId}
              onChange={(v) => f.setField("registeredParentSireId", v)}
              options={f.males}
            />
            <ParentSelect
              label="Declared dam"
              value={f.form.registeredParentDamId}
              onChange={(v) => f.setField("registeredParentDamId", v)}
              options={f.females}
            />
          </Grid2>

          <Dna>
            <label className="assoc">
              <input
                type="checkbox"
                checked={f.dnaAssociated}
                onChange={(e) => f.toggleDna(e.target.checked)}
              />
              <span>
                <b>Associate DNA profile</b>
                <i>
                  Link an STR genotype to this record ({f.genotype.length} loci)
                </i>
              </span>
            </label>
            {f.dnaAssociated && (
              <div className="loci">
                {f.genotype.map((g) => (
                  <div className="locus" key={g.locus}>
                    <span className="name">{g.locus}</span>
                    <input
                      type="number"
                      value={g.alleleA}
                      onChange={(e) =>
                        f.setAllele(g.locus, "alleleA", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      value={g.alleleB}
                      onChange={(e) =>
                        f.setAllele(g.locus, "alleleB", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </Dna>

          {!canEdit && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                padding: "10px 14px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-2)",
                color: "var(--fg-secondary)",
                fontSize: "var(--text-sm)",
              }}
            >
              <Icon name="lock-simple" size={16} />
              Your role has view-only access to records — editing is disabled.
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Button variant="primary" onClick={f.save} disabled={!canEdit}>
              {f.editing ? "Save changes" : "Register camel"}
            </Button>
            <Button
              as={Link}
              href={f.editing ? `/registry/${id}` : "/registry"}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
          {f.saved && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 14,
                color: "var(--status-success)",
              }}
            >
              <Icon name="check-circle" size={18} />
              <span style={{ fontSize: "var(--text-sm)" }}>
                Saved & audit-logged (prototype — not persisted).
              </span>
            </div>
          )}
        </Card>

        <Card>
          <Overline style={{ marginBottom: 6 }}>Live biology check</Overline>
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--fg-subtle)",
              marginBottom: 8,
            }}
          >
            Declared parentage is validated against the DNA profile as you edit.
          </p>
          <Check>
            <span className="role">Sire</span>
            <div>
              {f.sireCheck ? (
                <>
                  <Chip
                    size="sm"
                    tone={VERDICT_TONE[f.sireCheck.verdict]}
                    style={{ textTransform: "capitalize" }}
                  >
                    {f.sireCheck.verdict}
                  </Chip>
                  <div className="detail">
                    {f.sireCheck.lociCompared} loci ·{" "}
                    {f.sireCheck.mismatchCount} mismatch
                  </div>
                </>
              ) : (
                <Chip size="sm">none</Chip>
              )}
            </div>
          </Check>
          <Check>
            <span className="role">Dam</span>
            <div>
              {f.damCheck ? (
                <>
                  <Chip
                    size="sm"
                    tone={VERDICT_TONE[f.damCheck.verdict]}
                    style={{ textTransform: "capitalize" }}
                  >
                    {f.damCheck.verdict}
                  </Chip>
                  <div className="detail">
                    {f.damCheck.lociCompared} loci · {f.damCheck.mismatchCount}{" "}
                    mismatch
                  </div>
                </>
              ) : (
                <Chip size="sm">none</Chip>
              )}
            </div>
          </Check>
        </Card>
      </Layout>
    </>
  );
}

const Head = styled.div`
  margin-top: 14px;

  h1 {
    font-size: var(--text-2xl);
    line-height: 40px;
    font-weight: var(--weight-medium);
    letter-spacing: -0.02em;
    margin-top: 8px;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  margin-top: 20px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: block;
  margin-bottom: 14px;

  .lbl {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fg-subtle);
    margin-bottom: 6px;
  }
  select,
  & > div {
    width: 100%;
  }
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
`;

const Dna = styled.div`
  margin: 6px 0 16px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-2);

  .assoc {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    cursor: pointer;
  }
  .assoc input {
    margin-top: 3px;
  }
  .assoc b {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .assoc i {
    display: block;
    font-style: normal;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 2px;
  }
  .loci {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 12px;
  }
  .locus {
    display: grid;
    grid-template-columns: 70px 1fr 1fr;
    align-items: center;
    gap: 6px;
  }
  .locus .name {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--fg-subtle);
  }
  .locus input {
    height: 30px;
    padding: 0 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--field-bg);
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    width: 100%;
  }
`;

const Check = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--separator);

  &:last-child {
    border-bottom: none;
  }
  .role {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fg-subtle);
  }
  .detail {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 4px;
    text-align: end;
  }
`;
