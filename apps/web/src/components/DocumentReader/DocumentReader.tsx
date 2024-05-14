"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import classes from "./Documentreader.module.scss";
import clsx from "clsx";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

export interface DocumentReaderProps {
  src: string;
  isLandscape?: boolean;
}

export const DocumentReader = ({ src, isLandscape }: DocumentReaderProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);

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
    <div className={classes.container}>
      <Document
        file={src}
        onLoadSuccess={onDocumentLoadSuccess}
        noData={
          <span className={classes.error}>
            Greška pri učitavanju dokumenta{" "}
          </span>
        }
        className={clsx(
          classes.document,
          classes[isLandscape ? "landscape" : "portrait"]
        )}
        loading={
          <div className={classes.spinnerContainer}>
            <div className={classes.spinner}></div>
          </div>
        }
      >
        <Page className={classes.page} pageNumber={pageNumber} />
      </Document>
      <div className={classes.buttons}>
        <button onClick={handleDecreasePage} className={classes.button}>
          Prethodna stranica
        </button>
        <span className={classes.page}>{pageNumber}</span>
        <button onClick={handleIncreasePage} className={classes.button}>
          Sljedeća stranica
        </button>
      </div>
    </div>
  );
};
