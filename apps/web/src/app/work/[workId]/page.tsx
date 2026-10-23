import { getWork } from "@/api/serverWork";
import classes from "./page.module.scss";
import { WorkResponseExtended } from "@biosfera/types";
import NotFound from "@/not-found";
import Image from "next/image";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import { getPfpUrl } from "@/utility/static/getPfpUrl";
import Link from "next/link";
import {
  dateShortener,
  dateShortenerWithoutTime,
} from "@/utility/static/dateShortener";
import ShareButton from "components/ShareButton";
import QrCodeGenerator from "components/QrCodeButton";
import DocumentReader from "components/DocumentReader";
import { getTranslations } from "next-intl/server";

const WorkPage = async (props: { params: Promise<any> }) => {
  const params = await props.params;
  const workInfo: WorkResponseExtended = await getWork(params.workId);
  const t = await getTranslations("WorkPage");

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
          {t("viewOrganisation")}
        </Link>

        <div className={classes.sharing}>
          <ShareButton text={t("share")} title={workInfo.title} />
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
            <span className={classes.name}>{t("document")}</span>
            <DocumentReader src={workInfo.document} />
          </div>
        )}

        {workInfo.presentation && (
          <div className={classes.pdfReader}>
            <span className={classes.name}>{t("presentation")}</span>
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
