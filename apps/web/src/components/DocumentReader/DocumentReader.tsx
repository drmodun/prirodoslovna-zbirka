"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import classes from "./Documentreader.module.scss";
import clsx from "clsx";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

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
    <div
      className={clsx(
        classes.container,
        isLandscape ? classes.landscape : classes.portrait
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
              isLandscape ? classes.landscape : classes.portrait
            )}
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
    </div>
  );
};
