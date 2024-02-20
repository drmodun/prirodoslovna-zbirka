import c from "./page.module.scss";
import PlantPicture from "../assets/images/landing-plant.png";
import Image from "next/image";
import BaseButton from "components/BaseButton";

export default function Home() {
  return (
    <main>
      <section className={c.headerHero}>
        <div className={c.content}>
          <h2>Vaša digitalna zbirka.</h2>
          <p>
            Jednostavno prikažite sadržaj prirodoslovne zbirke vaše ustanove u
            samo nekoliko klikova!
          </p>
          <BaseButton text="Prijavite se" />
        </div>
        <Image className={c.plantImage} src={PlantPicture} alt="plant" />
      </section>
    </main>
  );
}
