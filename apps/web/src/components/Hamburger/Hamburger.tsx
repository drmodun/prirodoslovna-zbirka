"use client";
import React from "react";
import cx from "clsx";

import styles from "./Hamburger.module.scss";

interface HamburgerProps {
  open: boolean;
  onToggle: () => void;
  classes?: {
    bar?: string;
  };
}

export const Hamburger: React.FC<HamburgerProps> = ({
  open,
  onToggle,
  classes,
}) => (
  <button
    type="button"
    onClick={onToggle}
    awia-label="Toggle menu"
    className={cx(styles.container, { [styles.open]: open })}
  >
    <span className={styles.label}>
      <span className={cx(styles.bar, classes?.bar)} />
      <span className={cx(styles.bar, classes?.bar)} />
      <span className={cx(styles.bar, classes?.bar)} />
    </span>
  </button>
);
