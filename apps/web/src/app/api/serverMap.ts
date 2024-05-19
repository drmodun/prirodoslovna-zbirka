"use server";

import { MapPossibility } from "@biosfera/types";

export const getMapPossibility = async (id: string) => {
  const request = await fetch(
    `https://api.gbif.org/v2/map/occurrence/density/0/0/0/capabilities.json?taxonKey=${id}`,
    {
      next: {
        revalidate: 1 * 60 * 60 * 24 * 7, // weekly revalidation
      },
    }
  );

  const data = await request.json();
  return data as MapPossibility;
};

export const getMap = async (id: string) => {
  const mapData = await fetch(
    `https://api.gbif.org/v2/map/occurrence/density/0/0/0%401x.png?srs=EPSG%3A3857&bin=square&hexPerTile=51&squareSize=16&style=greenHeat.point&taxonKey=${id}`,
    {
      next: {
        revalidate: 1 * 60 * 60 * 24 * 7, // weekly revalidation
      },
    }
  );

  return mapData;
};

export const getCroatianMap = async () => {
  const mapData = await fetch(
    `https://api.gbif.org/v2/map/occurrence/density/0/0/0%401x.png?srs=EPSG%3A3857&bin=square&hexPerTile=51&squareSize=16&style=greenHeat.point&taxonKey=${id}`, //later figure out zoom
    {
      next: {
        revalidate: 1 * 60 * 60 * 24 * 7, // weekly revalidation
      },
    }
  );

  return mapData;
};
