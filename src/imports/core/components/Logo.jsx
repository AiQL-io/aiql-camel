"use client";

import React from "react";
import styled from "styled-components";

export function Logo({
  variant = "full",
  size = 28,
  productName = "Manhal Camel Intelligence",
  showBy = false,
  style = {},
  ...rest
}) {
  const mark = (
    <img
      src="/brand/manhal-emblem.png"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      style={{
        display: "block",
        flex: "none",
        width: size,
        height: size,
        objectFit: "contain",
      }}
    />
  );

  if (variant === "mark") {
    return (
      <Mark style={style} {...rest}>
        {mark}
      </Mark>
    );
  }

  return (
    <Root $size={size} style={style} {...rest}>
      {mark}
      <span className="wordmark">
        <span className="product">{productName}</span>
        {showBy && (
          <span className="by">
            <span className="by-label">by</span>
            <span className="by-brand">AiQL</span>
          </span>
        )}
      </span>
    </Root>
  );
}

const Mark = styled.span`
  display: inline-flex;

  svg {
    flex: none;
    display: block;
  }
`;

const Root = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => p.$size * 0.28}px;

  .wordmark {
    display: inline-flex;
    align-items: baseline;
    gap: ${(p) => p.$size * 0.17}px;
  }
  .product {
    font-family: var(--font-sans);
    font-weight: var(--weight-medium);
    font-size: ${(p) => p.$size * 0.5}px;
    letter-spacing: -0.01em;
    color: var(--fg);
    white-space: nowrap;
  }
  .by {
    display: inline-flex;
    align-items: baseline;
    gap: ${(p) => p.$size * 0.11}px;
  }
  .by-label {
    font-family: var(--font-sans);
    font-weight: var(--weight-medium);
    font-size: ${(p) => p.$size * 0.31}px;
    color: var(--fg-muted);
  }
  .by-brand {
    font-family: var(--font-sans);
    font-weight: var(--weight-semibold);
    font-size: ${(p) => p.$size * 0.33}px;
    letter-spacing: -0.01em;
    background-image: linear-gradient(120deg, #ff33ff, #00ffff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;
