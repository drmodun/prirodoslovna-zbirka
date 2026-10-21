import c from "./page.module.scss";
import PlantPicture from "../assets/images/landing-plant.png";
import ExponatGroupPicture from "../assets/images/exponat-group.png";
import Image from "next/image";
import BaseButton from "components/BaseButton";
import Link from "next/link";
import clsx from "clsx";
import blogPost from "assets/images/blogPost.svg";
import organisationCard from "assets/images/organisationCard.png";
import LandingPageButton from "components/LandingPageButton";
import LanguageToggle from "components/LanguageToggle";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("Landing");

  return (
    <main>
      <section className={c.landingSection}>
        <div className={c.content}>
          <LanguageToggle className={c.languageToggle} />
          <h2>{t("hero.title")}</h2>
          <p>{t("hero.description")}</p>
          <LandingPageButton />
        </div>
        <Image className={c.plantImage} src={PlantPicture} alt="plant" />
      </section>

      <section className={clsx(c.landingSection, c.exponats)}>
        <div className={c.content}>
          <h2>{t("exponats.title")}</h2>
          <p>{t("exponats.description")}</p>
          <Link
            href={{
              pathname: "/discover",
              query: { kind: "exponat" },
            }}
          >
            <BaseButton className={c.button} text={t("browse")} />
          </Link>
        </div>
        <Image className={c.plantImage} src={ExponatGroupPicture} alt="plant" />
      </section>

      <section className={clsx(c.landingSection, c.posts)}>
        <div className={c.content}>
          <h2>{t("posts.title")}</h2>
          <p>{t("posts.description")}</p>
          <Link
            href={{
              pathname: "/discover",
              query: { kind: "post" },
            }}
          >
            <BaseButton className={c.button} text={t("browse")} />
          </Link>
        </div>
        <Image className={c.plantImage} src={blogPost} alt="plant" />
      </section>

      <section className={clsx(c.landingSection, c.organisations)}>
        <div className={c.content}>
          <h2>{t("organisations.title")}</h2>
          <p>{t("organisations.description")}</p>
          <Link
            href={{
              pathname: "/discover",
              query: { kind: "organisation" },
            }}
          >
            <BaseButton className={c.button} text={t("browse")} />
          </Link>
          <Link href="/createOrganisation">
            <BaseButton
              className={c.altButton}
              text={t("organisations.create")}
            />
          </Link>
        </div>
        <Image className={c.plantImage} src={organisationCard} alt="plant" />
      </section>
    </main>
  );
}
