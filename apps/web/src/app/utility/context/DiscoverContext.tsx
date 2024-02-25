"use client";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { createContext } from "react";
import useUser from "./UserContext";

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
  };

  const [exponatPage, setExponatPage] = React.useState<number>(1);
  const [organisationPage, setOrganisationPage] = React.useState<number>(1);
  const [postPage, setPostPage] = React.useState<number>(1);

  const {
    user,
    likedPosts,
    favouriteExponats,
    followedOrganisations,
    followers,
    following,
  } = useUser();

  useEffect(() => {
    resetPages();
  }, [
    user?.id,
    likedPosts,
    favouriteExponats,
    followedOrganisations,
    followers,
    following,
  ]);

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
