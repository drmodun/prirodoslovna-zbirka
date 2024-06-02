"use client";

import {
  ExponatResponseShort,
  OrganisationResponseShort,
  PostResponse,
  WorkResponseShort,
} from "@biosfera/types";
import { tabType } from "../DiscoverPageView/DiscoverPageView";
import { useState } from "react";
import classes from "./MultipleEntityTypesView.module.scss";
import Tabs from "components/Tabs";
import CardCollection from "components/CardCollection";
import { Variant } from "components/Tabs/Tabs";

export type reactionsType = "Lajkano" | "Favoriti" | "Spremljeno" | "Čitano";

export interface MultipleEntityTypesViewProps {
  posts?: PostResponse[];
  works?: WorkResponseShort[];
  exponats?: ExponatResponseShort[];
  literature?: WorkResponseShort[];
  organisations?: OrganisationResponseShort[];
  initTab?: tabType | reactionsType;
  availableTabs: tabType[] | reactionsType[];
  userId?: string;
}

export const MultipleEntityTypesView = ({
  posts,
  works,
  exponats,
  userId,
  literature,
  organisations,
  availableTabs,
  initTab = availableTabs[0],
}: MultipleEntityTypesViewProps) => {
  const [tab, setTab] = useState<tabType | reactionsType>(initTab);

  return (
    <div className={classes.container}>
      <Tabs
        variant={Variant.SUB}
        activeTab={tab}
        onSelect={setTab}
        tabs={availableTabs}
      />
      {(tab === "Objave" || tab === "Lajkano") && posts && (
        <CardCollection
          items={posts}
          sortBy={[
            { label: "Abecedno", value: "title" },
            { label: "Datum Objave", value: "updatedAt" },
            { label: "Likeovi", value: "likeScore" },
          ]}
          type="post"
        />
      )}
      {(tab === "Spremljeno" || tab === "Radovi") && works && (
        <CardCollection
          items={works}
          sortBy={[
            { label: "Abecedno", value: "title" },
            { label: "Datum Objave", value: "updatedAt" },
            { label: "Broj sejvanih radova", value: "amountOfSaves" },
          ]}
          type="work"
        />
      )}
      {(tab === "Eksponati" || tab === "Favoriti") && exponats && (
        <CardCollection
          items={exponats}
          sortBy={[
            { label: "Abecedno", value: "title" },
            { label: "Znanstveno ime", value: "alternateName" },
            { label: "Datum Objave", value: "updatedAt" },
            { label: "Broj Favorita", value: "Favourite Count" },
          ]}
          type="exponat"
        />
      )}
      {(tab === "Čitano" || tab === "Radovi (GBIF)") && literature && (
        <CardCollection
          items={literature}
          sortBy={[
            { label: "Abecedno", value: "title" },
            { label: "Datum Objave", value: "updatedAt" },
            { label: "Broj Favorita", value: "Favourite Count" },
          ]}
          type="work"
        />
      )}
      {tab === "Organizacije" && organisations && (
        <CardCollection
          items={organisations}
          userId={userId}
          sortBy={[
            { label: "Abecedno", value: "name" },
            { label: "Lokacija", value: "location" },
            { label: "Uloga", value: "role" },
          ]}
          type="organisation-member"
        />
      )}
    </div>
  );
};
