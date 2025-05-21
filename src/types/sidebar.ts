import { LucideIcon } from 'lucide-react';

export type MenuItem = {
  title: string;
  icon: LucideIcon;
  url: string;
  isDeletable?: boolean;
  subItems?: Array<{
    title: string;
    icon: LucideIcon;
    url: string;
  }>;
};