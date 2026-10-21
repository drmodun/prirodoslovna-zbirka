import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./views/Header";
import Footer from "./views/Footer";
import { BodyWrapper } from "./utility/wrappers/bodyWrapper";
import { Toaster } from "react-hot-toast";
import SideMenu from "components/SideMenu";
import { SideMenuWrapper } from "./utility/wrappers/sideMenuWrapper";
import { DiscoverWrapper } from "./utility/wrappers/discoverWrapper";
import { CreateWrapper } from "./utility/wrappers/createWrapper";
import { ReactLenis, useLenis } from "@studio-freight/react-lenis";
import { NotificationsProvider } from "./utility/context/NotificationContext";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { LocaleSync } from "./utility/LocaleSync";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return {
    title: "Biosfera",
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DiscoverWrapper>
            <SideMenuWrapper>
              <NotificationsProvider>
                <LocaleSync />
                <Header />
                <Toaster />
                <BodyWrapper>
                  <CreateWrapper>{children}</CreateWrapper>
                </BodyWrapper>
                <Footer />
                <SideMenu />
              </NotificationsProvider>
            </SideMenuWrapper>
          </DiscoverWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
