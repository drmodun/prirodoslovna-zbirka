"use client";

import React, { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import classes from "./Documentreader.module.scss";
import clsx from "clsx";
import { useGetCurrentScreenSize } from "@/utility/hooks/useGetCurrentScreenSize";
import BaseButton from "components/BaseButton";
import Link from "next/link";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export interface DocumentReaderProps {
  src: string;
  isLandscape?: boolean;
}

export const DocumentReader = ({ src, isLandscape }: DocumentReaderProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);

  const { screenSize, isMobile } = useGetCurrentScreenSize();

  const calculatedWidth = () => {
    if (!isLandscape) {
      return isMobile ? screenSize * (340 / 375) : screenSize * (500 / 1440);
    }

    return isMobile ? screenSize * (340 / 360) : screenSize * (1040 / 1440);
  };

  const pageWidth = useMemo(calculatedWidth, [
    screenSize,
    isMobile,
    isLandscape,
  ]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handleIncreasePage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handleDecreasePage = () => {
    if (pageNumber > 1) {
      setPageNumber((prev) => prev - 1);
    }
  };

  return (
    <div
      className={clsx(
        classes.container,
        isLandscape ? classes.landscape : classes.portrait,
      )}
    >
      <div className={classes.document}>
        <Document
          rotate={!isLandscape ? 90 : 0}
          file={src}
          onLoadSuccess={onDocumentLoadSuccess}
          noData={
            <span className={classes.error}>
              Greška pri učitavanju dokumenta{" "}
            </span>
          }
          loading={
            <div className={classes.spinnerContainer}>
              <div className={classes.spinner}></div>
            </div>
          }
        >
          <Page
            _className={clsx(
              classes.page,
              isLandscape ? classes.landscape : classes.portrait,
            )}
            width={pageWidth}
            pageNumber={pageNumber}
          />
        </Document>
      </div>
      <div className={classes.buttons}>
        <button onClick={handleDecreasePage} className={classes.button}>
          Prethodna stranica
        </button>
        <span className={classes.pageNumber}>{pageNumber}</span>
        <button onClick={handleIncreasePage} className={classes.button}>
          Sljedeća stranica
        </button>
      </div>
      <Link className={classes.link} href={src} target="_blank">
        <BaseButton text="Otvori cijeli dokument" />
      </Link>
    </div>
  );
};
