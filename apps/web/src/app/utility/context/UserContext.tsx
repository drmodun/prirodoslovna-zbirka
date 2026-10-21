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

// Lists that arrive with the user's own profile.
const useProfileLists = (user?: ExtendedUserResponse) => {
  const [likedPosts, setLikedPosts, updateLikes] =
    useToggleList<PostResponse>(byId);
  const [favouriteExponats, setFavouriteExponats, updateFavourites] =
    useToggleList<ExponatResponseShort>(byId);
  const [memberships, setMemberships, updateMemberships] =
    useToggleList<OrganisationResponseShort>(byId);
  const [posts, setPosts, updatePosts] = useToggleList<PostResponse>(byId);

  useEffect(() => {
    setLikedPosts(user ? user.likedPosts : []);
    setFavouriteExponats(user ? user.favouriteExponats : []);
    setMemberships(user ? user.memberships : []);
    setPosts(user ? user.posts : []);
  }, [user?.id, setLikedPosts, setFavouriteExponats, setMemberships, setPosts]);

  return {
    likedPosts,
    updateLikes,
    favouriteExponats,
    updateFavourites,
    memberships,
    updateMemberships,
    posts,
    updatePosts,
  };
};

const useFollowLists = (userId?: string) => {
  const [followers, setFollowers, updateFollowers] =
    useToggleList<ShortUserResponse>(byId);
  const [following, setFollowing, updateFollowing] =
    useToggleList<ShortUserResponse>(byId);
  const [
    followedOrganisations,
    setFollowedOrganisations,
    updateFollowedOrganisation,
  ] = useToggleList<OrganisationResponseShort>(byId);

  const followersQuery = useGetFollowers(userId);
  const followingQuery = useGetFollowing(userId);
  const organisationsQuery = useGetFollowedOrganisations();

  useEffect(() => {
    if (followersQuery.data) setFollowers(followersQuery.data);
    if (followingQuery.data) setFollowing(followingQuery.data);
    if (organisationsQuery.data)
      setFollowedOrganisations(organisationsQuery.data);
  }, [
    followersQuery.data,
    followingQuery.data,
    organisationsQuery.data,
    setFollowers,
    setFollowing,
    setFollowedOrganisations,
  ]);

  return {
    followers,
    updateFollowers,
    following,
    updateFollowing,
    followedOrganisations,
    updateFollowedOrganisation,
    loading:
      followersQuery.isLoading ||
      followingQuery.isLoading ||
      organisationsQuery.isLoading,
  };
};

const useSavedLists = () => {
  const [savedWorks, setSavedWorks, updateSavedWorks] =
    useToggleList<WorkResponseShort>(byId);
  const [savedLiterature, setSavedLiterature, updateSavedLiterature] =
    useToggleList<SavedLiteratureResponse>((l) => l.literatureId);

  const worksQuery = useGetMySavedWorks();
  const literatureQuery = useGetMySavedLiterature();

  useEffect(() => {
    if (worksQuery.data) setSavedWorks(worksQuery.data);
    if (literatureQuery.data) setSavedLiterature(literatureQuery.data);
  }, [
    worksQuery.data,
    literatureQuery.data,
    setSavedWorks,
    setSavedLiterature,
  ]);

  return {
    savedWorks,
    updateSavedWorks,
    savedLiterature,
    updateSavedLiterature,
    loading: worksQuery.isLoading || literatureQuery.isLoading,
  };
};

const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("loggedTime");
  setTimeout(() => {
    window.location.href = "/";
  }, 1000);
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading } = useGetMe();
  const profile = useProfileLists(user);
  const { loading: followsLoading, ...follows } = useFollowLists(user?.id);
  const { loading: savedLoading, ...saved } = useSavedLists();

  return (
    <UserContext.Provider
      value={{
        user,
        logout,
        setUser: () => {},
        ...profile,
        ...follows,
        ...saved,
        loading: isLoading || followsLoading || savedLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => useContext(UserContext);
export default useUser;
