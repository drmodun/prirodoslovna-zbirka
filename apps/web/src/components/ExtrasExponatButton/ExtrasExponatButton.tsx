"use client";
import modelIcon from "assets/icons/model.svg";
import videoIcon from "assets/icons/video.svg";
import classes from "./ExtrasExponatButton.module.scss";
import { useEffect, useState } from "react";
import Modal from "components/BaseModal";
import clsx from "clsx";
import Image from "next/image";

export interface ExtrasExponatButtonProps {
  thirdDimensionalModel?: string;
  video?: string;
}

export const ExtrasExponatButton = ({
  thirdDimensionalModel,
  video,
}: ExtrasExponatButtonProps) => {
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    import("@google/model-viewer").catch(console.error);
  }, []);

  return (
    <div className={classes.container}>
      {thirdDimensionalModel && (
        <div
          className={clsx(classes.button, classes.model)}
          onClick={() => setIsModelOpen(true)}
        >
          <div className={classes.icon}>
            <Image src={modelIcon} alt="model icon" layout="fill" />
          </div>
          <span>Pogledaj 3d model</span>
        </div>
      )}
      {video && (
        <div
          className={clsx(classes.button, classes.video)}
          onClick={() => setIsVideoOpen(true)}
        >
          <div className={classes.icon}>
            <Image src={videoIcon} alt="multimedia icon" layout="fill" />
          </div>
          <span>Pogledaj multimedijski sadržaj</span>
        </div>
      )}
      <Modal
        title="3d model"
        open={isModelOpen}
        text="Trodimenzionalni model eksponata"
        deMount={() => setIsModelOpen(false)}
      >
        <div
          className={classes.modelContainer}
          dangerouslySetInnerHTML={{
            __html: `<model-viewer src="${thirdDimensionalModel}" alt="A 3D model of an exponat" auto-rotate camera-controls touch-action="pan-y"  ar-status="not-presenting"></model-viewer>`,
          }}
        ></div>
      </Modal>
      <Modal
        title="Video"
        open={isVideoOpen}
        text="Video eksponata"
        deMount={() => setIsVideoOpen(false)}
      >
        <video src={video} controls></video>
      </Modal>
    </div>
  );
};
