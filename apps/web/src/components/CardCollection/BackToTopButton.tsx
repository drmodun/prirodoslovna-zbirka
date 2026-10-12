import clsx from "clsx";
import Image from "next/image";
import dArrow from "assets/images/d-arrow.svg";

interface BackToTopButtonProps {
  // Each collection styles the button from its own stylesheet.
  classes: { readonly [key: string]: string };
  visible: boolean;
  target: React.RefObject<HTMLDivElement>;
}

export const BackToTopButton = ({
  classes,
  visible,
  target,
}: BackToTopButtonProps) => (
  <div
    className={clsx(
      classes.floatingButton,
      visible ? classes.show : classes.hide,
    )}
  >
    <div
      className={classes.image}
      onClick={() =>
        target.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    >
      <Image src={dArrow} alt="back to top arrow" />
    </div>
  </div>
);
