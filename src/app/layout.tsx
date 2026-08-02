import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "BloFin Voucher-Aware Funding Monitor", description: "Read-only public funding monitor" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
