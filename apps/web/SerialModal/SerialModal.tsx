import { useGetBySerialNumber } from "@/api/useGetBySerialNumber";
import BaseButton from "components/BaseButton";
import Modal from "components/BaseModal";
import SingleInput from "components/SingleInput";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface SerialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SerialModal = ({ isOpen, onClose }: SerialModalProps) => {
  const [serialNumber, setSerialNumber] = useState<number>();
  const [serialNumberInput, setSerialNumberInput] = useState<string>();
  const { data, isSuccess } = useGetBySerialNumber(serialNumber);
  const router = useRouter();

  const handleClick = () => {
    const number = parseInt(serialNumberInput || "");
    if (isNaN(number)) {
      alert("Serijski broj mora biti broj");
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
    <Modal
      open={isOpen}
      text="Upišite serijski broj eksponata"
      title="Serijski broj"
      deMount={onClose}
    >
      <SingleInput
        value={serialNumberInput || ""}
        onChange={(e) => setSerialNumberInput(e)}
        question="Serijski broj"
      />
      <BaseButton onClick={handleClick} text="Potvrdi" />
    </Modal>
  );
};
