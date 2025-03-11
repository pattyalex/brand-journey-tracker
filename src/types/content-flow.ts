
import { LucideIcon } from "lucide-react";

export interface Platform {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface ContentItem {
  id: string;
  platformId: string;
  day: string;
  title: string;
  description?: string;
  time?: string;
}
