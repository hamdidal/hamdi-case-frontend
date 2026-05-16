import type { SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  size?: number;
  strokeWidth?: number;
}

function Icon({ size = 18, strokeWidth = 1.6, stroke = 'currentColor', fill = 'none', children, ...rest }: IconProps & { children?: React.ReactNode }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={stroke}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconDashboard(p: IconProps) {
  return <Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></Icon>;
}

export function IconBox(p: IconProps) {
  return <Icon {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v9"/></Icon>;
}

export function IconTag(p: IconProps) {
  return <Icon {...p}><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"/><circle cx="7" cy="7" r="1.2"/></Icon>;
}

export function IconActivity(p: IconProps) {
  return <Icon {...p}><path d="M3 12h4l3-9 4 18 3-9h4"/></Icon>;
}

export function IconUsers(p: IconProps) {
  return <Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
}

export function IconShield(p: IconProps) {
  return <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></Icon>;
}

export function IconSettings(p: IconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></Icon>;
}

export function IconSun(p: IconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></Icon>;
}

export function IconMoon(p: IconProps) {
  return <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></Icon>;
}

export function IconBell(p: IconProps) {
  return <Icon {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Icon>;
}

export function IconSearch(p: IconProps) {
  return <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></Icon>;
}

export function IconChevronDown(p: IconProps) {
  return <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>;
}

export function IconChevronRight(p: IconProps) {
  return <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>;
}

export function IconPlus(p: IconProps) {
  return <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
}

export function IconPencil(p: IconProps) {
  return <Icon {...p}><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></Icon>;
}

export function IconTrash(p: IconProps) {
  return <Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></Icon>;
}

export function IconEye(p: IconProps) {
  return <Icon {...p}><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></Icon>;
}

export function IconDownload(p: IconProps) {
  return <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></Icon>;
}

export function IconFilter(p: IconProps) {
  return <Icon {...p}><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3Z"/></Icon>;
}

export function IconGlobe(p: IconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></Icon>;
}

export function IconLogout(p: IconProps) {
  return <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></Icon>;
}

export function IconQR(p: IconProps) {
  return <Icon {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM21 14v3M14 21h3M21 18v3"/></Icon>;
}

export function IconHistory(p: IconProps) {
  return <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></Icon>;
}

export function IconCheck(p: IconProps) {
  return <Icon {...p}><path d="m5 12 5 5L20 7"/></Icon>;
}

export function IconX(p: IconProps) {
  return <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>;
}

export function IconInbox(p: IconProps) {
  return <Icon {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></Icon>;
}

export function IconWash(p: IconProps) {
  return <Icon {...p}><path d="M3 6h18l-1 14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L3 6Z"/><path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><path d="M7 14c1.5-1 3.5-1 5 0s3.5 1 5 0"/></Icon>;
}

export function IconIron(p: IconProps) {
  return <Icon {...p}><path d="M3 17h18l-2-5a4 4 0 0 0-3.6-2.4H8.5A4 4 0 0 0 4.9 12L3 17Z"/><path d="M3 17v3M21 17v3M9 9V5h6v4"/></Icon>;
}

export function IconDry(p: IconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
}

export function IconBleach(p: IconProps) {
  return <Icon {...p}><path d="M4 18 12 4l8 14H4Z"/></Icon>;
}

export function IconRecycle(p: IconProps) {
  return <Icon {...p}><path d="M7 19H4a2 2 0 0 1-1.73-3l4-7"/><path d="m17 14 3 3-3 3"/><path d="M14 17h6a2 2 0 0 0 1.7-3l-2-3.5"/><path d="m10 4 2-2 2 2"/><path d="m9.5 16 1.5 3"/></Icon>;
}

export function IconServer(p: IconProps) {
  return <Icon {...p}><rect x="2" y="3" width="20" height="8" rx="2"/><rect x="2" y="13" width="20" height="8" rx="2"/><path d="M6 7h.01M6 17h.01"/></Icon>;
}

export function IconCpu(p: IconProps) {
  return <Icon {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></Icon>;
}

export function IconMem(p: IconProps) {
  return <Icon {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10v4M10 10v4M14 10v4M18 10v4"/></Icon>;
}

export function IconDisk(p: IconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></Icon>;
}

export function IconArrowUp(p: IconProps) {
  return <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>;
}

export function IconArrowDown(p: IconProps) {
  return <Icon {...p}><path d="M12 5v14M5 12l7 7 7-7"/></Icon>;
}

export function IconMenu(p: IconProps) {
  return <Icon {...p}><path d="M3 12h18M3 6h18M3 18h18"/></Icon>;
}

export function IconCopy(p: IconProps) {
  return <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>;
}

export function IconMore(p: IconProps) {
  return <Icon {...p}><circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none"/></Icon>;
}

export function IconLeaf(p: IconProps) {
  return <Icon {...p}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 5 2 8a7 7 0 0 1-7 7Z"/><path d="M2 22c1.5-3 4-5 8-7"/></Icon>;
}
