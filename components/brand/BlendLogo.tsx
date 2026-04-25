import * as React from 'react';

type LogoProps = {
  className?: string;
  title?: string;
};

function svgAccessibilityProps(title?: string) {
  return title
    ? { role: 'img' as const, 'aria-label': title }
    : { 'aria-hidden': true as const };
}

export function BlendLogo({ className, title = 'Blend Perfume' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 760 460"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgAccessibilityProps(title)}
    >
      <rect x="18" y="18" width="724" height="424" rx="42" fill="#D2D2D6" />
      <rect x="38" y="38" width="684" height="384" rx="34" fill="#060606" stroke="#1A1A1A" strokeWidth="4" />

      <text
        x="82"
        y="208"
        fill="#FFFFFF"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="156"
        letterSpacing="8"
      >
        BL
      </text>
      <text
        x="446"
        y="208"
        fill="#FFFFFF"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="156"
        letterSpacing="8"
      >
        ND
      </text>

      <g>
        <rect x="338" y="54" width="54" height="44" rx="12" fill="#FFFFFF" />
        <rect x="327" y="88" width="76" height="26" rx="10" fill="#FFFFFF" />
        <circle cx="365" cy="170" r="72" stroke="#FFFFFF" strokeWidth="26" />
        <rect x="320" y="216" width="90" height="52" rx="26" fill="#060606" />
        <rect x="352" y="148" width="126" height="46" rx="10" fill="#B51919" />
        <text
          x="415"
          y="178"
          fill="#111111"
          fontFamily="Arial Black, Helvetica, sans-serif"
          fontSize="22"
          textAnchor="middle"
        >
          BLEND
        </text>
      </g>

      <rect x="40" y="270" width="680" height="18" fill="#C8C8CC" />

      <text
        x="380"
        y="360"
        fill="#FFFFFF"
        fontFamily="Georgia, Times New Roman, serif"
        fontSize="48"
        fontWeight="700"
        letterSpacing="7"
        textAnchor="middle"
      >
        MAKE OWN PERFUME
      </text>
    </svg>
  );
}

export function BlendMark({ className, title = 'Blend Perfume icon' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgAccessibilityProps(title)}
    >
      <rect x="20" y="20" width="472" height="472" rx="88" fill="#D2D2D6" />
      <rect x="48" y="48" width="416" height="416" rx="72" fill="#060606" stroke="#1A1A1A" strokeWidth="6" />
      <rect x="220" y="94" width="72" height="48" rx="16" fill="#FFFFFF" />
      <rect x="206" y="126" width="100" height="34" rx="12" fill="#FFFFFF" />
      <circle cx="256" cy="252" r="110" stroke="#FFFFFF" strokeWidth="40" />
      <rect x="186" y="312" width="140" height="82" rx="40" fill="#060606" />
      <rect x="232" y="214" width="178" height="66" rx="14" fill="#B51919" />
      <text
        x="321"
        y="255"
        fill="#111111"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="34"
        textAnchor="middle"
      >
        BLEND
      </text>
    </svg>
  );
}
