import { useGetBySerialNumber } from "@/api/useGetBySerialNumber";
import BaseButton from "components/BaseButton";
import Modal from "components/BaseModal";
import SingleInput from "components/SingleInput";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export interface SerialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SerialModal = ({ isOpen, onClose }: SerialModalProps) => {
  const t = useTranslations("SerialNumber");
  const [serialNumber, setSerialNumber] = useState<number>();
  const [serialNumberInput, setSerialNumberInput] = useState<string>();
  const { data, isSuccess } = useGetBySerialNumber(serialNumber);
  const router = useRouter();

  const handleClick = () => {
    const number = parseInt(serialNumberInput || "");
    if (isNaN(number)) {
      alert(t("mustBeNumber"));
      setSerialNumberInput("");
    }
    setSerialNumber(number);
    setSerialNumberInput("");
  };

  useEffect(() => {
    if (isSuccess) {
      router.push(`/exponat/${data}`);
      onClose();
    }
  }, [data, onClose, isSuccess, router]);

  return (
    <Modal open={isOpen} text={t("text")} title={t("title")} deMount={onClose}>
      <SingleInput
        value={serialNumberInput || ""}
        onChange={(e) => setSerialNumberInput(e)}
        question={t("title")}
      />
      <BaseButton onClick={handleClick} text={t("confirm")} />
    </Modal>
  );
};
