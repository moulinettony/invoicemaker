import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/layoutcompo";

export const metadata: Metadata = {
  title: "Invoice Maker",
  description: "Simple invoice app with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <LayoutShell>
        {children}
      </LayoutShell>
    </html>
  );
}
