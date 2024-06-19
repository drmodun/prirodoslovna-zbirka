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

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Biosfera",
  description:
    "Socialna platforma za deljenje znanja među učenicima i školama o raznim minearlima, biljakam, životinjama i ostalim biološkim entitetima.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        ></script>
        <DiscoverWrapper>
          <SideMenuWrapper>
            <NotificationsProvider>
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
      </body>
    </html>
  );
}
