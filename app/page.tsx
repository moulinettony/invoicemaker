"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (user && isMounted) {
          router.replace("/home"); // Use replace instead of push for cleaner navigation
        } else if (isMounted) {
          setCheckingSession(false);
        }
      } catch (error) {
        if (isMounted) {
          setMessage("Error checking session");
          setCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false; // Cleanup to prevent state updates after unmount
    };
  }, [router]);

  if (checkingSession) {
    return (
      <div className="flex w-screen min-h-screen items-center justify-center bg-[#141414]">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "/insert-user",
      },
    });
  };

  return (
    <div className="flex w-screen overflow-hidden relative min-h-[calc(100vh-64px)] mt-16 items-center justify-center bg-[#141414]">
      <div className="back_noise"></div>
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>
      <div className="bg-white p-8 z-4 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold mb-1 text-neutral-800">Log in</h1>
        <p className="text-sm mb-6 text-neutral-500">
          Continue to your account
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-800">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Jon@example.com"
              required
              className="mt-1 block w-full px-3 py-2 border border-[#303030] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              className="w-full cursor-pointer bg-[#303030] border border-gray-500 outline outline-[#303030] outline-[0.3px] text-white px-4 py-2 rounded-md shadow-sm hover:bg-neutral-900 focus:outline-none"
            >
              Continue with email
            </button>
            <a
              href="#"
              className="w-full cursor-pointer mt-2 px-4 flex gap-2 justify-center text-sm py-[10px] rounded-md bg-neutral-100 hover:bg-neutral-200 focus:outline-none"
            >
              <span>
              </span>
              Sign in with passkey
            </a>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-center flex justify-center items-center gap-3 font-light text-xm text-neutral-500">
            <span className="h-[1px] bg-neutral-200 w-[35%]"></span>
            or
            <span className="h-[1px] bg-neutral-200 w-[35%]"></span>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuthLogin("google")}
              className="flex cursor-pointer items-center justify-center w-full bg-neutral-100 text-white p-4 rounded-md hover:bg-neutral-200"
            >
              <img src="https://dbzxjogjhqzxtebpvhre.supabase.co/storage/v1/object/public/images//google.svg" alt="Google" className="h-5 w-5 mr-2" />
            </button>
            <button
              onClick={() => handleOAuthLogin("apple")}
              className="flex cursor-pointer items-center justify-center w-full bg-neutral-100 text-white p-4 rounded-md hover:bg-neutral-200"
            >
              <img src="https://dbzxjogjhqzxtebpvhre.supabase.co/storage/v1/object/public/images//apple.svg" alt="Apple" className="h-5 w-5 mr-2" />
            </button>
          </div>
        </div>

        <p className="my-8 text-xs font-light">
          New User
          <a
            href="#"
            className="ml-2 text-blue-500 hover:underline"
          >
            Get started →
          </a>
        </p>


        {message && (
          <p className="text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}
