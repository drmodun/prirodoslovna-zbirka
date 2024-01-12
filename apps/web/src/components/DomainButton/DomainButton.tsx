export interface DomainButtonProps {
  domain: string;
  onClick?: () => void;
  selected?: boolean;
  image: string;
  color?: string; //TODO: maybe make a class type solution instead of text
}

import Image from "next/image";
import classes from "./DomainButton.module.scss";

export const DomainButton = ({
  image,
  onClick,
  domain,
  selected,
  color,
}: DomainButtonProps) => {
  return (
    <button
      className={classes.container}
      style={{
        backgroundColor: selected ? color : "transparent",
        color: selected ? "white" : color,
      }}
      onClick={onClick}
    >
      <div className={classes.domainImage}>
        <Image src={image} alt={domain} />
      </div>
      <div className={classes.domainName}>{domain}</div>
    </button>
  );
};
