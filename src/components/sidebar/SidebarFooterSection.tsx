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
    <SidebarFooter className="mt-auto">
      <SidebarMenu>
        {!settingsItem.hidden && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === settingsItem.url}>
              <Link
                to={settingsItem.url}
                className={cn(
                  "flex items-center gap-2",
                  location.pathname === settingsItem.url && "bg-gray-100 font-medium"
                )}
              >
                <settingsItem.icon size={20} />
                <span>{settingsItem.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        <SidebarMenuItem>
          <div className="flex items-center gap-2 px-2 py-2">
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
            <span className="text-sm">Profile</span>
          </div>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={location.pathname === myAccountItem.url}>
            <Link
              to={myAccountItem.url}
              className={cn(
                "flex items-center gap-2",
                location.pathname === myAccountItem.url && "bg-gray-100 font-medium"
              )}
            >
              <myAccountItem.icon size={20} />
              <span>{myAccountItem.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {helpItem && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === helpItem.url}>
              <Link
                to={helpItem.url}
                className={cn(
                  "flex items-center gap-2",
                  location.pathname === helpItem.url && "bg-gray-100 font-medium"
                )}
              >
                <helpItem.icon size={20} />
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