import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setUserContext } from "test-utils/userContext";

jest.mock("@/utility/context/UserContext", () => ({
  __esModule: true,
  default: () => require("test-utils/userContext").mockUserContext,
}));

const state = {
  removePost: { mutate: jest.fn(), isSuccess: false },
  removeWork: { mutate: jest.fn(), isSuccess: false },
  removeExponat: { mutate: jest.fn(), isSuccess: false },
  leave: { mutate: jest.fn() },
  removeMembership: { mutate: jest.fn() },
  deleteUser: { mutateAsync: jest.fn() },
  adminDeleteUser: { mutateAsync: jest.fn() },
  deleteOrganisation: { mutateAsync: jest.fn() },
};
jest.mock("@/api/useRemovePost", () => ({
  useRemovePost: () => state.removePost,
}));
jest.mock("@/api/useRemoveWork", () => ({
  useRemoveWork: () => state.removeWork,
}));
jest.mock("@/api/useRemoveExponat", () => ({
  useRemoveExponat: () => state.removeExponat,
}));
jest.mock("@/api/useLeaveOrganisation", () => ({
  useLeaveMembership: () => state.leave,
}));
jest.mock("@/api/useRemoveMembership", () => ({
  useRemoveMembership: () => state.removeMembership,
}));
jest.mock("@/api/useDeleteUser", () => ({
  useDeleteUser: () => state.deleteUser,
}));
jest.mock("@/api/useAdminDeleteUser", () => ({
  useAdminDeleteUser: () => state.adminDeleteUser,
}));
jest.mock("@/api/useDeleteOrganisation", () => ({
  useDeleteOrganisation: () => state.deleteOrganisation,
}));

import { DeleteOrganisationButton } from "../DeleteOrganisationButton/DeleteOrganisationButton";
import { DeleteUserButton } from "../DeleteUserButton/DeleteUserButton";
import LeaveOrganisationButton from "../LeaveOrganisationButton";
import { RemoveExponatButton } from "../RemoveExponatButton/RemoveExponatButton";
import { RemoveMembershipButton } from "../RemoveMembershipButton/RemoveMembershipButton";
import { RemovePostButton } from "../RemovePostButton/RemovePostButton";
import { RemoveWorkButton } from "../RemoveWorkButton/RemoveWorkButton";

const confirm = (answer: boolean) =>
  jest.spyOn(window, "confirm").mockReturnValue(answer);

beforeEach(() => {
  state.removePost = { mutate: jest.fn(), isSuccess: false };
  state.removeWork = { mutate: jest.fn(), isSuccess: false };
  state.removeExponat = { mutate: jest.fn(), isSuccess: false };
  state.leave = { mutate: jest.fn() };
  state.removeMembership = { mutate: jest.fn() };
  state.deleteUser.mutateAsync.mockResolvedValue({});
  state.adminDeleteUser.mutateAsync.mockResolvedValue({});
  state.deleteOrganisation.mutateAsync.mockResolvedValue({});
  setUserContext();
});

