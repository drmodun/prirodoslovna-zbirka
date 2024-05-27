export interface DomainButtonProps {
  domain: Domains;
  onClick: Dispatch<SetStateAction<Domains>>;
  selected?: boolean;
  image: string;
}

import Image from "next/image";
import classes from "./DomainButton.module.scss";
import clsx from "clsx";
import { ExponatKind } from "@biosfera/types";
import { Domains } from "@/views/OrganisationBody/OrganisationBody";
import { Dispatch, SetStateAction } from "react";

export const DomainButton = ({
  image,
  onClick,
  domain,
  selected,
}: DomainButtonProps) => {
  const handleOnClick = () => {
    onClick(domain);
  };

  return (
    <button
      className={clsx(
        classes.container,
        selected && classes.active,
        domain && classes[domain],
      )}
      onClick={handleOnClick}
    >
      <div className={classes.domainImage}>
        <Image src={image} alt={domain} />
      </div>
      <div className={classes.domainName}>{domain.toLocaleUpperCase()}</div>
    </button>
  );
};
