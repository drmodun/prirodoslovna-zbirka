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
} from "@biosfera/types";
import { useQueryClient } from "react-query";
import { QueryClientWrapper } from "../wrappers/queryWrapper";

interface UserContextProps {
  user?: ExtendedUserResponse;
  logout?: () => void;
  setUser: Dispatch<ExtendedUserResponse>;
  updateLikes: (post: PostResponse) => void;
  updateFavourites: (exponat: ExponatResponseShort) => void;
  updateMemberships: (organisation: OrganisationResponseShort) => void;
  updatePosts: (post: PostResponse) => void;
  likedPosts: PostResponse[];
  memberships: OrganisationResponseShort[];
  favouriteExponats: ExponatResponseShort[];
  posts: PostResponse[];
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
  likedPosts: [],
  memberships: [],
  favouriteExponats: [],
  posts: [],
  loading: false,
};

export const UserContext = createContext<UserContextProps>(defaultUserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [likedPosts, setLikedPosts] = useState<PostResponse[]>([]);
  const [favouriteExponats, setFavouriteExponats] = useState<
    ExponatResponseShort[]
  >([]);
  const [memberships, setMemberships] = useState<OrganisationResponseShort[]>(
    []
  );
  const [posts, setPosts] = useState<PostResponse[]>([]);
  

  const { data: user, isLoading } = useGetMe();

  const { invalidateQueries } = useQueryClient();

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
    invalidateQueries("me");
  };

  useEffect(() => {
    if (user) {
      setLikedPosts(user.likedPosts);
      setFavouriteExponats(user.favouriteExponats);
      setMemberships(user.memberships);
      setPosts(user.posts);
    }
    console.log(user);
    if (!user) {
      setLikedPosts([]);
      setFavouriteExponats([]);
      setMemberships([]);
      setPosts([]);
    }
  }, [user]);

  useEffect(() => {
    console.log(isLoading);
  }, [isLoading]);

  return (
    <UserContext.Provider
      value={{
        user,
        logout,
        setUser: () => {},
        updateLikes,
        updateMemberships,
        updateFavourites,
        updatePosts,
        likedPosts,
        memberships,
        favouriteExponats,
        posts,
        loading: isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => useContext(UserContext);
export default useUser;
