import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setUserContext } from "test-utils/userContext";

jest.mock("@/utility/context/UserContext", () => ({
  __esModule: true,
  default: () => require("test-utils/userContext").mockUserContext,
}));

const toggles = {
  like: jest.fn(),
  favourite: jest.fn(),
  saveWork: jest.fn(),
  saveLiterature: jest.fn(),
  followUser: jest.fn(),
  followOrganisation: jest.fn(),
  approval: jest.fn(),
};
jest.mock("@/api/useToggleLike", () => ({
  useToggleLike: () => ({ mutateAsync: toggles.like }),
}));
jest.mock("@/api/useToggleFavourite", () => ({
  useToggleFavourite: () => ({ mutateAsync: toggles.favourite }),
}));
jest.mock("@/api/useToggleSaveWork", () => ({
  useToggleSaveWork: () => ({ mutateAsync: toggles.saveWork }),
}));
jest.mock("@/api/useToggleSaveLiterature", () => ({
  useToggleSaveLiterature: () => ({ mutateAsync: toggles.saveLiterature }),
}));
jest.mock("@/api/useToggleFollowUser", () => ({
  useToggleFollow: () => ({ mutateAsync: toggles.followUser }),
}));
jest.mock("@/api/useToggleFollowOrganisation", () => ({
  useToggleFollowOrganisation: () => ({
    mutateAsync: toggles.followOrganisation,
  }),
}));
jest.mock("@/api/useToggleApproval", () => ({
  useToggleApproval: () => ({ mutateAsync: toggles.approval }),
}));

import { BaseButton } from "../BaseButton/BaseButton";
import { FavouriteButton } from "../FavouriteButton/FavouriteButton";
import { LikeButton } from "../LikeButton/LikeButton";
import { MembershipFollowButton } from "../MembershipFollowButton/MembershipFollowButton";
import { SaveButton } from "../SaveButton/SaveButton";
import { ToggleApprovalButton } from "../ToggleApprovalButton/ToggleApprovalButton";
import FollowButton from "../UserFollowButton";

beforeEach(() => {
  Object.values(toggles).forEach((fn) => fn.mockResolvedValue({}));
});

