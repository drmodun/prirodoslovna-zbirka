export interface DomainButtonProps {
  domain: string;
  onClick?: () => void;
  selected?: boolean;
  image: string;
  color?: Domains; //TODO: maybe make a class type solution instead of text
}

import Image from "next/image";
import classes from "./DomainButton.module.scss";
import clsx from "clsx";
import { ExponatKind } from "@biosfera/types";
import { Domains } from "@/views/OrganisationBody/OrganisationBody";

export const DomainButton = ({
  image,
  onClick,
  domain,
  selected,
  color,
}: DomainButtonProps) => {
  return (
    <button
      className={clsx(
        classes.container,
        selected && classes.selected,
        color && classes[color]
      )}
      onClick={onClick}
    >
      <div className={classes.domainImage}>
        <Image src={image} alt={domain} />
      </div>
      <div className={classes.domainName}>{domain}</div>
    </button>
  );
};
