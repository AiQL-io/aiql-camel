"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";

export function DocumentsTab({ animal }) {
  return (
    <Card>
      <Overline style={{ marginBottom: 12 }}>Certificates & reports</Overline>
      <DocsEmpty>
        <Icon name="certificate" size={28} color="var(--fg-muted)" />
        <p>No documents issued for this animal yet.</p>
        <Button
          as={Link}
          href={`/reports?subject=${animal.id}`}
          variant="secondary"
          size="sm"
          leadingIcon={<Icon name="plus" size={14} />}
        >
          Generate certificate
        </Button>
      </DocsEmpty>
    </Card>
  );
}

const DocsEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px 0;
  text-align: center;

  p {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
`;