describe("LikeButton", () => {
  const post = { id: "p1" } as any;

  it("renders nothing while the user is loading", () => {
    setUserContext({ loading: true });
    const { container } = render(<LikeButton post={post} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("is not marked as liked when the post is not in the user's likes", () => {
    setUserContext();
    render(<LikeButton post={post} />);
    expect(screen.getByTitle("Lajk").className).not.toMatch(/liked/);
  });

  it("is marked as liked when the post is already liked", () => {
    setUserContext({ likedPosts: [{ id: "p1" }] });
    render(<LikeButton post={post} />);
    expect(screen.getByTitle("Lajk").className).toMatch(/liked/);
  });

  it("toggles on the server, updates the shared state and flips the style", async () => {
    const ctx = setUserContext();
    render(<LikeButton post={post} />);
    await userEvent.click(screen.getByTitle("Lajk"));
    expect(toggles.like).toHaveBeenCalledWith("p1");
    expect(ctx.updateLikes).toHaveBeenCalledWith(post);
    await waitFor(() =>
      expect(screen.getByTitle("Lajk").className).toMatch(/liked/),
    );
  });
});

describe("FavouriteButton", () => {
  const exponat = { id: "e1" } as any;

  it("reflects the user's favourites", () => {
    setUserContext({ favouriteExponats: [{ id: "e1" }] });
    render(<FavouriteButton exponat={exponat} />);
    expect(screen.getByTitle("Favorit").className).toMatch(/favourite/);
  });

  it("toggles on the server and in the shared state", async () => {
    const ctx = setUserContext();
    render(<FavouriteButton exponat={exponat} />);
    await userEvent.click(screen.getByTitle("Favorit"));
    expect(toggles.favourite).toHaveBeenCalledWith("e1");
    expect(ctx.updateFavourites).toHaveBeenCalledWith(exponat);
    await waitFor(() =>
      expect(screen.getByTitle("Favorit").className).toMatch(/favourite/),
    );
  });

  it("renders nothing while loading", () => {
    setUserContext({ loading: true });
    const { container } = render(<FavouriteButton exponat={exponat} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("SaveButton", () => {
  it("saves a platform work through the works endpoint", async () => {
    const ctx = setUserContext();
    const work = { id: "w1" } as any;
    render(<SaveButton work={work} />);
    await userEvent.click(screen.getByTitle("Spremi"));
    expect(toggles.saveWork).toHaveBeenCalledWith("w1");
    expect(toggles.saveLiterature).not.toHaveBeenCalled();
    expect(ctx.updateSavedWorks).toHaveBeenCalledWith(work);
    await waitFor(() =>
      expect(screen.getByTitle("Spremi").className).toMatch(/saved/),
    );
  });

  it("saves a GBIF publication through the literature endpoint", async () => {
    const ctx = setUserContext();
    render(<SaveButton work={{ id: "lit-1", isGbif: true } as any} />);
    await userEvent.click(screen.getByTitle("Spremi"));
    expect(toggles.saveLiterature).toHaveBeenCalledWith("lit-1");
    expect(toggles.saveWork).not.toHaveBeenCalled();
    expect(ctx.updateSavedLiterature).toHaveBeenCalledWith(
      expect.objectContaining({ literatureId: "lit-1" }),
    );
  });

  it("is saved when it is among saved works, or saved literature for GBIF items", () => {
    setUserContext({
      savedWorks: [{ id: "w1" }],
      savedLiterature: [{ literatureId: "lit-1" }],
    });
    const { unmount } = render(<SaveButton work={{ id: "w1" } as any} />);
    expect(screen.getByTitle("Spremi").className).toMatch(/saved/);
    unmount();
    render(<SaveButton work={{ id: "lit-1", isGbif: true } as any} />);
    expect(screen.getByTitle("Spremi").className).toMatch(/saved/);
  });

  it("a work id only counts in its own list", () => {
    setUserContext({ savedWorks: [{ id: "x1" }] });
    render(<SaveButton work={{ id: "x1", isGbif: true } as any} />);
    expect(screen.getByTitle("Spremi").className).not.toMatch(/saved/);
  });
});

describe("FollowButton (user)", () => {
  const user = { id: "u2" } as any;

  it("offers to follow, then to unfollow", async () => {
    const ctx = setUserContext();
    render(<FollowButton user={user} />);
    const button = screen.getByTitle("Zaprati");
    expect(button).toHaveTextContent("Zaprati");
    await userEvent.click(button);
    expect(toggles.followUser).toHaveBeenCalledWith("u2");
    expect(ctx.updateFollowing).toHaveBeenCalledWith(user);
    await waitFor(() => expect(button).toHaveTextContent("Prestani pratiti"));
  });

  it("starts as 'following' for followed users", () => {
    setUserContext({ following: [{ id: "u2" }] });
    render(<FollowButton user={user} />);
    expect(screen.getByTitle("Zaprati")).toHaveTextContent("Prestani pratiti");
  });
});

describe("MembershipFollowButton", () => {
  it("follows a user", async () => {
    const ctx = setUserContext();
    const object = { id: "u2" } as any;
    render(<MembershipFollowButton object={object} type="user" />);
    await userEvent.click(screen.getByTitle("Prati"));
    expect(toggles.followUser).toHaveBeenCalledWith("u2");
    expect(toggles.followOrganisation).not.toHaveBeenCalled();
    expect(ctx.updateFollowing).toHaveBeenCalledWith(object);
  });

  it("follows an organisation", async () => {
    const ctx = setUserContext();
    const object = { id: "o1" } as any;
    render(<MembershipFollowButton object={object} type="organisation" />);
    await userEvent.click(screen.getByTitle("Prati"));
    expect(toggles.followOrganisation).toHaveBeenCalledWith("o1");
    expect(toggles.followUser).not.toHaveBeenCalled();
    expect(ctx.updateFollowedOrganisation).toHaveBeenCalledWith(object);
  });

  it("looks in the list that matches the type", () => {
    setUserContext({ following: [{ id: "same" }], followedOrganisations: [] });
    render(
      <MembershipFollowButton
        object={{ id: "same" } as any}
        type="organisation"
      />,
    );
    expect(screen.getByTitle("Prati")).toHaveTextContent("Prati");
  });
});

describe("ToggleApprovalButton", () => {
  it("is shown as approved by default", () => {
    render(<ToggleApprovalButton id="e1" entity="exponats" />);
    expect(screen.getByAltText("vidljiv")).toBeInTheDocument();
  });

  it("starts hidden when the item is not approved", () => {
    render(
      <ToggleApprovalButton id="e1" entity="exponats" isApproved={false} />,
    );
    expect(screen.getByAltText("sakriven")).toBeInTheDocument();
  });

  it("toggles on the server and flips the icon", async () => {
    render(<ToggleApprovalButton id="p1" entity="posts" isApproved={false} />);
    await userEvent.click(screen.getByTitle("Odobri"));
    expect(toggles.approval).toHaveBeenCalledWith({
      id: "p1",
      entity: "posts",
    });
    await waitFor(() =>
      expect(screen.getByAltText("vidljiv")).toBeInTheDocument(),
    );
  });

  it("follows the prop when the parent refreshes it, and notifies the parent", () => {
    const onToggle = jest.fn();
    const { rerender } = render(
      <ToggleApprovalButton
        id="p1"
        entity="posts"
        isApproved={false}
        onToggle={onToggle}
      />,
    );
    rerender(
      <ToggleApprovalButton
        id="p1"
        entity="posts"
        isApproved
        onToggle={onToggle}
      />,
    );
    expect(screen.getByAltText("vidljiv")).toBeInTheDocument();
    expect(onToggle).toHaveBeenCalledTimes(2); // on mount and on the prop change
  });
});

describe("BaseButton", () => {
  it("is a submit button by default and calls onClick", async () => {
    const onClick = jest.fn();
    render(<BaseButton text="Spremi" onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Spremi" });
    expect(button).toHaveAttribute("type", "submit");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it("can be a plain button and takes extra classes", () => {
    render(<BaseButton text="X" isNotSubmit className="extra" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("extra");
  });
});