describe("RemovePostButton", () => {
  it("asks for confirmation before deleting", async () => {
    confirm(true);
    render(<RemovePostButton postId="p1" />);
    await userEvent.click(screen.getByTitle("Delete Post"));
    expect(window.confirm).toHaveBeenCalled();
    expect(state.removePost.mutate).toHaveBeenCalledWith("p1");
  });

  it("does nothing on the server when the user cancels", async () => {
    confirm(false);
    render(<RemovePostButton postId="p1" />);
    await userEvent.click(screen.getByTitle("Delete Post"));
    expect(state.removePost.mutate).not.toHaveBeenCalled();
  });

  it("drops the post from the user's own and liked posts when deleted", async () => {
    confirm(true);
    const ctx = setUserContext({
      posts: [{ id: "p1" }],
      likedPosts: [{ id: "p1" }],
    });
    render(<RemovePostButton postId="p1" />);
    await userEvent.click(screen.getByTitle("Delete Post"));
    expect(ctx.updatePosts).toHaveBeenCalledWith({ id: "p1" });
    expect(ctx.updateLikes).toHaveBeenCalledWith({ id: "p1" });
  });

  // BUG: the shared lists are updated even when the user pressed "Cancel".
  it.failing(
    "keeps the post in the user's lists when the user cancels",
    async () => {
      confirm(false);
      const ctx = setUserContext({
        posts: [{ id: "p1" }],
        likedPosts: [{ id: "p1" }],
      });
      render(<RemovePostButton postId="p1" />);
      await userEvent.click(screen.getByTitle("Delete Post"));
      expect(ctx.updatePosts).not.toHaveBeenCalled();
      expect(ctx.updateLikes).not.toHaveBeenCalled();
    },
  );

  it("calls onRemove once the deletion succeeded", () => {
    state.removePost.isSuccess = true;
    const onRemove = jest.fn();
    render(<RemovePostButton postId="p1" onRemove={onRemove} />);
    expect(onRemove).toHaveBeenCalledWith("p1");
  });

  it.each([
    ["authors see the edit link", {}, true],
    ["hidden posts have no edit link", { isHidden: true }, false],
    ["admins have no edit link", { isAdmin: true }, false],
  ])("%s", (_n, props, hasEdit) => {
    render(<RemovePostButton postId="p1" {...props} />);
    const link = screen.queryByRole("link");
    expect(!!link).toBe(hasEdit);
    if (hasEdit) expect(link).toHaveAttribute("href", "/post/p1/edit");
  });
});

