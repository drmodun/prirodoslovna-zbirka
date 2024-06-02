"use client";

import { getWork } from "@/api/serverWork";
import NotFound from "@/not-found";
import { dateShortenerWithoutTime } from "@/utility/static/dateShortener";
import { getPfpUrl } from "@/utility/static/getPfpUrl";
import { WorkResponseExtended } from "@biosfera/types";
import DocumentReader from "components/DocumentReader";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import QrCodeGenerator from "components/QrCodeButton";
import ShareButton from "components/ShareButton";
import Link from "next/link";
import classes from "../page.module.scss";
import { useGetClientWork } from "@/api/useGetClientWork";
import Image from "next/image";

const WorkPage = ({ params }: { params: any }) => {
  const { data: workInfo } = useGetClientWork(params.workId);
  return workInfo ? (
    <div className={classes.container}>
      {workInfo.poster && (
        <div className={classes.image}>
          <Image src={workInfo.poster} alt={workInfo.title} layout="fill" />
        </div>
      )}

      <div className={classes.upper}>
        <Link href={`/user/${workInfo.authorId}`} className={classes.author}>
          <ImageWithFallback
            src={getPfpUrl(workInfo.authorId)}
            alt={workInfo.auhtorName}
            width={100}
            height={100}
            className={classes.authorImage}
          />
          <span className={classes.name}>{workInfo.auhtorName}</span>
        </Link>

        <span className={classes.updated}>
          {`${dateShortenerWithoutTime(
            workInfo.firstPublicationDate,
          )} - ${dateShortenerWithoutTime(workInfo.updatedAt)}`}
        </span>

        <Link
          className={classes.button}
          href={`/organisation/${workInfo.organisationId}`}
        >
          Pogledaj organizaciju
        </Link>

        <div className={classes.sharing}>
          <ShareButton text="Podeli rad" title="Podijeli rad" />
          <QrCodeGenerator isIcon name={workInfo.title} />
        </div>
      </div>

      <div className={classes.abstract}>
        <span className={classes.title}>{workInfo.title}</span>
        <span className={classes.description}>{workInfo.description}</span>
      </div>

      <div className={classes.documents}>
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
    </div>
  ) : (
    <NotFound />
  );
};

export default WorkPage;
