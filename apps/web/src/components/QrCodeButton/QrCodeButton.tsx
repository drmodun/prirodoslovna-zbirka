"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import classes from "./QrCodeButton.module.scss";
import * as htmlToImage from "html-to-image";
import toast from "react-hot-toast";
import Modal from "components/BaseModal";
import BaseButton from "components/BaseButton";
import clsx from "clsx";
import qrCodeIcon from "assets/icons/qr-code.svg";
import Image from "next/image";

interface QrCodeButtonProps {
  name: string;
  isIcon?: boolean;
}

function QrCodeGenerator({ isIcon, name }: QrCodeButtonProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const downloadQRCode = () => {
    htmlToImage
      .toPng(qrCodeRef.current!)
      .then(function (dataUrl) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = name + ".png";
        link.click();
      })
      .catch(function (error) {
        toast.error("Greška pri generaciji qr koda:", error);
      });
  };

  const handleGenerateClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  return (
    <button
      onClick={handleGenerateClick}
      className={clsx(classes.container, isIcon && classes.icon)}
    >
      {isIcon ? (
        <Image src={qrCodeIcon} alt="qr code" />
      ) : (
        <span>Generiraj QR kod</span>
      )}
      <Modal
        open={isModalOpen}
        deMount={handleModalClose}
        text="Vaš QR kod"
        title={`QR kod: ${name}`}
      >
        <div className={classes.qrCode} ref={qrCodeRef}>
          <QRCode value={url || ""} size={500} />
        </div>
        <BaseButton text="Preuzmi QR kod" onClick={downloadQRCode}></BaseButton>
      </Modal>
    </button>
  );
}
export default QrCodeGenerator;
