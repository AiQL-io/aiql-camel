"use client";

import React, { useId } from "react";
import styled from "styled-components";

export function Logo({
  variant = "full",
  size = 28,
  productName = "Manhal",
  showBy = true,
  style = {},
  ...rest
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `manhalGrad_${uid}`;
  const maskId = `manhalMask_${uid}`;

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="12 12 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <mask
        id={maskId}
        style={{ maskType: "luminance" }}
        maskUnits="userSpaceOnUse"
        x="12"
        y="12"
        width="24"
        height="24"
      >
        <path
          d="M15.796 16.5629C13.7184 18.6403 12.6421 21.1606 12.6421 24.331C12.6421 27.5012 13.6234 30.1161 15.7008 32.1938C17.7784 34.2712 20.3935 35.9079 23.5639 35.9079C26.7341 35.9079 29.7762 34.6979 31.8535 32.6205C33.931 30.543 35.3335 27.5012 35.3335 24.331C35.3335 21.1606 33.2002 18.8495 31.1227 16.772C29.0453 14.6944 26.7341 12.0552 23.5639 12.0552C20.3935 12.0552 17.8735 14.4854 15.796 16.5629ZM16.6579 25.4434C16.6579 21.8498 19.5698 18.9379 23.1635 18.9379C26.7549 18.9379 29.6688 21.8498 29.6688 25.4434C29.6688 29.035 26.7549 31.9488 23.1635 31.9488C19.5698 31.9488 16.6579 29.035 16.6579 25.4434Z"
          fill="white"
        />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.796 16.5629C13.7184 18.6403 12.6421 21.1606 12.6421 24.331C12.6421 27.5012 13.6234 30.1161 15.7008 32.1938C17.7784 34.2712 20.3935 35.9079 23.5639 35.9079C26.7341 35.9079 29.7762 34.6979 31.8535 32.6205C33.931 30.543 35.3335 27.5012 35.3335 24.331C35.3335 21.1606 33.2002 18.8495 31.1227 16.772C29.0453 14.6944 26.7341 12.0552 23.5639 12.0552C20.3935 12.0552 17.8735 14.4854 15.796 16.5629ZM16.6579 25.4434C16.6579 21.8498 19.5698 18.9379 23.1635 18.9379C26.7549 18.9379 29.6688 21.8498 29.6688 25.4434C29.6688 29.035 26.7549 31.9488 23.1635 31.9488C19.5698 31.9488 16.6579 29.035 16.6579 25.4434Z"
          fill={`url(#${gradId})`}
        />
      </g>
      <defs>
        <linearGradient
          id={gradId}
          x1="35.3221"
          y1="36.214"
          x2="12.3436"
          y2="12.8097"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF33FF" />
          <stop offset="1" stopColor="#00FFFF" />
        </linearGradient>
      </defs>
    </svg>
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
    font-size: ${(p) => p.$size * 0.61}px;
    letter-spacing: -0.01em;
    color: var(--fg);
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
