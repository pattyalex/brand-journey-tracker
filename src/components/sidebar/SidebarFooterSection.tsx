import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { MenuItem } from '@/types/sidebar';
import { UserButton } from "@clerk/clerk-react";
import { MembershipPage } from "@/components/MembershipPage";
import { CreditCard } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarFooterSectionProps {
  settingsItem: MenuItem;
  helpItem?: MenuItem;
}

const SidebarFooterSection = ({ settingsItem, helpItem }: SidebarFooterSectionProps) => {
  const location = useLocation();

  return (
    <SidebarFooter className="mt-auto border-t border-[#E8E4E6] pt-2 relative z-10">
      <SidebarMenu>
        {!settingsItem.hidden && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === settingsItem.url}>
              <Link
                to={settingsItem.url}
                className={cn(
                  "flex items-center gap-2 rounded-xl transition-all duration-200",
                  location.pathname === settingsItem.url
                    ? "bg-[#F5F0F3] text-[#612A4F] font-medium"
                    : "hover:bg-[#F9F7F8] text-[#5A4A52]"
                )}
              >
                <settingsItem.icon size={20} className={cn(
                  "transition-colors duration-200",
                  location.pathname === settingsItem.url ? "text-[#612A4F]" : "text-[#8B7082]"
                )} />
                <span>{settingsItem.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        <SidebarMenuItem>
          <div className="flex items-center px-2 py-1.5">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7"
                }
              }}
            >
              <UserButton.UserProfilePage
                label="Membership"
                labelIcon={<CreditCard size={16} />}
                url="membership"
              >
                <MembershipPage />
              </UserButton.UserProfilePage>
            </UserButton>
          </div>
        </SidebarMenuItem>

        {helpItem && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === helpItem.url}>
              <Link
                to={helpItem.url}
                className={cn(
                  "flex items-center gap-2 rounded-xl transition-all duration-200",
                  location.pathname === helpItem.url
                    ? "bg-[#F5F0F3] text-[#612A4F] font-medium"
                    : "hover:bg-[#F9F7F8] text-[#5A4A52]"
                )}
              >
                <helpItem.icon size={20} className={cn(
                  "transition-colors duration-200",
                  location.pathname === helpItem.url ? "text-[#612A4F]" : "text-[#8B7082]"
                )} />
                <span>{helpItem.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default SidebarFooterSection;