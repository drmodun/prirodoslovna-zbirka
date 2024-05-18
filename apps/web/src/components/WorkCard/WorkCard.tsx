import { getEnumValue, WorkResponseShort, WorkType } from "@biosfera/types";
import classes from "./WorkCard.module.scss";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import ToggleApprovalButton from "components/ToggleApprovalButton";
import Link from "next/link";
import Image from "next/image";
import RemoveWorkButton from "components/RemoveWorkButton";
import { getPfpUrl } from "@/utility/static/getPfpUrl";
import SaveButton from "components/SaveButton";
import { useState } from "react";
import { shortenText } from "@/utility/static/shortenText";
import { UserWrapper } from "@/utility/wrappers/userWrapper";

export interface WorkCardProps {
  work: WorkResponseShort;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

export const WorkCard = ({ work, isAdmin, onDelete }: WorkCardProps) => {
  return (
    <div className={classes.container}>
      {work.poster && !work.isGbif && (
        <div className={classes.image}>
          <Image src={work.poster} alt={work.title} layout="fill" />
        </div>
      )}
      <div className={classes.content}>
        <div className={classes.upper}>
          <Link href={!work.isGbif ? `/work/${work.id}` : work.website! ?? "#"}>
            <span className={classes.title}>{shortenText(work.title, 20)}</span>
          </Link>
          <span className={classes.type}>
            {getEnumValue(WorkType, work.type)}
          </span>
        </div>
        <div className={classes.divider}></div>
        <Link
          href={
            work.isGbif
              ? "https://www.gbif.org/"
              : `/organisation/${work.organisationId}`
          }
          className={classes.organisation}
          target={"_blank"}
        >
          {work.organisationName}
        </Link>
        {!work.isGbif ? (
          <div className={classes.author}>
            <div className={classes.pfp}>
              <ImageWithFallback
                src={getPfpUrl(work.authorId)}
                alt={work.auhtorName}
                layout="fill"
              />
            </div>
            <Link href={`/user/${work.authorId}`} className={classes.name}>
              {work.auhtorName}
            </Link>
          </div>
        ) : (
          <span className={classes.gbifAuthor}>
            {shortenText(work.auhtorName ?? "", 40, " - GBIF")}
          </span>
        )}
        <span className={classes.description}>
          {work.description
            ? shortenText(work.description, 150)
            : "Ne postoji abstrakt"}
        </span>
        <div className={classes.tags}>
          {work?.tags?.map((tag, index) => (
            <span key={tag + index} className={classes.tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className={classes.buttonRow}>
          <UserWrapper>
            {!work.isGbif && <SaveButton work={work} />}
          </UserWrapper>
          {isAdmin && (
            <QueryClientWrapper>
              <div className={classes.adminRow}>
                <ToggleApprovalButton
                  id={work.id}
                  isApproved={work.isApproved}
                  entity="works"
                />
                <RemoveWorkButton
                  onRemove={onDelete}
                  workId={work.id} //TODO: add edit button
                  isHidden={!work.isApproved}
                />
              </div>
            </QueryClientWrapper>
          )}
        </div>
      </div>
    </div>
  );
};
