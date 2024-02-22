"use client";

import { useToggleApproval } from "@/api/useToggleApproval";
import classes from "./ToggleApprovalButton.module.scss";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import approved from "assets/images/approved.svg";
import disapproved from "assets/images/disapproved.svg";

export interface ToggleApprovalButtonProps {
  id: string;
  entity: string;
  isApproved?: boolean;
}

export const ToggleApprovalButton: React.FC<ToggleApprovalButtonProps> = ({
  id,
  entity,
  isApproved,
}) => {
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
  }, [isApproved]);

  return (
    <button
      onClick={handleToggle}
      title="Toggle Approval"
      className={clsx(
        classes.toggleButton,
        approval ? classes.approved : classes.disapproved
      )}
    >
      <div className={classes.image}>
        <Image
          src={approval ? approved : disapproved}
          alt={approval ? "vidljiv" : "sakriven"}
        />
      </div>
    </button>
  );
};
