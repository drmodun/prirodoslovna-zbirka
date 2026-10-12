"use client";

import { useGetMe } from "@/api/useGetMe";

import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ExponatResponseShort,
  ExtendedUserResponse,
  OrganisationResponseShort,
  PostResponse,
  SavedLiteratureResponse,
  ShortUserResponse,
  WorkResponseShort,
} from "@biosfera/types";
import { useGetFollowers } from "@/api/useGetFollowers";
import { useGetFollowing } from "@/api/useGetFollowing";
import { useGetFollowedOrganisations } from "@/api/useGetFollowedOrganisations";
import { useGetMySavedWorks } from "@/api/useGetMySavedWorks";
import { useGetMySavedLiterature } from "@/api/useGetMySavedLiterature";

interface UserContextProps {
  user?: ExtendedUserResponse;
  logout?: () => void;
  setUser: Dispatch<ExtendedUserResponse>;
  updateLikes: (post: PostResponse) => void;
  updateFavourites: (exponat: ExponatResponseShort) => void;
  updateMemberships: (organisation: OrganisationResponseShort) => void;
  updatePosts: (post: PostResponse) => void;
  updateFollowers: (user: ShortUserResponse) => void;
  updateFollowing: (user: ShortUserResponse) => void;
  updateFollowedOrganisation: (organisation: OrganisationResponseShort) => void;
  updateSavedWorks: (work: WorkResponseShort) => void;
  likedPosts: PostResponse[];
  memberships: OrganisationResponseShort[];
  favouriteExponats: ExponatResponseShort[];
  posts: PostResponse[];
  savedWorks: WorkResponseShort[];
  followers: ShortUserResponse[];
  savedLiterature: SavedLiteratureResponse[];
  following: ShortUserResponse[];
  followedOrganisations: OrganisationResponseShort[];
  loading: boolean;
  updateSavedLiterature: (literature: SavedLiteratureResponse) => void;
}

const defaultUserContext: UserContextProps = {
  user: undefined,
  logout: () => {},
  setUser: () => {},
  savedLiterature: [],
  updateSavedLiterature: () => {},
  updateLikes: () => {},
  updateMemberships: () => {},
  updateFavourites: () => {},
  updatePosts: () => {},
  updateSavedWorks: () => {},
  likedPosts: [],
  memberships: [],
  updateFollowedOrganisation: () => {},
  updateFollowers: () => {},
  updateFollowing: () => {},
  favouriteExponats: [],
  followedOrganisations: [],
  followers: [],
  following: [],
  savedWorks: [],
  posts: [],
  loading: false,
};

export const UserContext = createContext<UserContextProps>(defaultUserContext);

// A list where "updating" an item adds it when absent and removes it when
// present, e.g. liking and un-liking a post.
function useToggleList<T>(getKey: (item: T) => unknown) {
  const [list, setList] = useState<T[]>([]);

  const toggle = (item: T) => {
    if (!list) return;
    const key = getKey(item);
    const exists = list.some((x) => getKey(x) === key);
    setList((prev) =>
      exists ? prev.filter((x) => getKey(x) !== key) : [...prev, item],
    );
  };

  return [list, setList, toggle] as const;
}

const byId = (item: { id: string }) => item.id;

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [likedPosts, setLikedPosts, updateLikes] =
    useToggleList<PostResponse>(byId);
  const [followers, setFollowers, updateFollowers] =
    useToggleList<ShortUserResponse>(byId);
  const [following, setFollowing, updateFollowing] =
    useToggleList<ShortUserResponse>(byId);
  const [
    followedOrganisations,
    setFollowedOrganisations,
    updateFollowedOrganisation,
  ] = useToggleList<OrganisationResponseShort>(byId);
  const [favouriteExponats, setFavouriteExponats, updateFavourites] =
    useToggleList<ExponatResponseShort>(byId);
  const [memberships, setMemberships, updateMemberships] =
    useToggleList<OrganisationResponseShort>(byId);
  const [posts, setPosts, updatePosts] = useToggleList<PostResponse>(byId);
  const [savedWorks, setSavedWorks, updateSavedWorks] =
    useToggleList<WorkResponseShort>(byId);
  const [savedLiterature, setSavedLiterature, updateSavedLiterature] =
    useToggleList<SavedLiteratureResponse>((l) => l.literatureId);

  const { data: user, isLoading } = useGetMe();

  const { data: followersGet, isLoading: followLoading } = useGetFollowers(
    user?.id,
  );
  const { data: followingGet, isLoading: followingLoading } = useGetFollowing(
    user?.id,
  );

  const { data: savedLiteratureGet, isLoading: savedLiteratureLoading } =
    useGetMySavedLiterature();

  const { data: savedWorksGet, isLoading: savedWorksLoading } =
    useGetMySavedWorks();

  const { data: followedOrganisationGet, isLoading: orgLoading } =
    useGetFollowedOrganisations();

  useEffect(() => {
    if (followersGet) {
      setFollowers(followersGet);
    }
    if (followingGet) {
      setFollowing(followingGet);
    }
    if (followedOrganisationGet) {
      setFollowedOrganisations(followedOrganisationGet);
    }
  }, [followersGet, followingGet, followedOrganisationGet]);

  useEffect(() => {
    if (savedWorksGet) {
      setSavedWorks(savedWorksGet);
    }
    if (savedLiteratureGet) {
      setSavedLiterature(savedLiteratureGet);
    }
  }, [savedWorksGet, savedLiteratureGet]);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("time");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  useEffect(() => {
    if (user) {
      setLikedPosts(user.likedPosts);
      setFavouriteExponats(user.favouriteExponats);
      setMemberships(user.memberships);
      setPosts(user.posts);
    }
    if (!user) {
      setLikedPosts([]);
      setFavouriteExponats([]);
      setMemberships([]);
      setPosts([]);
    }
  }, [user?.id]);

  return (
    <UserContext.Provider
      value={{
        user,
        logout,
        setUser: () => {},
        updateLikes,
        updateMemberships,
        updateSavedLiterature,
        updateFavourites,
        updateSavedWorks,
        updatePosts,
        likedPosts,
        memberships,
        favouriteExponats,
        savedWorks,
        posts,
        savedLiterature,
        followers,
        following,
        followedOrganisations,
        updateFollowers,
        updateFollowing,
        updateFollowedOrganisation,

        loading:
          isLoading ||
          followLoading ||
          followingLoading ||
          orgLoading ||
          savedLiteratureLoading ||
          savedWorksLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => useContext(UserContext);
export default useUser;
