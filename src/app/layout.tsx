import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "PostSpark - Parceiro Criativo Digital",
    description: "Transforme suas ideias em posts incríveis. Sem paralisia do design, sem fricção criativa.",
    keywords: ["posts", "design", "ai", "criativo", "marketing", "social media"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className={`${inter.variable} font-sans antialiased`}>
                <UserProvider>
                    {children}
                </UserProvider>
            </body>
        </html>
    );
}
