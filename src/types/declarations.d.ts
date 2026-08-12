// mobile-app/src/types/declarations.d.ts
// Ambient TypeScript declarations for packages without bundled types

declare module 'lucide-react-native' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';

  export interface IconProps extends SvgProps {
    color?: string;
    size?: number | string;
    strokeWidth?: number | string;
  }

  export type Icon = React.FC<IconProps>;

  export const Activity: Icon;
  export const Sparkles: Icon;
  export const FileText: Icon;
  export const Heart: Icon;
  export const Shield: Icon;
  export const User: Icon;
  export const ShoppingBag: Icon;
  export const ShoppingCart: Icon;
  export const Search: Icon;
  export const Filter: Icon;
  export const CheckCircle: Icon;
  export const Edit3: Icon;
  export const Compass: Icon;
  export const Smartphone: Icon;
  export const Flame: Icon;
  export const PhoneCall: Icon;
  export const MessageCircle: Icon;
  export const Sun: Icon;
  export const Star: Icon;
  export const Award: Icon;
  export const Check: Icon;
  export const ArrowLeft: Icon;
  export const RefreshCw: Icon;
  export const BookOpen: Icon;
  export const UserCheck: Icon;
  export const Calendar: Icon;
  export const Briefcase: Icon;
  export const AlertTriangle: Icon;
  export const ShieldCheck: Icon;
  export const ChevronDown: Icon;
  export const ChevronRight: Icon;
  export const Info: Icon;
  export const X: Icon;
  export const Lock: Icon;
  export const Droplets: Icon;
  export const Wind: Icon;
  export const Globe: Icon;
}
