import { WorkResponseShort } from "@biosfera/types";
import classes from "./WorkCard.module.scss";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import ToggleApprovalButton from "components/ToggleApprovalButton";
import Link from "next/link";
import Image from "next/image";
import RemoveWorkButton from "components/RemoveWorkButton";
import { getPfpUrl } from "@/utility/static/getPfpUrl";
import SaveButton from "components/SaveButton";

export interface WorkCardProps {
  work: WorkResponseShort;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

export const WorkCard = ({ work, isAdmin, onDelete }: WorkCardProps) => (
  <div className={classes.container}>
    {work.poster && (
      <div className={classes.image}>
        <Image src={work.poster} alt={work.title} layout="fill" />
      </div>
    )}
    {isAdmin ? (
      <QueryClientWrapper>
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
      </QueryClientWrapper>
    ) : (
      <SaveButton work={work} />
    )}

    <div className={classes.content}>
      <div className={classes.upper}>
        <Link href={work.isGbif ? work.website! : `/work/${work.id}`}>
          <span className={classes.title}>{work.title}</span>
        </Link>
        <div className={classes.type}>
          <span>{work.type}</span>
        </div>
      </div>
      <div className={classes.divider}></div>
      <Link
        href={!work.isGbif ? "#" : `/organisation/${work.organisationId}`}
        className={classes.organisation}
      >
        {work.organisationName}
      </Link>
      {work.isGbif ? (
        <span className={classes.gbifAuthor}>{work.auhtorName} - (GBIF)</span>
      ) : (
        <div className={classes.author}>
          <Image
            className={classes.pfp}
            src={getPfpUrl(work.authorId)}
            alt={work.auhtorName}
            layout="fill"
          />
          <Link href={`/user/${work.authorId}`} className={classes.name}>
            {work.auhtorName}
          </Link>
        </div>
      )}
      <span className={classes.description}>{work.description}</span>
      <div className={classes.tags}>
        {work?.tags?.map((tag) => (
          <span key={tag} className={classes.tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);
