import { Montserrat, Mulish, DM_Mono } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from "@/lib/registry";
import { ThemeProvider } from "@/imports/core/providers/ThemeProvider.jsx";
import { I18nProvider } from "@/imports/core/providers/I18nProvider.jsx";
import { RoleProvider } from "@/imports/core/providers/RoleProvider.jsx";
import { Shell } from "@/imports/core/components/Shell.jsx";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata = {
  title: "Manhal — DNA Identity & Genetic Intelligence",
  description:
    "National camel genetic-intelligence platform. DNA identity, parentage verification, and population genetics.",
};

const themeScript = `(function(){try{var t=localStorage.getItem('manhal.theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);var l=localStorage.getItem('manhal.locale');if(l==='ar'){document.documentElement.setAttribute('lang','ar');document.documentElement.setAttribute('dir','rtl');}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-theme="light"
      className={`${mulish.variable} ${montserrat.variable} ${dmMono.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <StyledComponentsRegistry>
          <ThemeProvider>
            <I18nProvider>
              <RoleProvider>
                <Shell>{children}</Shell>
              </RoleProvider>
            </I18nProvider>
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
