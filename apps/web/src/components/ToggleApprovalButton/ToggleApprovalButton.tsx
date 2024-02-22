"use client";

import { useToggleApproval } from "@/api/useToggleApproval";
import classes from "./ToggelApprovalButton.module.scss";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import approved from "assets/images/approved.svg";
import disapproved from "assets/images/disapproved.svg";

export interface ToggelApprovalButtonProps {
  id: string;
  entity: string;
  isApproved?: boolean;
}

export const ToggelApprovalButton: React.FC<ToggelApprovalButtonProps> = ({
  id,
  entity,
  isApproved,
}) => {
  const [approval, setApproval] = useState(isApproved || true);
  const { mutate } = useToggleApproval();
  const handleToggle = () => {
    const confirm = window.confirm(
      `Are you sure you want to ${
        isApproved ? "disapprove" : "approve"
      } this ${entity}?`
    );
    confirm &&
      mutate({
        id,
        entity,
      });
  };

  useEffect(() => {
    setApproval(isApproved || true);
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
      {
        <Image
          src={approval ? approved : disapproved}
          alt={approval ? "vidljiv" : "sakriven"}
        />
      }
    </button>
  );
};