describe("RemoveWorkButton", () => {
  it("deletes after confirmation only", async () => {
    confirm(false);
    render(<RemoveWorkButton workId="w1" />);
    await userEvent.click(screen.getByTitle("Delete Work"));
    expect(state.removeWork.mutate).not.toHaveBeenCalled();
    confirm(true);
    await userEvent.click(screen.getByTitle("Delete Work"));
    expect(state.removeWork.mutate).toHaveBeenCalledWith("w1");
  });

  it("links to the edit page unless hidden, and reports success", () => {
    state.removeWork.isSuccess = true;
    const onRemove = jest.fn();
    const { rerender } = render(
      <RemoveWorkButton workId="w1" onRemove={onRemove} />,
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/work/w1/edit");
    expect(onRemove).toHaveBeenCalledWith("w1");
    rerender(<RemoveWorkButton workId="w1" isHidden />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("RemoveExponatButton", () => {
  it("deletes after confirmation and drops it from the user's favourites", async () => {
    confirm(true);
    const ctx = setUserContext({ favouriteExponats: [{ id: "e1" }] });
    render(<RemoveExponatButton exponatId="e1" />);
    await userEvent.click(screen.getByTitle("Delete Exponat"));
    expect(state.removeExponat.mutate).toHaveBeenCalledWith("e1");
    expect(ctx.updateFavourites).toHaveBeenCalledWith({ id: "e1" });
  });

  it("does not delete when cancelled", async () => {
    confirm(false);
    render(<RemoveExponatButton exponatId="e1" />);
    await userEvent.click(screen.getByTitle("Delete Exponat"));
    expect(state.removeExponat.mutate).not.toHaveBeenCalled();
  });

  // BUG: same as RemovePostButton: favourites are changed even after "Cancel".
  it.failing("keeps the favourite when the user cancels", async () => {
    confirm(false);
    const ctx = setUserContext({ favouriteExponats: [{ id: "e1" }] });
    render(<RemoveExponatButton exponatId="e1" />);
    await userEvent.click(screen.getByTitle("Delete Exponat"));
    expect(ctx.updateFavourites).not.toHaveBeenCalled();
  });

  it("links to the edit page unless hidden", () => {
    const { rerender } = render(<RemoveExponatButton exponatId="e1" />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/exponat/e1/edit",
    );
    rerender(<RemoveExponatButton exponatId="e1" isHidden />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("LeaveOrganisationButton", () => {
  it("leaves, updates the memberships and reports it", async () => {
    confirm(true);
    const ctx = setUserContext({ memberships: [{ id: "o1" }] });
    const onRemove = jest.fn();
    render(<LeaveOrganisationButton organisationId="o1" onRemove={onRemove} />);
    await userEvent.click(screen.getByTitle("Leave Organisation"));
    expect(state.leave.mutate).toHaveBeenCalledWith("o1");
    expect(ctx.updateMemberships).toHaveBeenCalledWith({ id: "o1" });
    expect(onRemove).toHaveBeenCalledWith("o1");
  });

  it("does nothing when cancelled", async () => {
    confirm(false);
    const ctx = setUserContext({ memberships: [{ id: "o1" }] });
    render(<LeaveOrganisationButton organisationId="o1" />);
    await userEvent.click(screen.getByTitle("Leave Organisation"));
    expect(state.leave.mutate).not.toHaveBeenCalled();
    expect(ctx.updateMemberships).not.toHaveBeenCalled();
  });
});

describe("RemoveMembershipButton", () => {
  it("removes the given member after confirmation", async () => {
    confirm(true);
    const onRemove = jest.fn();
    render(
      <RemoveMembershipButton
        organisationId="o1"
        userId="u1"
        onRemove={onRemove}
      />,
    );
    await userEvent.click(screen.getByTitle("Remove Membership"));
    expect(state.removeMembership.mutate).toHaveBeenCalledWith({
      organisationId: "o1",
      userId: "u1",
    });
    expect(onRemove).toHaveBeenCalledWith("u1");
  });

  it("does nothing when cancelled", async () => {
    confirm(false);
    const onRemove = jest.fn();
    render(
      <RemoveMembershipButton
        organisationId="o1"
        userId="u1"
        onRemove={onRemove}
      />,
    );
    await userEvent.click(screen.getByTitle("Remove Membership"));
    expect(state.removeMembership.mutate).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });
});

describe("DeleteUserButton", () => {
  it("normal users delete their own account", async () => {
    confirm(true);
    render(<DeleteUserButton />);
    await userEvent.click(screen.getByTitle("Obriši korisnika"));
    expect(state.deleteUser.mutateAsync).toHaveBeenCalled();
    expect(state.adminDeleteUser.mutateAsync).not.toHaveBeenCalled();
  });

  it("super users delete the given user", async () => {
    confirm(true);
    render(<DeleteUserButton isSuper userId="u9" />);
    await userEvent.click(screen.getByTitle("Obriši korisnika"));
    expect(state.adminDeleteUser.mutateAsync).toHaveBeenCalledWith("u9");
    expect(state.deleteUser.mutateAsync).not.toHaveBeenCalled();
  });

  it("does nothing when cancelled", async () => {
    confirm(false);
    render(<DeleteUserButton isSuper userId="u9" />);
    await userEvent.click(screen.getByTitle("Obriši korisnika"));
    expect(state.adminDeleteUser.mutateAsync).not.toHaveBeenCalled();
  });
});

describe("DeleteOrganisationButton", () => {
  it("deletes after confirmation", async () => {
    confirm(true);
    render(<DeleteOrganisationButton organisationId="o1" />);
    await userEvent.click(screen.getByTitle("Obriši organizaciju"));
    expect(state.deleteOrganisation.mutateAsync).toHaveBeenCalledWith("o1");
  });

  it("does nothing when cancelled", async () => {
    confirm(false);
    render(<DeleteOrganisationButton organisationId="o1" />);
    await userEvent.click(screen.getByTitle("Obriši organizaciju"));
    expect(state.deleteOrganisation.mutateAsync).not.toHaveBeenCalled();
  });
});
