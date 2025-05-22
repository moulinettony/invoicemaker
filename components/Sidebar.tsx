"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Users, ReceiptText, Home, LogOut, Package } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <aside className="w-64 top-16 h-[calc(100vh-64px)] text-black p-2 space-y-4 fixed">
      <nav className="space-y-2 py-5">
        <Link
          href="/home"
          className={`flex font-semibold text-sm gap-1 px-3 py-2 items-center rounded-lg hover:bg-gray-100 ${
            pathname === "/home" ? "bg-gray-100 text-blue-500" : ""
          }`}
        >
          <Home className="h-4" />
          Home
        </Link>

        <Link
          href="/clients"
          className={`flex font-semibold text-sm gap-1 px-3 py-2 items-center rounded-lg hover:bg-gray-100 ${
            pathname === "/clients" ? "bg-gray-100 text-blue-500" : ""
          }`}
        >
          <Users className="h-4" />
          Clients
        </Link>

        <Link
          href="/products"
          className={`flex font-semibold text-sm gap-1 px-3 py-2 items-center rounded-lg hover:bg-gray-100 ${
            pathname === "/products" ? "bg-gray-100 text-blue-500" : ""
          }`}
        >
          <Package className="h-4" />
          Products
        </Link>

        <Link
          href="/invoices"
          className={`flex font-semibold text-sm gap-1 px-3 py-2 items-center rounded-lg hover:bg-gray-100 ${
            pathname === "/invoices" ? "bg-gray-100 text-blue-500" : ""
          }`}
        >
          <ReceiptText className="h-4" />
          Invoices
        </Link>
        <button
          onClick={handleLogout}
          className="flex font-semibold text-sm gap-1 hover:bg-red-100 px-3 py-2 items-center rounded-lg mt-4 absolute bottom-8 text-red-500 cursor-pointer w-[calc(100%-16px)]"
        >
          <LogOut className="h-4" />
          Log Out
        </button>
      </nav>
    </aside>
  );
}
