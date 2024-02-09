"use client";

import classes from "./FileUpload.module.scss";

import { useDropzone } from "react-dropzone";
import Image from "next/image";
import upload from "assets/images/upload.svg";
import dash from "assets/images/dash.svg";
import { useEffect, useState } from "react";

const maxSize = 1048576;
const FileUpload = () => {
  const {
    isDragActive,
    getRootProps,
    getInputProps,
    isDragReject,
    acceptedFiles,

    fileRejections: rejectedFiles,
  } = useDropzone({
    onDrop: () => {
      console.log(acceptedFiles);
    },
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "video/*": [".mp4"],
    },
    minSize: 0,
    maxSize,
  });

  const [files, setFiles] = useState(acceptedFiles);

  useEffect(() => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, [acceptedFiles]);

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f !== file));
  };

  const isFileTooLarge =
    rejectedFiles.length > 0 && rejectedFiles[0].file.size > maxSize;

  return (
    <div className={classes.container}>
      <div {...getRootProps()} className={classes.main}>
        <input {...getInputProps()} className={classes.main} />
        <div className={classes.image}>
          <Image layout="fill" src={upload} alt="plus" />
        </div>
        {!isDragActive && (
          <span className={classes.text}>
            Ovdje prenesite datoteke ili kliknite da bi ih dodali
          </span>
        )}
        {isDragActive && !isDragReject && (
          <span className={classes.text}>Pustite datoteke ovdje ...</span>
        )}
        {isDragReject && (
          <span className={classes.error}>Nepodržani format datoteke</span>
        )}
        {isFileTooLarge && (
          <span className={classes.error}>Datoteka je prevelika</span>
        )}
      </div>
      {files.length > 0 && (
        <div className={classes.fileList}>
          {files.map((file, index) => (
            <div key={index} className={classes.file}>
              <span className={classes.fileName}>{file.name}</span>
              <div className={classes.end}>
                <span className={classes.fileSize}>
                  {Math.max(file.size / 1024 / 1024, 0.001).toFixed(3)} MB
                </span>
                <button
                  className={classes.remove}
                  type="button"
                  title="remove"
                  onClick={() => removeFile(file)}
                >
                  <Image src={dash} alt="remove" layout="fill" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default FileUpload;
