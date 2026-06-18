"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { CompareStrip } from "@/imports/core/components/CompareStrip.jsx";
import { Verdict } from "./Verdict.jsx";
import { TrioStrip } from "./TrioStrip.jsx";

export function WorkbenchResult({
  r,
  wb,
  can,
  declaredExcluded,
  onFinalize,
  onExport,
  onMethods,
}) {
  return (
    <>
      <div style={{ marginTop: 16 }}>
        <Verdict
          verdict={r.verdict}
          lociCompared={r.lociCompared}
          mismatchCount={r.mismatchCount}
          cpe={r.cpe}
          parentageIndex={r.parentageIndex}
          tolerance={wb.tolerance}
          onMethods={onMethods}
        />
      </div>

      <Card style={{ marginTop: 16 }}>
        <Overline style={{ marginBottom: 14 }}>Per-locus comparison</Overline>
        {r.kind === "trio" ? (
          <TrioStrip
            rows={r.detail}
            labels={{
              sire: r.sire?.name,
              offspring: wb.offspring?.name,
              dam: r.dam?.name,
            }}
          />
        ) : (
          <CompareStrip
            rows={[
              {
                label: wb.offspring?.name,
                sub: wb.offspring?.registrationId,
                geno: r.offspringGeno,
              },
              {
                label: r.candidate?.name,
                sub: `${r.candidate?.registrationId} · candidate ${r.role}`,
                geno: r.candidateGeno,
              },
            ]}
          />
        )}
      </Card>

      <Actions>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onFinalize()}
          leadingIcon={<Icon name="folder-plus" size={14} />}
        >
          Finalize to Case
        </Button>
        {can("issueCertificate") && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onFinalize()}
            leadingIcon={<Icon name="certificate" size={14} />}
          >
            To certificate
          </Button>
        )}
        {declaredExcluded && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onFinalize({ withAlert: true })}
            leadingIcon={<Icon name="flag" size={14} />}
          >
            Raise integrity alert
          </Button>
        )}
        <Button
          as={Link}
          href={`/verify/search?offspring=${wb.offspringId}`}
          variant="secondary"
          size="sm"
          leadingIcon={<Icon name="magnifying-glass" size={14} />}
        >
          Open reverse search
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          leadingIcon={<Icon name="download-simple" size={14} />}
        >
          Export
        </Button>
      </Actions>
    </>
  );
}

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
`;
