"use client";
import { ExponatExtendedResponse } from "@biosfera/types";
import CardCollection from "components/CardCollection";
import classes from "./SingleExponatView.module.scss";
import useUser from "@/utility/context/UserContext";
import BaseButton from "components/BaseButton";
import Link from "next/link";
import CardCollectionAsync from "components/CardCollectionAsync";
export interface SingleExponatViewProps {
  exponat: ExponatExtendedResponse;
}

export const SingleExponatView = (props: SingleExponatViewProps) => {
  const { memberships } = useUser();
  return (
    <div className={classes.posts}>
      {memberships.some(
        (membership) =>
          membership.id === props.exponat.organizationId &&
          membership.role?.toLowerCase() !== "requested",
      ) && (
        <Link
          href={`/exponat/${props.exponat.id}/createPost`}
          className={classes.buttonWrapper}
        >
          <BaseButton text="Dodaj Objavu" />
        </Link>
      )}
      <span className={classes.title}>Objave</span>
      <CardCollection
        items={props.exponat.posts}
        type="post"
        sortBy={[
          { label: "Abecedno", value: "title" },
          { label: "Likeovi", value: "likeScore" },
          { label: "Datum Objave", value: "updatedAt" },
        ]}
        pageSize={12}
      />
    </div>
  );
};
