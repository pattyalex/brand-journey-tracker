import { useState, useEffect } from "react";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { MenuItem } from '@/types/sidebar';
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { preloadRoute } from "@/App";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarFooterSectionProps {
  settingsItem: MenuItem;
  helpItem?: MenuItem;
}

const SidebarFooterSection = ({ settingsItem, helpItem }: SidebarFooterSectionProps) => {
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { user, session } = useAuth();
  const isCollapsed = state === 'collapsed';
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);

  const fullName = user?.user_metadata?.full_name || 'User';
  const firstName = fullName.split(' ')[0];
  const metaAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Load avatar_url from profiles table (updates immediately after upload)
  useEffect(() => {
    if (!user?.id || !session?.access_token) return;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=avatar_url`, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
      .then(res => res.json())
      .then(rows => {
        if (rows?.[0]?.avatar_url) setProfileAvatarUrl(rows[0].avatar_url);
      })
      .catch(() => {});
  }, [user?.id, session?.access_token]);

  const avatarUrl = profileAvatarUrl || metaAvatarUrl;

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
                onMouseEnter={() => preloadRoute('/my-account')}
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
