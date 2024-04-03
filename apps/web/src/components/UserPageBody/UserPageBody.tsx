"use client";
import Tabs from "components/Tabs";
import classes from "./UserPageBody.module.scss";

import { useEffect, useState } from "react";
import { ExtendedUserResponse } from "@biosfera/types";
import UserDescription from "@/views/UserDescription";
import { ExponatCard } from "components/ExponatCard";
import { PostCard } from "components/PostCard";
import MembershipCard from "components/MembershipCard";
import { memberWeight } from "components/MembershipCard/MembershipCard";
import CardCollection from "components/CardCollection";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import useUser from "@/utility/context/UserContext";
import EditUserForm from "components/EditUserForm";
import DeleteUserButton from "components/DeleteUserButton";

const tabs = ["O korisniku", "Objave", "Kapljice", "Favoriti", "Organizacije"];

export interface UserPageBodyProps {
  user: ExtendedUserResponse;
}

export const UserPageBody = ({ user }: UserPageBodyProps) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  const [availableTabs, setAvailableTabs] = useState<string[]>(tabs);
  const { user: loggedUser } = useUser();

  useEffect(() => {
    if (availableTabs.includes("Uredi")) return;
    if (
      user.id === loggedUser?.id ||
      loggedUser?.role?.toLowerCase() === "super"
    ) {
      setAvailableTabs((prev) => [
        "Uredi",
        ...prev.filter((tab) => tab !== "O korisniku" && tab !== "Uredi"),
      ]);
      setActiveTab("Uredi");
    }
  }, [loggedUser, user]);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <UserWrapper>
      <div className={classes.container}>
        <Tabs
          activeTab={activeTab}
          onSelect={handleSelectTab}
          tabs={availableTabs}
          key={"tabRow"}
        />
        {activeTab === "Uredi" && (
          <div className={classes.tabContent}>
            <div className={classes.editForm}>
              <span className={classes.title}>Uredi Profil</span>
              <EditUserForm
                isSuper={loggedUser?.role?.toLowerCase() === "super"}
                user={user}
              />
              <DeleteUserButton
                isSuper={loggedUser?.role?.toLowerCase() === "super"}
                userId={user.id}
              />
            </div>
          </div>
        )}
        {activeTab === "O korisniku" && (
          <div className={classes.tabContent}>
            {
              <UserDescription
                bio={user.bio || "Nema opisa korisnika"}
                county={user.location}
                lastUpdated={user.updatedAt}
              />
            }
          </div>
        )}

        {activeTab === "Favoriti" && (
          <div className={classes.tabContent}>
            {
              <CardCollection
                items={user.favouriteExponats}
                sortBy={[
                  { label: "Abecedno", value: "title" },
                  { label: "Znanstveno ime", value: "alternateName" },
                  { label: "Datum Objave", value: "updatedAt" },
                  { label: "Broj Favorita", value: "Favourite Count" },
                ]}
                type="exponat"
              />
            }
          </div>
        )}

        {activeTab === "Objave" && (
          <div className={classes.tabContent}>
            {
              <CardCollection
                items={user.posts}
                sortBy={[
                  { label: "Abecedno", value: "title" },
                  { label: "Datum Objave", value: "updatedAt" },
                  { label: "Likeovi", value: "likeScore" },
                ]}
                type="post"
              />
            }
          </div>
        )}

        {activeTab === "Kapljice" && (
          <div className={classes.tabContent}>
            {
              <CardCollection
                items={user.likedPosts}
                sortBy={[
                  { label: "Abecedno", value: "title" },
                  { label: "Broj Lajkova", value: "likeScore" },
                  { label: "Autor", value: "authorName" },
                ]}
                type="post"
              />
            }
          </div>
        )}

        {activeTab === "Organizacije" && (
          <div className={classes.tabContent}>
            {user.memberships && (
              <CardCollection
                items={user.memberships}
                userId={user.id}
                sortBy={[
                  { label: "Abecedno", value: "name" },
                  { label: "Lokacija", value: "location" },
                  { label: "Uloga", value: "role" },
                ]}
                type="organisation-member"
              />
            )}
          </div>
        )}
      </div>
    </UserWrapper>
  );
};
