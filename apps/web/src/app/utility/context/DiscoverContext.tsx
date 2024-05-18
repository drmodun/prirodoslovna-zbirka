"use client";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { createContext } from "react";

interface DiscoverContextProps {
  exponatPage: number;
  setExponatPage?: Dispatch<SetStateAction<number>> | undefined;
  organisationPage: number;
  setOrganisationPage?: Dispatch<SetStateAction<number>> | undefined;
  postPage: number;
  workPage: number;
  gbifWorkPage: number;
  setWorkPage: Dispatch<SetStateAction<number>> | undefined;
  setGbifWorkPage: Dispatch<SetStateAction<number>> | undefined;
  setPostPage?: Dispatch<SetStateAction<number>> | undefined;
  resetPages?: () => void;
}

const defaultDiscoverContext: DiscoverContextProps = {
  exponatPage: 1,
  setExponatPage: undefined,
  setGbifWorkPage: undefined,
  setWorkPage: undefined,
  organisationPage: 1,
  gbifWorkPage: 0,
  workPage: 0,
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
    setWorkPage(1);
    setGbifWorkPage(1);
    localStorage.removeItem("exponatPage");
    localStorage.removeItem("organisationPage");
    localStorage.removeItem("postPage");
    localStorage.removeItem("workPage");
    localStorage.removeItem("gbifWorkPage");
  };

  const [exponatPage, setExponatPage] = React.useState<number>(1);
  const [organisationPage, setOrganisationPage] = React.useState<number>(1);
  const [postPage, setPostPage] = React.useState<number>(1);
  const [workPage, setWorkPage] = React.useState<number>(1);
  const [gbifWorkPage, setGbifWorkPage] = React.useState<number>(1);

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
    if (workPage !== 1) localStorage.setItem("workPage", workPage.toString());
  }, [workPage]);

  useEffect(() => {
    if (gbifWorkPage !== 1)
      localStorage.setItem("gbifWorkPage", gbifWorkPage.toString());
  }, [gbifWorkPage]);

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
    const workPage = localStorage.getItem("workPage");
    if (workPage) {
      setWorkPage(parseInt(workPage));
    }
    const gbifWorkPage = localStorage.getItem("gbifWorkPage");
    if (gbifWorkPage) {
      setGbifWorkPage(parseInt(gbifWorkPage));
    }
  }, []);

  return (
    <DiscoverContext.Provider
      value={{
        exponatPage,
        setExponatPage,
        organisationPage,
        setOrganisationPage,
        workPage,
        gbifWorkPage,
        setWorkPage,
        setGbifWorkPage,
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
