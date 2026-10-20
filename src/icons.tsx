import type { CSSProperties, ReactNode } from "react";
import type { CategoryId } from "./data/types";

interface IconProps {
  style?: CSSProperties;
}

function Svg({ style, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const FrontendIcon = (props: IconProps) => (
  <Svg {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </Svg>
);

export const JavaIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M8 16c-2 1-2 2 0 3 3 1 8 1 10-1" />
    <path d="M7 12c-2 1-2 2 1 3 3 1 7 1 9-1" />
    <path d="M10 8c2-4 6-5 8-3-3 1-4 3-3 5" />
    <path d="M9 19c2 2 7 2 10 0" />
  </Svg>
);

export const BackendIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="6" rx="1" />
    <rect x="3" y="14" width="18" height="6" rx="1" />
    <path d="M7 7h.01M7 17h.01" />
  </Svg>
);

export const OpsIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
  </Svg>
);

export const AlgoIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
  </Svg>
);

export const DatabaseIcon = (props: IconProps) => (
  <Svg {...props}>
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
    <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
  </Svg>
);

export const NetworkIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.8 2.5 15.2 0 18M12 3c-2.5 2.8-2.5 15.2 0 18" />
  </Svg>
);

export const OsIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="12" rx="1" />
    <path d="M8 20h8M12 16v4" />
  </Svg>
);

const ICONS: Record<CategoryId, (props: IconProps) => JSX.Element> = {
  frontend: FrontendIcon,
  java: JavaIcon,
  backend: BackendIcon,
  ops: OpsIcon,
  algorithm: AlgoIcon,
  database: DatabaseIcon,
  network: NetworkIcon,
  os: OsIcon,
};

export function CategoryIcon({
  id,
  style,
}: {
  id: string;
  style?: CSSProperties;
}) {
  const Icon = ICONS[id as CategoryId] ?? FrontendIcon;
  return <Icon style={style} />;
}

export function categoryIconComponent(
  id: string,
): (props: IconProps) => JSX.Element {
  return ICONS[id as CategoryId] ?? FrontendIcon;
}
