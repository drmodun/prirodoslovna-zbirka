"use client";

import { useGetMe } from "@/api/useGetMe";

import React, {
  Dispatch,
  createContext,
  use,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ExponatResponseShort,
  ExtendedUserResponse,
  OrganisationResponseShort,
  PostResponse,
  ShortUserResponse,
  WorkResponseShort,
} from "@biosfera/types";
import { useQueryClient } from "react-query";
import { QueryClientWrapper } from "../wrappers/queryWrapper";
import { useGetFollowers } from "@/api/useGetFollowers";
import { useGetFollowing } from "@/api/useGetFollowing";
import { useGetFollowedOrganisations } from "@/api/useGetFollowedOrganisations";
import { set } from "react-hook-form";
import { useGetSavedWorks } from "@/api/useGetSavedWorks";

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
  following: ShortUserResponse[];
  followedOrganisations: OrganisationResponseShort[];
  loading: boolean;
}

const defaultUserContext: UserContextProps = {
  user: undefined,
  logout: () => {},
  setUser: () => {},
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

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [likedPosts, setLikedPosts] = useState<PostResponse[]>([]);
  const [followers, setFollowers] = useState<ShortUserResponse[]>([]);
  const [following, setFollowing] = useState<ShortUserResponse[]>([]);
  const [followedOrganisations, setFollowedOrganisations] = useState<
    OrganisationResponseShort[]
  >([]);
  const [favouriteExponats, setFavouriteExponats] = useState<
    ExponatResponseShort[]
  >([]);
  const [memberships, setMemberships] = useState<OrganisationResponseShort[]>(
    []
  );
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [savedWorks, setSavedWorks] = useState<WorkResponseShort[]>([]);

  const { data: user, isLoading } = useGetMe();

  const { data: followersGet, isLoading: followLoading } = useGetFollowers(
    user?.id
  );
  const { data: followingGet, isLoading: followingLoading } = useGetFollowing(
    user?.id
  );

  const { data: savedWorksGet, isLoading: savedWorksLoading } =
    useGetSavedWorks(user?.id);

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

  const updatePosts = (post: PostResponse) => {
    if (!posts) return;
    const possiblePost = posts.find((p) => p.id === post.id);
    if (possiblePost) {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      return;
    }
    setPosts((prev) => [...prev, post]);
  };

  const updateFavourites = (exponat: ExponatResponseShort) => {
    if (!favouriteExponats) return;
    const possibleExponat = favouriteExponats.find(
      (ex) => ex.id === exponat.id
    );
    if (possibleExponat) {
      setFavouriteExponats((prev) => prev.filter((ex) => ex.id !== exponat.id));
      return;
    }
    setFavouriteExponats((prev) => [...prev, exponat]);
  };

  const updateFollowers = (user: ShortUserResponse) => {
    if (!followers) return;
    const possibleUser = followers.find((u) => u.id === user.id);
    if (possibleUser) {
      setFollowers((prev) => prev.filter((u) => u.id !== user.id));
      return;
    }
    setFollowers((prev) => [...prev, user]);
  };

  const updateFollowing = (user: ShortUserResponse) => {
    if (!following) return;
    const possibleUser = following.find((u) => u.id === user.id);
    if (possibleUser) {
      setFollowing((prev) => prev.filter((u) => u.id !== user.id));
      return;
    }
    setFollowing((prev) => [...prev, user]);
  };

  const updateFollowedOrganisation = (
    organisation: OrganisationResponseShort
  ) => {
    if (!followedOrganisations) return;
    const possibleOrganisation = followedOrganisations.find(
      (org) => org.id === organisation.id
    );
    if (possibleOrganisation) {
      setFollowedOrganisations((prev) =>
        prev.filter((org) => org.id !== organisation.id)
      );
      return;
    }
    setFollowedOrganisations((prev) => [...prev, organisation]);
  };

  const updateMemberships = (organisation: OrganisationResponseShort) => {
    if (!memberships) return;
    const possibleOrganisation = memberships.find(
      (org) => org.id === organisation.id
    );
    if (possibleOrganisation) {
      setMemberships((prev) =>
        prev.filter((org) => org.id !== organisation.id)
      );
      return;
    }
    setMemberships((prev) => [...prev, organisation]);
  };

  const updateSavedWorks = (work: WorkResponseShort) => {
    if (!savedWorks) return;
    const possibleWork = savedWorks.find((w) => w.id === work.id);
    if (possibleWork) {
      setSavedWorks((prev) => prev.filter((w) => w.id !== work.id));
      return;
    }
    setSavedWorks((prev) => [...prev, work]);
  };

  const updateLikes = (post: PostResponse) => {
    if (!likedPosts) return;
    const possiblePost = likedPosts.find((p) => p.id === post.id);
    if (possiblePost) {
      setLikedPosts((prev) => prev.filter((p) => p.id !== post.id));
      return;
    }
    setLikedPosts((prev) => [...prev, post]);
  };

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
        updateFavourites,
        updateSavedWorks,
        updatePosts,
        likedPosts,
        memberships,
        favouriteExponats,
        savedWorks,
        posts,
        followers,
        following,
        followedOrganisations,
        updateFollowers,
        updateFollowing,
        updateFollowedOrganisation,

        loading: isLoading || followLoading || followingLoading || orgLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => useContext(UserContext);
export default useUser;
