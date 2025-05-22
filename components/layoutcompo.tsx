"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import UserHeader from "./UserHeader";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== "/";

  return (
    <body className="flex">
      <header className="h-16 w-screen fixed bg-white shadow border-gray-200 px-6 flex items-center justify-between z-50">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <UserHeader />
      </header>

      {showSidebar && <Sidebar />}

      <main className={showSidebar ? "ml-64 flex-1 bg-gray-200" : "flex-1"}>
        {children}
      </main>
    </body>
  );
}
