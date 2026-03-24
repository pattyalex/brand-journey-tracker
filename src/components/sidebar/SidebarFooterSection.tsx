import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { MenuItem } from '@/types/sidebar';
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarFooterSectionProps {
  settingsItem: MenuItem;
  helpItem?: MenuItem;
}

const SidebarFooterSection = ({ settingsItem, helpItem }: SidebarFooterSectionProps) => {
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { user } = useAuth();
  const isCollapsed = state === 'collapsed';

  const fullName = user?.user_metadata?.full_name || 'User';
  const firstName = fullName.split(' ')[0];
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SidebarFooter className="mt-auto border-t border-[#E8E4E6] pt-2 relative z-10">
      <SidebarMenu>
        {(
          <SidebarMenuItem>
            <div className={cn(
              "flex items-center py-1.5",
              isCollapsed ? "justify-center px-0" : "px-2"
            )}>
              <button
                type="button"
                onClick={() => navigate('/my-account')}
                className="flex items-center gap-2 w-full hover:bg-[#F9F7F8] p-2 rounded-xl transition-colors"
              >
                <Avatar className="h-7 w-7 flex-shrink-0">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={firstName} />}
                  <AvatarFallback className="bg-[#612A4F] text-white text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <span className="text-sm font-medium text-[#1a1523] truncate tracking-normal">
                    {firstName}
                  </span>
                )}
              </button>
            </div>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default SidebarFooterSection;
