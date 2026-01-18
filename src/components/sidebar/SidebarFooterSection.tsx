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

interface SidebarFooterSectionProps {
  settingsItem: MenuItem;
  myAccountItem: MenuItem;
  helpItem?: MenuItem;
}

const SidebarFooterSection = ({ settingsItem, myAccountItem, helpItem }: SidebarFooterSectionProps) => {
  return (
    <SidebarFooter className="mt-auto">
      <SidebarMenu>
        {!settingsItem.hidden && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href={settingsItem.url} className="flex items-center gap-2">
                <settingsItem.icon size={20} />
                <span>{settingsItem.title}</span>
              </a>
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
          <SidebarMenuButton asChild>
            <a href={myAccountItem.url} className="flex items-center gap-2">
              <myAccountItem.icon size={20} />
              <span>{myAccountItem.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {helpItem && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href={helpItem.url} className="flex items-center gap-2">
                <helpItem.icon size={20} />
                <span>{helpItem.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default SidebarFooterSection;