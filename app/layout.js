import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "./components/Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Onpases - Sahne Tasarım ve Teknik Prodüksiyon",
  description: "Profesyonel sahne tasarımı ve teknik prodüksiyon hizmetleri",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
