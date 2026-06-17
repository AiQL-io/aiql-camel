"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";

export function ReconcileEmpty() {
  return (
    <Card>
      <NotFound>
        Animal not found. <Link href="/integrity">Back to queue</Link>
      </NotFound>
    </Card>
  );
}

const NotFound = styled.p`
  text-align: center;
  color: var(--fg-subtle);
`;
