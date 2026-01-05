
import { Home, FolderOpen, FileText, Settings, Database, CreditCard, Calendar, TrendingUp, BarChart, HelpCircle, CheckSquare, Clipboard, CheckCircle, Handshake, Clapperboard, Sparkles } from 'lucide-react';
import { MenuItem } from '@/types/sidebar';

export const defaultMenuItems: MenuItem[] = [
  { title: 'Home Page', icon: Home, url: '/home-page', isDeletable: false },
  { title: 'Planner', icon: CheckCircle, url: '/task-board', isDeletable: false },
  {
    title: 'Content Hub',
    icon: Database,
    url: '/bank-of-content',
    isDeletable: false
  },
  {
    title: 'Calendar',
    icon: Calendar,
    url: '/content-calendar',
    isDeletable: false
  },
  {
    title: 'Production',
    icon: Clapperboard,
    url: '/production',
    isDeletable: false
  },
  {
    title: 'Partnerships',
    icon: Handshake,
    url: '/collab-management',
    isDeletable: false
  },
  {
    title: 'Strategy and Growth',
    icon: TrendingUp,
    url: '/strategy-growth',
    isDeletable: false
  },
];

export const settingsItem: MenuItem = { title: 'Settings', icon: Settings, url: '/settings', isDeletable: false, hidden: true };
export const myAccountItem: MenuItem = { title: 'My Account', icon: CreditCard, url: '/my-account', isDeletable: false };
export const helpItem: MenuItem = { title: 'Help', icon: HelpCircle, url: '/help', isDeletable: false };
