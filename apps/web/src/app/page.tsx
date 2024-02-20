import c from "./page.module.scss";
import PlantPicture from "../assets/images/landing-plant.png";
import ExponatGroupPicture from "../assets/images/exponat-group.png";
import Image from "next/image";
import BaseButton from "components/BaseButton";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className={c.landingSection}>
        <div className={c.content}>
          <h2>Vaša digitalna zbirka.</h2>
          <p>
            Jednostavno prikažite sadržaj prirodoslovne zbirke vaše ustanove u
            samo nekoliko klikova!
          </p>
          <Link href="/login">
            <BaseButton className={c.button} text="Prijavi se" />
          </Link>
        </div>
        <Image className={c.plantImage} src={PlantPicture} alt="plant" />
      </section>

      <section className={c.landingSection}>
        <div className={c.content}>
          <h2>Pregledaj eksponate</h2>
          <p>Pogledaj sadržaj prirodoslovnih zbirki svih organizacija.</p>
          <Link href="/login">
            <BaseButton className={c.button} text="Pregledaj" />
          </Link>
        </div>
        <Image className={c.plantImage} src={ExponatGroupPicture} alt="plant" />
      </section>
    </main>
  );
}
