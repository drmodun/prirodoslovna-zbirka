import { ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./OrganisationHomepage.module.scss";
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
        {organisation.socialPosts?.length && (
          <SocialPostCard post={organisation.socialPosts[0]} />
        )}
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
              <span className={classes.stat}>
                {organisation.socialPosts ? organisation.socialPosts.length : 0}
              </span>
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
        {organisation.socialPosts?.slice(1).map((post, index) => (
          <div className={classes.postCard} key={index}>
            <div className={classes.postCardTitle}>{post.title}</div>
            <div className={classes.postCardContent}>{post.image}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
