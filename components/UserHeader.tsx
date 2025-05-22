"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UserHeader() {
  const [name, setName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const metadata = user?.user_metadata;
      setName(metadata?.name || null);
      setAvatarUrl(metadata?.avatar_url || null); // available from Google/GitHub
    });
  }, []);

  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      {name && (
        <div className="w-8 h-8 flex items-center justify-center font-semibold rounded-lg bg-blue-600 font-medium text-white text-xs">
          {name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
      )}
      <span>{name ? name : ""}</span>
    </div>
  );
}
