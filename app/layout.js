import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Google Forms Automation",
    description: "Generate Google Forms using Gemini AI",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.className} min-h-screen bg-neutral-50 text-neutral-900`}>
                {children}
            </body>
        </html>
    );
}
