import React from 'react';

interface TalkBubbleLogoProps {
  className?: string;
}

export const TalkBubbleLogo: React.FC<TalkBubbleLogoProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      role="img"
      aria-label="Talk.ItOut logo"
    >
      <path
        d="M35 18h150c17 0 31 14 31 31v86c0 17-14 31-31 31h-70l-26 48v-48H35c-17 0-31-14-31-31V49C4 32 18 18 35 18Z"
        fill="#fff8f0"
        stroke="#0f0805"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M110 75c18-30 62-30 72 8 5 19-4 35-17 47l-55 48-55-48c-13-12-22-28-17-47 10-38 54-38 72-8Z"
        fill="#990f16"
        stroke="#0f0805"
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <circle cx="95" cy="108" r="14" fill="#0f0805" />
      <circle cx="147" cy="108" r="14" fill="#0f0805" />
      <circle cx="90" cy="102" r="4.5" fill="#fff" opacity={0.9} />
      <circle cx="142" cy="102" r="4.5" fill="#fff" opacity={0.9} />
      <path
        d="M118 134c0 7 10 7 10 0"
        stroke="#0f0805"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <text
        x="110"
        y="50"
        textAnchor="middle"
        fill="#0f0805"
        fontSize="28"
        fontWeight="700"
        fontFamily="'Nunito', 'Inter', sans-serif"
      >
        Talk.ItOut
      </text>
      <text
        x="165"
        y="170"
        fill="#0f0805"
        fontSize="20"
        fontWeight="700"
        fontFamily="'Nunito', 'Inter', sans-serif"
        transform="rotate(25 165 170)"
      >
        One Talk Away
      </text>
    </svg>
  );
};

