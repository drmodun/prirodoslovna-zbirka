"use client";
import Tabs from "components/Tabs";
import classes from "./UserPageBody.module.scss";

import { useEffect, useState } from "react";
import { ExtendedUserResponse, WorkResponseShort } from "@biosfera/types";
import UserDescription from "@/views/UserDescription";
import CardCollection from "components/CardCollection";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import useUser from "@/utility/context/UserContext";
import EditUserForm from "components/EditUserForm";
import DeleteUserButton from "components/DeleteUserButton";
import MultipleEntityTypesView from "@/views/MultipleEntityTypesView";

const tabs = ["O korisniku", "Kreacije", "Reakcije", "Članstva"];

export interface UserPageBodyProps {
  user: ExtendedUserResponse;
  savedLiterature?: WorkResponseShort[];
}

export const UserPageBody = ({ savedLiterature, user }: UserPageBodyProps) => {
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
                username={user.username}
                lastUpdated={user.updatedAt}
              />
            }
          </div>
        )}

        {activeTab === "Reakcije" && (
          <MultipleEntityTypesView
            availableTabs={["Lajkano", "Favoriti", "Spremljeno", "Čitano"]}
            exponats={user.favouriteExponats}
            works={user.savedWorks}
            posts={user.likedPosts}
            userId={user.id}
            initTab="Lajkano"
            literature={savedLiterature}
          />
        )}

        {activeTab === "Kreacije" && (
          <MultipleEntityTypesView
            availableTabs={["Objave", "Radovi"]}
            posts={user.posts}
            works={user.works}
            userId={user.id}
            initTab="Objave"
          />
        )}

        {activeTab === "Članstva" && (
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
