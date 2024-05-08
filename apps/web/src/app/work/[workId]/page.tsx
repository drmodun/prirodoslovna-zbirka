import { getWork } from "@/api/serverWork";
import classes from "./page.module.scss";
import { WorkResponseExtended } from "@biosfera/types";
import NotFound from "@/not-found";
import Image from "next/image";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import { getPfpUrl } from "@/utility/static/getPfpUrl";
import Link from "next/link";
import { dateShortener } from "@/utility/static/dateShortener";
import ShareButton from "components/ShareButton";
import QrCodeGenerator from "components/QrCodeButton";
import DocumentReader from "components/DocumentReader";

export const WorkPage = async ({ params }: { params: any }) => {
  const workInfo: WorkResponseExtended = await getWork(params.workId);

  return workInfo ? (
    <div className={classes.container}>
      <div className={classes.image}>
        <Image src={workInfo.poster} alt={workInfo.title} />
      </div>

      <div className={classes.upper}>
        <Link href={`/user/${workInfo.authorId}`} className={classes.author}>
          <ImageWithFallback
            src={getPfpUrl(workInfo.authorId)}
            alt={workInfo.auhtorName}
          />
          <span className={classes.name}>{workInfo.auhtorName}</span>
        </Link>

        <span className={classes.updated}>
          {`${dateShortener(workInfo.firstPublicationDate)} - ${dateShortener(
            workInfo.updatedAt
          )}`}
        </span>

        <Link
          className={classes.button}
          href={`/organisation/${workInfo.organisationId}`}
        >
          Pogledaj organizaciju
        </Link>

        <ShareButton text="Podeli rad" title="Podijeli rad" />
        <QrCodeGenerator name={workInfo.title} />
      </div>

      <div className={classes.abstract}>
        <span className={classes.title}>{workInfo.title}</span>
        <span className={classes.description}>{workInfo.description}</span>
      </div>

      {workInfo.document && (
        <div className={classes.pdfReader}>
          <span className={classes.name}>Dokument projekta</span>
          <DocumentReader src={workInfo.document} />
        </div>
      )}

      {workInfo.presentation && (
        <div className={classes.pdfReader}>
          <span className={classes.name}>Prezentacija projekta</span>
          <DocumentReader isLandscape src={workInfo.presentation} />
        </div>
      )}
    </div>
  ) : (
    <NotFound />
  );
};
