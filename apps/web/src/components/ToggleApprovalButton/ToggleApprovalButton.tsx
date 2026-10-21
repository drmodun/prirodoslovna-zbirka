"use client";

import { useToggleApproval } from "@/api/useToggleApproval";
import classes from "./ToggleApprovalButton.module.scss";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import approved from "assets/images/approved.svg";
import disapproved from "assets/images/disapproved.svg";
import { useTranslations } from "next-intl";

export interface ToggleApprovalButtonProps {
  id: string;
  entity: string;
  isApproved?: boolean;
  onToggle?: () => void;
}

export const ToggleApprovalButton: React.FC<ToggleApprovalButtonProps> = ({
  id,
  entity,
  onToggle,
  isApproved,
}) => {
  const t = useTranslations("ToggleApprovalButton");
  const [approval, setApproval] = useState<Boolean>(isApproved ?? true);
  const { mutateAsync } = useToggleApproval();
  const handleToggle = async () => {
    await mutateAsync({
      id,
      entity,
    });
    setApproval((prev) => !prev);
  };

  useEffect(() => {
    setApproval(isApproved ?? true);
    onToggle?.();
  }, [isApproved]);

  return (
    <button
      onClick={handleToggle}
      title={approval ? t("hide") : t("approve")}
      className={clsx(
        classes.toggleButton,
        approval ? classes.approved : classes.disapproved,
      )}
    >
      <div className={classes.image}>
        <Image
          src={approval ? approved : disapproved}
          alt={approval ? t("visible") : t("hidden")}
        />
      </div>
    </button>
  );
};
