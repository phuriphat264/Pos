import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import dynamic from 'next/dynamic';
import { AuthGuard } from "@/components/AuthGuard";

const inter = Inter({ subsets: ["latin"] });
const FirebaseSync = dynamic(() => import('@/components/FirebaseSync'), { ssr: false });

export const metadata: Metadata = {
  title: "POS ยายกับตาพาณิชย์",
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
        <AuthGuard>
          <FirebaseSync />
          <Navbar />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </AuthGuard>
      </body>
    </html>
  );
}
