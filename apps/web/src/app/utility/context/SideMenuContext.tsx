"use client";

import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface SideMenuContextProps {
  active: boolean;
  toggleActive: () => void;
}

const defaultSideMenuContext: SideMenuContextProps = {
  active: false,
  toggleActive: () => {},
};

export const SideMenuContext = createContext<SideMenuContextProps>(
  defaultSideMenuContext,
);

export const SideMenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [active, setActive] = useState<boolean>(false);

  const toggleActive = () => {
    setActive((prev) => !prev);
  };

  return (
    <SideMenuContext.Provider
      value={
        {
          active,
          toggleActive,
        } as SideMenuContextProps
      }
    >
      {children}
    </SideMenuContext.Provider>
  );
};

const useSideMenu = () => useContext(SideMenuContext);
export default useSideMenu;
