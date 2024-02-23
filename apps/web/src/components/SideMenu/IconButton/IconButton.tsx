import clsx from "clsx";
import Image from "next/image";
import c from "./IconButton.module.scss";

type IconButtonProps = {
  icon: string;
} & React.HTMLAttributes<HTMLButtonElement>;

const IconButton = ({ icon, className, ...handlers }: IconButtonProps) => {
  const classes = clsx(c.sideMenu, className);
  return (
    <button {...handlers}>
      <Image className={classes} src={icon} alt="icon" />
    </button>
  );
};

export default IconButton;
