"use client";

import { ExponatExtendedResponse } from "@biosfera/types";
import classes from "./ExponatModal.module.scss";
import ExponatModalSections from "components/ExponatModalSections";
import CategorizationCard from "components/CategorizationCard";
import Link from "next/link";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import QrCodeGenerator from "components/QrCodeButton";
import ShareButton from "components/ShareButton";
import { Json } from "@biosfera/types/src/jsonObjects";
import { Carousel } from "react-responsive-carousel";
export interface ExponatModalProps {
  exponat: ExponatExtendedResponse;
}

const getImages = (exponat: ExponatExtendedResponse) => {
  return exponat?.posts
    ?.sort((a, b) => b.likeScore - a.likeScore)
    .slice(0, Math.min(10, exponat.posts.length))
    .map((post, index) => (
      <div key={index} className={classes.image}>
        <img
          src={post.thumbnail}
          alt="exponat image"
          className={classes.image}
        />
      </div>
    ));
};

export const ExponatModal = ({ exponat }: ExponatModalProps) => {
  return (
    <div className={classes.container}>
      <div className={classes.mainImage}>
        {exponat?.posts?.length > 0 ? (
          <Carousel showThumbs={false} className={classes.carousel}>
            {[
              <div className={classes.image}>
                <ImageWithFallback
                  src={exponat.mainImage}
                  alt="exponat image"
                  layout="fill"
                />
              </div>,
              ...getImages(exponat),
            ]}
          </Carousel>
        ) : (
          <div className={classes.image}>
            <ImageWithFallback
              src={exponat.mainImage}
              alt="exponat image"
              layout="fill"
            />
          </div>
        )}
      </div>
      <div className={classes.title}>
        <span className={classes.latinName}>{exponat.alternateName}</span>
        <span className={classes.name}>{exponat.title}</span>
      </div>
      <div className={classes.actions}>
        <QrCodeGenerator name={exponat.title} />
        <ShareButton
          title={exponat.title}
          text={`Pogledajte eksponat ${exponat.title} na biosfera.trema.hr`}
        />
      </div>
      {!(exponat.exponatKind.toLowerCase() === "mineral") &&
        exponat.categorization && (
          <CategorizationCard categorization={exponat.categorization} />
        )}
      <Link
        href={`/organisation/${exponat.organizationId}`}
        className={classes.orgName}
      >
        Organizacija eksponata: {exponat.organizationName}
      </Link>
      <span className={classes.serialNumber}>
        Serijski broj: {exponat.serialNumber}
      </span>
      <ExponatModalSections exponat={exponat} />
    </div>
  );
};
