"use client";
import c from "./page.module.scss";
import PlantPicture from "../assets/images/landing-plant.png";
import ExponatGroupPicture from "../assets/images/exponat-group.png";
import Image from "next/image";
import BaseButton from "components/BaseButton";
import Link from "next/link";
import clsx from "clsx";
import blogPost from "assets/images/blogPost.svg";
import organisationCard from "assets/images/organisationCard.png";
import { useGetMe } from "./api/useGetMe";

export default function Home() {
  const { data: me } = useGetMe();

  return (
    <main>
      <section className={c.landingSection}>
        <div className={c.content}>
          <h2>Vaša digitalna zbirka.</h2>
          <p>
            Jednostavno prikažite sadržaj prirodoslovne zbirke vaše ustanove u
            samo nekoliko klikova!
          </p>

          {!me ? (
            <Link href="/login">
              <BaseButton className={c.button} text="Prijavi se" />
            </Link>
          ) : (
            <Link href="/discover">
              <BaseButton className={c.button} text="Pregledaj sadržaj" />
            </Link>
          )}
        </div>
        <Image className={c.plantImage} src={PlantPicture} alt="plant" />
      </section>

      <section className={clsx(c.landingSection, c.exponats)}>
        <div className={c.content}>
          <h2>Pregledaj eksponate</h2>
          <p>Pogledaj sadržaj prirodoslovnih zbirki svih organizacija.</p>
          <Link
            href={{
              pathname: "/discover",
              query: { kind: "exponat" },
            }}
          >
            <BaseButton className={c.button} text="Pregledaj" />
          </Link>
        </div>
        <Image className={c.plantImage} src={ExponatGroupPicture} alt="plant" />
      </section>

      <section className={clsx(c.landingSection, c.posts)}>
        <div className={c.content}>
          <h2>Pregledaj objave</h2>
          <p>
            Pogledajte objave korisnika o eksponatima, sve informacije i
            zanimljivosti
          </p>
          <Link
            href={{
              pathname: "/discover",
              query: { kind: "post" },
            }}
          >
            <BaseButton className={c.button} text="Pregledaj" />
          </Link>
        </div>
        <Image className={c.plantImage} src={blogPost} alt="plant" />
      </section>

      <section className={clsx(c.landingSection, c.organisations)}>
        <div className={c.content}>
          <h2>Pregledaj organizacije</h2>
          <p>
            Pogledajte sve organizacije koje su se pridružile platformi i
            pregledajte njihove eksponate, objave i članove
          </p>
          <Link
            href={{
              pathname: "/discover",
              query: { kind: "organisation" },
            }}
          >
            <BaseButton className={c.button} text="Pregledaj" />
          </Link>
          <Link href="/createOrganisation">
            <BaseButton className={c.altButton} text="Stvori organizaciju" />
          </Link>
        </div>
        <Image className={c.plantImage} src={organisationCard} alt="plant" />
      </section>
    </main>
  );
}
