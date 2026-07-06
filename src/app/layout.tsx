import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "WC2026 Predict — FIFA World Cup 2026 Prediction Game",
  description:
    "Predict the FIFA World Cup 2026 knockout stage. Who gets it right wins the glory!",
};

export const viewport: Viewport = {
  themeColor: "#060B1E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-wc-navy text-white antialiased min-h-screen bg-mesh">
        <AuthProvider>
          <Navbar />
          <main className="pt-16 min-h-screen">{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#0D1535",
                color: "#fff",
                border: "1px solid rgba(245,184,0,0.3)",
                borderRadius: "12px",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
