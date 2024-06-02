"use client";
import { ExponatExtendedResponse } from "@biosfera/types";
import CardCollection from "components/CardCollection";
import classes from "./SingleExponatView.module.scss";
import useUser from "@/utility/context/UserContext";
import AudioPlayer from "react-h5-audio-player";
import BaseButton from "components/BaseButton";
import Link from "next/link";
import CardCollectionAsync from "components/CardCollectionAsync";
import { useEffect, useState } from "react";
import Image from "next/image";
import chatgpt from "assets/images/gpt.svg";
import { LoaderIcon } from "react-hot-toast";
import AudioButton from "components/AudioButton";
import defaultMap from "assets/images/default-map.png";
import { getMap } from "@/api/serverMap";
import topLeft from "assets/images/topLeft.png";
import topRight from "assets/images/topRight.png";
import bottomLeft from "assets/images/bottomLeft.png";
import bottomRight from "assets/images/bottomRight.png";
import clsx from "clsx";
export interface SingleExponatViewProps {
  exponat: ExponatExtendedResponse;
  generatedDescription?: string;
  audioDescription?: string;
  isMapPossible?: boolean;
  isCroationMapPossible?: boolean;
}

export const SingleExponatView = (props: SingleExponatViewProps) => {
  const { memberships } = useUser();

  return (
    <div className={classes.container}>
      <div className={classes.desc}>
        <div className={classes.header}>
          <div className={classes.icon}>
            <Image src={chatgpt} alt="chatgpt" layout="fill" />
          </div>
          <span className={classes.title}>
            AI generirani kratki opis eksponata
          </span>
          {props.audioDescription ? (
            <AudioButton src={props.audioDescription} />
          ) : (
            <LoaderIcon />
          )}
        </div>
        <pre className={classes.text}>
          {props.generatedDescription
            ? props.generatedDescription
            : "Učitavanje..."}
        </pre>
        <span className={classes.warning}>
          Molimo vas da provjerite točnost informacija, AI postaje sve bolji ali
          dalje relativno često zna griješiti
        </span>
      </div>
      {props.isMapPossible && (
        <div className={classes.maps}>
          <div className={classes.mainMap}>
            <Image src={defaultMap} alt="map" layout="fill" />
          </div>
          <div className={classes.occurenceMap}>
            <div className={classes.mapImage}>
              <Image
                className={classes.map}
                src={`https://api.gbif.org/v2/map/occurrence/density/0/0/0%401x.png?srs=EPSG%3A3857&bin=square&hexPerTile=51&squareSize=16&style=greenHeat.point&taxonKey=${props.exponat.categorization?.speciesKey}`}
                alt="map"
                layout="fill"
              />
            </div>
          </div>
        </div>
      )}
      {props.isCroationMapPossible && (
        <div className={classes.croatianMaps}>
          <div className={clsx(classes.section, classes.topLeft)}>
            <div className={classes.mainMap}>
              <Image src={topLeft} alt="map" layout="fill" />
            </div>
            <div className={classes.occurenceMap}>
              <div className={classes.mapImage}>
                <Image
                  src={`https://api.gbif.org/v2/map/occurrence/density/6/34/22%401x.png?srs=EPSG%3A3857&bin=square&hexPerTile=51&squareSize=16&country=HR&style=greenHeat.point&taxonKey=${props.exponat.categorization?.speciesKey}`}
                  alt="map"
                  layout="fill"
                />
              </div>
            </div>
          </div>
          <div className={clsx(classes.section, classes.topRight)}>
            <div className={classes.mainMap}>
              <Image src={topRight} alt="map" layout="fill" />
            </div>
            <div className={classes.occurenceMap}>
              <div className={classes.mainMap}>
                <Image
                  src={`https://api.gbif.org/v2/map/occurrence/density/6/35/22%401x.png?srs=EPSG%3A3857&bin=square&hexPerTile=51&country=HR&squareSize=16&style=greenHeat.point&taxonKey=${props.exponat.categorization?.speciesKey}`}
                  alt="map"
                  layout="fill"
                />
              </div>
            </div>
          </div>
          <div className={clsx(classes.section, classes.bottomLeft)}>
            <div className={classes.mainMap}>
              <Image src={bottomLeft} alt="map" layout="fill" />
            </div>
            <div className={classes.occurenceMap}>
              <div className={classes.mainMap}>
                <Image
                  src={`https://api.gbif.org/v2/map/occurrence/density/6/34/23%401x.png?srs=EPSG%3A3857&bin=square&hexPerTile=51&country=HR&squareSize=16&style=greenHeat.point&taxonKey=${props.exponat.categorization?.speciesKey}`}
                  alt="map"
                  layout="fill"
                />
              </div>
            </div>
          </div>
          <div className={clsx(classes.section, classes.bottomRight)}>
            <div className={classes.mainMap}>
              <Image src={bottomRight} alt="map" layout="fill" />
            </div>
            <div className={classes.occurenceMap}>
              <div className={classes.mainMap}>
                <Image
                  src={`https://api.gbif.org/v2/map/occurrence/density/6/35/23%401x.png?srs=EPSG%3A3857&bin=square&hexPerTile=51&squareSize=16&country=HR&style=greenHeat.point&taxonKey=${props.exponat.categorization?.speciesKey}`}
                  alt="map"
                  layout="fill"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={classes.posts}>
        {memberships.some(
          (membership) =>
            membership.id === props.exponat.organizationId &&
            membership.role?.toLowerCase() !== "requested",
        ) && (
          <Link
            href={`/exponat/${props.exponat.id}/createPost`}
            className={classes.buttonWrapper}
          >
            <BaseButton text="Dodaj Objavu" />
          </Link>
        )}
        <span className={classes.title}>Objave</span>
        <CardCollection
          items={props.exponat.posts}
          type="post"
          sortBy={[
            { label: "Abecedno", value: "title" },
            { label: "Likeovi", value: "likeScore" },
            { label: "Datum Objave", value: "updatedAt" },
          ]}
          pageSize={12}
        />
      </div>
    </div>
  );
};
