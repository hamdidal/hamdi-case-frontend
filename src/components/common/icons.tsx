import type React from 'react';
import {
  AppstoreOutlined,
  InboxOutlined,
  TagOutlined,
  LineChartOutlined,
  TeamOutlined,
  SafetyOutlined,
  SettingOutlined,
  SunOutlined,
  SearchOutlined,
  EyeOutlined,
  RightOutlined,
  LogoutOutlined,
  MenuOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined,
  HistoryOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import AntIcon from '@ant-design/icons';

export interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

type AntIconComponent = React.ComponentType<{ style?: React.CSSProperties; className?: string }>;

function makeIcon(AntDIcon: AntIconComponent) {
  return function WrappedIcon({ size, style, className }: IconProps) {
    return <AntDIcon style={{ fontSize: size, ...style }} className={className} />;
  };
}

export const IconDashboard   = makeIcon(AppstoreOutlined);
export const IconBox         = makeIcon(InboxOutlined);
export const IconTag         = makeIcon(TagOutlined);
export const IconActivity    = makeIcon(LineChartOutlined);
export const IconUsers       = makeIcon(TeamOutlined);
export const IconShield      = makeIcon(SafetyOutlined);
export const IconSettings    = makeIcon(SettingOutlined);
export const IconSun         = makeIcon(SunOutlined);
export const IconSearch      = makeIcon(SearchOutlined);
export const IconEye         = makeIcon(EyeOutlined);
export const IconChevronRight = makeIcon(RightOutlined);
export const IconLogout      = makeIcon(LogoutOutlined);
export const IconMenu        = makeIcon(MenuOutlined);
export const IconPencil      = makeIcon(EditOutlined);
export const IconTrash       = makeIcon(DeleteOutlined);
export const IconCopy        = makeIcon(CopyOutlined);
export const IconDownload    = makeIcon(DownloadOutlined);
export const IconHistory     = makeIcon(HistoryOutlined);
export const IconGlobe       = makeIcon(GlobalOutlined);

const MoonSvg = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

const RecycleSvg = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 19H4a2 2 0 0 1-1.73-3l4-7" />
    <path d="m17 14 3 3-3 3" />
    <path d="M14 17h6a2 2 0 0 0 1.7-3l-2-3.5" />
    <path d="m10 4 2-2 2 2" />
    <path d="m9.5 16 1.5 3" />
  </svg>
);

const WashSvg = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18l-1 14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L3 6Z" />
    <path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
    <path d="M7 14c1.5-1 3.5-1 5 0s3.5 1 5 0" />
  </svg>
);

const IronSvg = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17h18l-2-5a4 4 0 0 0-3.6-2.4H8.5A4 4 0 0 0 4.9 12L3 17Z" />
    <path d="M3 17v3M21 17v3M9 9V5h6v4" />
  </svg>
);

const DrySvg = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const BleachSvg = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 18 12 4l8 14H4Z" />
  </svg>
);

function makeCustomIcon(SvgComponent: React.ComponentType) {
  return function CustomIcon({ size, style, className }: IconProps) {
    return <AntIcon component={SvgComponent} style={{ fontSize: size, ...style }} className={className} />;
  };
}

export const IconMoon    = makeCustomIcon(MoonSvg);
export const IconRecycle = makeCustomIcon(RecycleSvg);
export const IconWash    = makeCustomIcon(WashSvg);
export const IconIron    = makeCustomIcon(IronSvg);
export const IconDry     = makeCustomIcon(DrySvg);
export const IconBleach  = makeCustomIcon(BleachSvg);
