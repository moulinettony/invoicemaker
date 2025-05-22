'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function InsertUserPage() {
  const router = useRouter();

  useEffect(() => {
    const insertUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (user) {
        await supabase.from('user').upsert({
          user_id: user.id,
          email: user.email,
          name: user.user_metadata.full_name || user.user_metadata.name || '',
        });
      }

      router.push('/home');
    };

    insertUser();
  }, [router]);

  return <p className="text-center mt-10">Redirecting...</p>;
}
