import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import classes from "./QrCodeButton.module.css";
import * as htmlToImage from "html-to-image";
import toast from "react-hot-toast";
import Modal from "components/BaseModal";

interface QrCodeButtonProps {
  url: string;
  name: string;
}

function QrCodeGenerator({ url, name }: QrCodeButtonProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  <button onClick={handleGenerateClick} className={classes.container}>
    Generiraj QR kod
    <Modal
      open={isModalOpen}
      deMount={handleModalClose}
      text="Vaš QR kod"
      title={`QR kod: ${name}`}
    >
      <div ref={qrCodeRef}>
        <QRCode value={url} />
      </div>
      <button onClick={downloadQRCode}>Preuzmi QR kod</button>
    </Modal>
  </button>;
}
export default QrCodeGenerator;
