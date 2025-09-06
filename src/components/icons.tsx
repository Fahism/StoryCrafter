import type { SVGProps } from "react";

export function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3v2.35l.94.47.94-.47V3M12 21v-2.35l-.94-.47-.94.47V21M3 12h2.35l.47.94-.47.94H3M21 12h-2.35l-.47-.94.47-.94H21M7.06 7.06l1.66 1.66.7.7-.7.7-1.66 1.66M16.94 16.94l-1.66-1.66-.7-.7.7-.7 1.66-1.66M7.06 16.94l1.66-1.66.7-.7-.7-.7-1.66-1.66M16.94 7.06l-1.66 1.66-.7.7.7.7 1.66 1.66" />
      <style>
        {`
          @keyframes sparkle-anim {
            0% { transform: scale(0.8) rotate(0deg); opacity: 0.7; }
            50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
            100% { transform: scale(0.8) rotate(360deg); opacity: 0.7; }
          }
          path {
            animation: sparkle-anim 2s linear infinite;
          }
        `}
      </style>
    </svg>
  );
}
