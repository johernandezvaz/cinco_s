import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const condensed = Barlow_Condensed({ subsets: ["latin"], variable: "--font-condensed", weight: ["600", "700"] });
export const metadata: Metadata = { title: "5S · Auditoría de estaciones", description: "Check-lists 5S para manufactura" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body className={`${inter.variable} ${condensed.variable}`}>{children}</body></html>; }
