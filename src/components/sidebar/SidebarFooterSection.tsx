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
  myAccountItem: MenuItem;
  helpItem?: MenuItem;
}

const SidebarFooterSection = ({ settingsItem, myAccountItem, helpItem }: SidebarFooterSectionProps) => {
  const location = useLocation();

  return (
    <SidebarFooter className="mt-auto border-t border-[#E8E4E6] pt-2 relative z-10">
      <SidebarMenu>
        {!settingsItem.hidden && (
          <SidebarMenuItem className="relative">
            {location.pathname === settingsItem.url && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-6 rounded-r-full"
                style={{
                  background: 'linear-gradient(180deg, #612A4F 0%, #4A1F3D 100%)',
                  boxShadow: '0 0 8px rgba(97, 42, 79, 0.4)',
                }}
              />
            )}
            <SidebarMenuButton asChild isActive={location.pathname === settingsItem.url}>
              <Link
                to={settingsItem.url}
                className={cn(
                  "flex items-center gap-2 rounded-xl ml-1 transition-all duration-200",
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
          <div className="flex items-center gap-2 px-2 py-2 ml-1">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
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
            <span className="text-sm text-[#5A4A52]">Profile</span>
          </div>
        </SidebarMenuItem>

        <SidebarMenuItem className="relative">
          {location.pathname === myAccountItem.url && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-6 rounded-r-full"
              style={{
                background: 'linear-gradient(180deg, #612A4F 0%, #4A1F3D 100%)',
                boxShadow: '0 0 8px rgba(97, 42, 79, 0.4)',
              }}
            />
          )}
          <SidebarMenuButton asChild isActive={location.pathname === myAccountItem.url}>
            <Link
              to={myAccountItem.url}
              className={cn(
                "flex items-center gap-2 rounded-xl ml-1 transition-all duration-200",
                location.pathname === myAccountItem.url
                  ? "bg-[#F5F0F3] text-[#612A4F] font-medium"
                  : "hover:bg-[#F9F7F8] text-[#5A4A52]"
              )}
            >
              <myAccountItem.icon size={20} className={cn(
                "transition-colors duration-200",
                location.pathname === myAccountItem.url ? "text-[#612A4F]" : "text-[#8B7082]"
              )} />
              <span>{myAccountItem.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {helpItem && (
          <SidebarMenuItem className="relative">
            {location.pathname === helpItem.url && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-6 rounded-r-full"
                style={{
                  background: 'linear-gradient(180deg, #612A4F 0%, #4A1F3D 100%)',
                  boxShadow: '0 0 8px rgba(97, 42, 79, 0.4)',
                }}
              />
            )}
            <SidebarMenuButton asChild isActive={location.pathname === helpItem.url}>
              <Link
                to={helpItem.url}
                className={cn(
                  "flex items-center gap-2 rounded-xl ml-1 transition-all duration-200",
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