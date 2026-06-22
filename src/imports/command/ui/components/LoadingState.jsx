"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Skeleton } from "@/imports/core/components/Skeleton.jsx";

export function LoadingState() {
  return (
    <Wrap>
      <Chip
        className="chip"
        tone="accent"
        leadingIcon={<Icon name="circle-notch" size={12} />}
      >
        Building national dataset…
      </Chip>
      <Skeleton width={220} height={28} />
      <Card padding={0}>
        <Band>
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="cell" key={i}>
              <Skeleton width={90} height={10} />
              <Skeleton width={70} height={24} />
              <Skeleton width="100%" height={26} />
            </div>
          ))}
        </Band>
      </Card>
      <Lower>
        <Skeleton height={200} radius="var(--radius-lg)" />
        <Skeleton height={200} radius="var(--radius-lg)" />
      </Lower>
    </Wrap>
  );
}

const Wrap = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 80px 40px 96px 128px;

  @media (max-width: 768px) {
    padding: 72px 16px 96px 16px;
  }

  .chip {
    margin-bottom: 16px;
  }
  > :nth-child(2) {
    margin-bottom: 20px;
  }
`;

const Band = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));

  .cell {
    padding: 20px 22px;
  }
  .cell + .cell {
    border-inline-start: 1px solid var(--border);
  }
  .cell > * {
    margin-bottom: 12px;
  }
  .cell > *:last-child {
    margin-bottom: 0;
  }
`;

const Lower = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  margin-top: 16px;
`;
