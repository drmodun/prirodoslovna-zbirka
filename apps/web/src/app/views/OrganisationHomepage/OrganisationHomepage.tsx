import { ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./OrganisationHomepage.module.scss";
import Image from "next/image";
import SocialPostCard from "components/SocialPostCard";
import clsx from "clsx";

export interface OrganisationHomepageProps {
  organisation: ExtendedOrganisationResponse;
}

export const OrganisationHomepage = ({
  organisation,
}: OrganisationHomepageProps) => {
  return (
    <div className={classes.container}>
      <div className={classes.topRow}>
        <SocialPostCard
          post={{
            id: "1",
            title: "Naslov",
            text: "Tekst",
            createdAt: new Date(),
            updatedAt: new Date(),
            images: ["http://dummyimage.com/893x174.png/dddddd/000000"],
            organisationId: "1",
            organisationMainImage:
              "http://dummyimage.com/893x174.png/dddddd/000000",
            organisationName: "Organizacija",
          }}
        />

        <div className={classes.actions}>
          <span className={classes.title}>Akcije</span>
          <div className={classes.actionsRow}>
            <button className={classes.button}>Prati</button>
            <span className={classes.actionStat}>
              {organisation.followersAmount}
            </span>
          </div>
          <div className={classes.actionsRow}>
            <button className={clsx(classes.button, classes.blue)}>
              Postani član
            </button>
            <span className={classes.actionStat}>
              {organisation.membersAmount}
            </span>
          </div>
          <div className={classes.stats}>
            <div className={classes.bigStat}>
              <span className={classes.title}>Objava</span>
              <span className={classes.stat}>{organisation.posts.length}</span>
            </div>
            <div className={classes.bigStat}>
              <span className={classes.title}>Eksponata</span>
              <span className={classes.stat}>
                {organisation.exponats.length}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.title}>Objave organizacije</div>
      <div className={classes.otherPosts}>
        {organisation.posts.map((post, index) => (
          <div className={classes.postCard} key={index}>
            <div className={classes.postCardTitle}>{post.title}</div>
            <div className={classes.postCardContent}>{post.images}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
