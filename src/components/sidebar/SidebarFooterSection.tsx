import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import { MenuItem } from '@/types/sidebar';
import { CreditCard, User, LogOut } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarFooterSectionProps {
  settingsItem: MenuItem;
  helpItem?: MenuItem;
}

const SidebarFooterSection = ({ settingsItem, helpItem }: SidebarFooterSectionProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const isCollapsed = state === 'collapsed';

  // Get user info
  const fullName = user?.user_metadata?.full_name || 'User';
  const email = user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SidebarFooter className="mt-auto border-t border-[#E8E4E6] pt-2 relative z-10">
      <SidebarMenu>
        {!settingsItem.hidden && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === settingsItem.url} tooltip={settingsItem.title}>
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
                  "transition-colors duration-200 flex-shrink-0",
                  location.pathname === settingsItem.url ? "text-[#612A4F]" : "text-[#8B7082]"
                )} />
                <span>{settingsItem.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {user && (
          <SidebarMenuItem>
            <div className={cn(
              "flex items-center py-1.5",
              isCollapsed ? "justify-center px-0" : "px-2"
            )}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 w-full hover:bg-[#F9F7F8] p-2 rounded-xl transition-colors">
                    <Avatar className="h-7 w-7">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
                      <AvatarFallback className="bg-[#612A4F] text-white text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="text-sm font-medium text-[#1a1523] truncate w-full tracking-normal">
                          {fullName}
                        </span>
                        <span className="text-xs text-[#8B7082] truncate w-full tracking-normal">
                          {email}
                        </span>
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/my-account')}>
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/membership')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Membership
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarMenuItem>
        )}

        {helpItem && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === helpItem.url} tooltip={helpItem.title}>
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
                  "transition-colors duration-200 flex-shrink-0",
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
