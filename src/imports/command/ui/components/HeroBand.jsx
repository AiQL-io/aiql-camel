"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { StatTile } from "@/imports/core/components/StatTile.jsx";

export function HeroBand({ tiles = [] }) {
  return (
    <Band>
      <Card padding={0}>
        <Grid>
          {tiles.map((s) => (
            <Link key={s.label} href={s.href}>
              <StatTile {...s} />
            </Link>
          ))}
        </Grid>
      </Card>
    </Band>
  );
}

const Band = styled.div`
  margin-top: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));

  a {
    display: block;
    padding: 20px 22px;
  }
  a + a {
    border-inline-start: 1px solid var(--border);
  }
`;
