import {
  ExponatResponseShort,
  OrganisationResponseShort,
  PostResponse,
  ShortUserResponse,
  WorkResponseShort,
} from "@biosfera/types";
import { Indexable } from "@biosfera/types/src/jsonObjects";
import { ExponatCard } from "components/ExponatCard";
import MembershipCard from "components/MembershipCard";
import OrganisationCard from "components/OrganisationCard";
import { PostCard } from "components/PostCard";
import WorkCard from "components/WorkCard";
import { getPfpUrl } from "@/utility/static/getPfpUrl";
import { CardPermissions } from "./useCardPermissions";

export type CollectionCardType =
  | "exponat"
  | "post"
  | "user"
  | "organisation"
  | "user-member"
  | "organisation-member"
  | "work"
  | "literature";

export interface CollectionCardProps {
  type: CollectionCardType;
  item: Indexable;
  permissions: CardPermissions;
  onRemove: (id: string) => void;
  // Only the non-paginated collection drops a deleted work from its list.
  onRemoveWork?: (id: string) => void;
  organisationId?: string;
  userId?: string;
}

const UserCard = ({
  item,
  permissions,
  onRemove,
  organisationId,
  isMember,
}: Omit<CollectionCardProps, "type"> & { isMember?: boolean }) => {
  const user = item as ShortUserResponse & Indexable;
  return (
    <MembershipCard
      description={user.email}
      type="user"
      image={
        isMember
          ? getPfpUrl(user.id)
          : user.hasProfileImage && getPfpUrl(user.id)
      }
      object={user}
      role={isMember ? (user.role as string) : user.location}
      isUser={permissions.isCurrentUser(user.id)}
      onRemove={onRemove}
      isFollowCard={!isMember}
      organisationId={organisationId}
      isAdmin={permissions.isOrganisationAdmin(organisationId)}
      name={user.username}
      id={user.id}
    />
  );
};

export const CollectionCard = (props: CollectionCardProps) => {
  const { type, item, permissions, onRemove, organisationId, userId } = props;

  switch (type) {
    case "exponat":
      return (
        <ExponatCard
          exponat={item as ExponatResponseShort}
          isAdmin={permissions.isOrganisationAdmin(
            (item as ExponatResponseShort).organizationId,
          )}
          onRemove={onRemove}
        />
      );
    case "post":
      return (
        <PostCard
          post={item as PostResponse}
          isAdmin={permissions.isOrganisationAdmin(
            organisationId ?? (item as PostResponse).organisationId,
          )}
          onRemove={onRemove}
          isUser={permissions.isCurrentUser((item as PostResponse).authorId)}
        />
      );
    case "user":
      return <UserCard {...props} />;
    case "user-member":
      return <UserCard {...props} isMember />;
    case "organisation-member": {
      const organisation = item as OrganisationResponseShort & Indexable;
      return (
        <MembershipCard
          description={organisation.location}
          type="organisation"
          image={organisation.mainImage}
          object={organisation}
          role={organisation.role as string}
          name={organisation.name}
          onRemove={onRemove}
          id={organisation.id}
          organisationId={organisation.id}
          isAdmin={permissions.isOrganisationAdmin(organisation.id)}
          isUser={permissions.isCurrentUser(userId)}
        />
      );
    }
    case "organisation":
      return (
        <OrganisationCard organisation={item as OrganisationResponseShort} />
      );
    case "work":
      return (
        <WorkCard
          work={item as WorkResponseShort}
          isAdmin={permissions.isOrganisationAdmin(item.organisationId)}
          onDelete={props.onRemoveWork}
        />
      );
    case "literature":
      return <WorkCard work={item as WorkResponseShort} />;
  }
};
