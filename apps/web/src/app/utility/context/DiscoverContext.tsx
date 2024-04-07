"use client";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { createContext } from "react";

interface DiscoverContextProps {
  exponatPage: number;
  setExponatPage?: Dispatch<SetStateAction<number>> | undefined;
  organisationPage: number;
  setOrganisationPage?: Dispatch<SetStateAction<number>> | undefined;
  postPage: number;
  setPostPage?: Dispatch<SetStateAction<number>> | undefined;
  resetPages?: () => void;
}

const defaultDiscoverContext: DiscoverContextProps = {
  exponatPage: 1,
  setExponatPage: undefined,
  organisationPage: 1,
  setOrganisationPage: undefined,
  postPage: 1,
  setPostPage: undefined,
  resetPages: () => {},
};

const DiscoverContext = createContext<DiscoverContextProps>(
  defaultDiscoverContext
);

export const DiscoverProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const resetPages = () => {
    setExponatPage(1);
    setOrganisationPage(1);
    setPostPage(1);
    localStorage.removeItem("exponatPage");
    localStorage.removeItem("organisationPage");
    localStorage.removeItem("postPage");
  };

  const [exponatPage, setExponatPage] = React.useState<number>(1);
  const [organisationPage, setOrganisationPage] = React.useState<number>(1);
  const [postPage, setPostPage] = React.useState<number>(1);

  useEffect(() => {
    if (exponatPage !== 1)
      localStorage.setItem("exponatPage", exponatPage.toString());
  }, [exponatPage]);

  useEffect(() => {
    if (organisationPage !== 1)
      localStorage.setItem("organisationPage", organisationPage.toString());
  }, [organisationPage]);

  useEffect(() => {
    if (postPage !== 1) localStorage.setItem("postPage", postPage.toString());
  }, [postPage]);

  useEffect(() => {
    const exponatPage = localStorage.getItem("exponatPage");
    if (exponatPage) {
      setExponatPage(parseInt(exponatPage));
    }
    const organisationPage = localStorage.getItem("organisationPage");
    if (organisationPage) {
      setOrganisationPage(parseInt(organisationPage));
    }
    const postPage = localStorage.getItem("postPage");
    if (postPage) {
      setPostPage(parseInt(postPage));
    }
  }, []);

  return (
    <DiscoverContext.Provider
      value={{
        exponatPage,
        setExponatPage,
        organisationPage,
        setOrganisationPage,
        postPage,
        setPostPage,
        resetPages,
      }}
    >
      {children}
    </DiscoverContext.Provider>
  );
};

const useDiscover = () => React.useContext(DiscoverContext);

export default useDiscover;
