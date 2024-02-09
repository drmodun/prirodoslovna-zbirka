"use client";

import classes from "./FileUpload.module.scss";

import { useDropzone } from "react-dropzone";
import Image from "next/image";
import upload from "assets/images/upload.svg";
import dash from "assets/images/dash.svg";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import alertImage from "assets/images/alert.svg";
import clsx from "clsx";
export interface FileUploadProps {
  name: string;
  maxFiles?: number;
  onChange?: Dispatch<SetStateAction<File[]>>;
}

const maxSize = 1048576;

const FileUpload = ({ name, maxFiles = 1, onChange }: FileUploadProps) => {
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
    if (files.length + acceptedFiles.length > maxFiles) {
      toast.error("Previše datoteka");
      return;
    }
    setFiles((prev) => [...prev, ...acceptedFiles]);
    onChange && onChange((prev: File[]) => [...prev, ...acceptedFiles]);
  }, [acceptedFiles]);

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f !== file));
    onChange && onChange((prev: File[]) => prev.filter((f) => f !== file));
  };

  const isFileTooLarge =
    rejectedFiles.length > 0 && rejectedFiles[0].file.size > maxSize;

  return (
    <div className={classes.container}>
      <span className={classes.title}>{name}</span>
      <div
        {...getRootProps()}
        className={clsx(
          classes.main,
          files.length >= maxFiles && classes.disabled
        )}
      >
        <input
          {...getInputProps()}
          disabled={files.length >= maxFiles}
          className={classes.main}
        />
        <div className={classes.image}>
          <Image
            layout="fill"
            src={files.length >= maxFiles ? alertImage : upload}
            alt="plus"
          />
        </div>
        {!isDragActive && files.length < maxFiles && (
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
        {files.length > maxFiles && (
          <span className={classes.error}>Previše datoteka</span>
        )}
        {files.length === maxFiles && (
          <span className={classes.text}>
            Maskimalni broj datoteka je stavljen, prvo obrišite jednu postojeću
          </span>
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
