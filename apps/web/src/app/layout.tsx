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
        <SideMenuWrapper>
          <DiscoverWrapper>
            <Header />
            <BodyWrapper>
              <Toaster />
              <CreateWrapper>{children}</CreateWrapper>
            </BodyWrapper>
            <Footer />
            <SideMenu />
          </DiscoverWrapper>
        </SideMenuWrapper>
      </body>
    </html>
  );
}
