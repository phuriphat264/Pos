import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "POS แม่ค้า",
  description: "ระบบ POS รวดเร็ว ยืดหยุ่น สำหรับหน้าจอสัมผัส",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.className} bg-gray-50 text-gray-900 h-screen flex flex-col overflow-hidden`}>
        <Navbar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
