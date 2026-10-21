import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockRouter } from "test-utils/router";
import { setUserContext } from "test-utils/userContext";

// ---- collaborators that are not under test: replaced by labelled stubs ----
jest.mock("@/utility/wrappers/userWrapper", () => ({
  UserWrapper: ({ children }: any) => <>{children}</>,
}));
jest.mock("@/utility/wrappers/queryWrapper", () => ({
  QueryClientWrapper: ({ children }: any) => <>{children}</>,
}));
jest.mock("components/LikeButton", () => ({
  __esModule: true,
  default: require("test-utils/stubs").stub("like"),
}));
jest.mock("components/FavouriteButton/FavouriteButton", () => ({
  FavouriteButton: require("test-utils/stubs").stub("favourite"),
}));
jest.mock("components/SaveButton", () => ({
  __esModule: true,
  default: require("test-utils/stubs").stub("save"),
}));
jest.mock("components/ToggleApprovalButton", () => ({
  __esModule: true,
  default: require("test-utils/stubs").stub("approval"),
}));
jest.mock("components/RemoveExponatButton", () => ({
  __esModule: true,
  default: require("test-utils/stubs").stub("remove-exponat"),
}));
jest.mock("components/RemovePostButton/RemovePostButton", () => ({
  RemovePostButton: require("test-utils/stubs").stub("remove-post"),
}));
jest.mock("components/RemoveWorkButton", () => ({
  __esModule: true,
  default: require("test-utils/stubs").stub("remove-work"),
}));
jest.mock("components/LeaveOrganisationButton", () => ({
  __esModule: true,
  default: require("test-utils/stubs").stub("leave"),
}));
jest.mock("components/RemoveMembershipButton", () => ({
  __esModule: true,
  default: require("test-utils/stubs").stub("remove-member"),
}));
jest.mock("components/EditUserRoleModal", () => ({
  __esModule: true,
  default: require("test-utils/stubs").stub("edit-role"),
}));
jest.mock("../MembershipFollowButton", () => ({
  __esModule: true,
  default: require("test-utils/stubs").stub("follow"),
}));
jest.mock("components/UserFollowButton", () => ({
  __esModule: true,
  default: require("test-utils/stubs").stub("user-follow"),
}));
jest.mock("components/AuthorshipTable", () => ({
  __esModule: true,
  default: require("test-utils/stubs").stub("authorship"),
}));
jest.mock("react-responsive-carousel", () => ({
  Carousel: ({ children }: any) => <div data-testid="carousel">{children}</div>,
}));
const mockMe = { data: undefined as any };
jest.mock("@/api/useGetMe", () => ({ useGetMe: () => mockMe }));
const mockMarkAsRead = jest.fn();
jest.mock("@/api/useMarkAsRead", () => ({
  useMarkAsRead: () => ({ mutateAsync: mockMarkAsRead }),
}));
const mockNotifications = { markAsRead: jest.fn() };
jest.mock("@/utility/context/NotificationContext", () => ({
  __esModule: true,
  default: () => mockNotifications,
}));

import { CategorizationCard } from "../CategorizationCard/CategorizationCard";
import { ExponatCard } from "../ExponatCard/ExponatCard";
import { MembershipCard } from "../MembershipCard/MembershipCard";
import { NotificationCard } from "../NotificationCard/NotificationCard";
import { OrganisationCard } from "../OrganisationCard/OrganisationCard";
import { PostCard } from "../PostCard/PostCard";
import { SocialPostCard } from "../SocialPostCard/SocialPostCard";
import { UserCard } from "../UserCard/UserCard";
import { WorkCard } from "../WorkCard/WorkCard";

beforeEach(() => {
  setUserContext();
  mockMe.data = undefined;
});

const exponat = (over: Record<string, unknown> = {}) =>
  ({
    id: "e1",
    name: "Crvena lisica",
    alternateName: "Vulpes vulpes",
    mainImage: "/fox.png",
    organizationId: "o1",
    organizationName: "Muzej",
    favouriteCount: 7,
    exponatKind: "EUCARIOT",
    isApproved: true,
    ...over,
  }) as any;

describe("ExponatCard", () => {
  it("shows the exponat, its organisation and statistics", () => {
    render(<ExponatCard exponat={exponat()} />);
    expect(screen.getByText("Crvena lisica")).toBeInTheDocument();
    expect(screen.getByText("Vulpes vulpes")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Eukariot")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Muzej" })).toHaveAttribute(
      "href",
      "/organisation/o1",
    );
    expect(
      screen.getByRole("link", { name: "Pogledaj eksponat" }),
    ).toHaveAttribute("href", "/exponat/e1");
    expect(screen.getByTestId("favourite")).toBeInTheDocument();
  });

  it("links unapproved exponats to the admin page", () => {
    render(<ExponatCard exponat={exponat({ isApproved: false })} />);
    expect(screen.getByRole("link", { name: "Crvena lisica" })).toHaveAttribute(
      "href",
      "/exponat/e1/admin",
    );
  });

  it("shows moderation controls only to admins", () => {
    const { rerender } = render(<ExponatCard exponat={exponat()} />);
    expect(screen.queryByTestId("approval")).toBeNull();
    expect(screen.queryByTestId("remove-exponat")).toBeNull();

    rerender(<ExponatCard exponat={exponat({ isApproved: false })} isAdmin />);
    expect(screen.getByTestId("approval")).toHaveTextContent("entity=exponats");
    expect(screen.getByTestId("approval")).toHaveTextContent(
      "isApproved=false",
    );
    // an unapproved exponat has no edit link
    expect(screen.getByTestId("remove-exponat")).toHaveTextContent(
      "isHidden=true",
    );
  });

  it("copes with an exponat without a kind", () => {
    render(<ExponatCard exponat={exponat({ exponatKind: undefined })} />);
    expect(screen.getByText("Crvena lisica")).toBeInTheDocument();
  });
});

describe("PostCard", () => {
  const post = (over: Record<string, unknown> = {}) =>
    ({
      id: "p1",
      title: "Lisica u šumi",
      thumbnail: "/t.png",
      authorId: "u1",
      authorName: "Ana",
      exponatId: "e1",
      exponatName: "Lisica",
      likeScore: 12,
      isApproved: true,
      updatedAt: new Date(2024, 4, 17),
      ...over,
    }) as any;

  it("renders nothing without a post", () => {
    const { container } = render(<PostCard post={undefined as any} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows title, like count, author and exponat links", () => {
    render(<PostCard post={post()} isAdmin={false} />);
    expect(screen.getByRole("link", { name: "Lisica u šumi" })).toHaveAttribute(
      "href",
      "/post/p1",
    );
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ana" })).toHaveAttribute(
      "href",
      "/user/u1",
    );
    expect(
      screen.getByRole("link", { name: "eksponat: Lisica" }),
    ).toHaveAttribute("href", "/exponat/e1");
    expect(screen.getByTestId("like")).toBeInTheDocument();
  });

  it("links unapproved posts to the admin page", () => {
    render(<PostCard post={post({ isApproved: false })} isAdmin={false} />);
    expect(screen.getByRole("link", { name: "Lisica u šumi" })).toHaveAttribute(
      "href",
      "/post/p1/admin",
    );
  });

  it("admins get approval and removal controls", () => {
    render(<PostCard post={post()} isAdmin />);
    expect(screen.getByTestId("approval")).toHaveTextContent("entity=posts");
    expect(screen.getByTestId("remove-post")).toBeInTheDocument();
  });

  it("authors can remove their post but cannot approve it", () => {
    render(<PostCard post={post()} isUser isAdmin={false} />);
    expect(screen.queryByTestId("approval")).toBeNull();
    expect(screen.getByTestId("remove-post")).toBeInTheDocument();
  });

  it("an admin who is also the author is treated as author", () => {
    render(<PostCard post={post()} isUser isAdmin />);
    expect(screen.getByTestId("remove-post")).toHaveTextContent(
      "isAdmin=false",
    );
  });

  it("visitors see no controls", () => {
    render(<PostCard post={post()} isAdmin={false} isUser={false} />);
    expect(screen.queryByTestId("approval")).toBeNull();
    expect(screen.queryByTestId("remove-post")).toBeNull();
  });

  it("does not show moderation controls unless told the viewer is an admin", () => {
    render(<PostCard post={post()} />);
    expect(screen.queryByTestId("approval")).toBeNull();
    expect(screen.queryByTestId("remove-post")).toBeNull();
  });
});

describe("OrganisationCard", () => {
  it("shows the organisation, its county and statistics", () => {
    render(
      <OrganisationCard
        organisation={
          {
            id: "o1",
            name: "Muzej",
            location: "ZAGREBACKA",
            description: "Opis muzeja",
            mainImage: "/m.png",
            exponatCount: 3,
            points: 40,
            followerCount: 9,
          } as any
        }
      />,
    );
    expect(screen.getByText("Muzej")).toBeInTheDocument();
    expect(screen.getByText("Zagrebačka županija")).toBeInTheDocument();
    expect(screen.getByText("Opis muzeja")).toBeInTheDocument();
    expect(["3", "40", "9"].every((n) => screen.getByText(n))).toBe(true);
    expect(
      screen.getByRole("link", { name: "Posjeti organizaciju" }),
    ).toHaveAttribute("href", "/organisation/o1");
  });
});

describe("UserCard", () => {
  const user = (over: Record<string, unknown> = {}) =>
    ({
      id: "u1",
      firstName: "Ana",
      lastName: "Anić",
      username: "ana",
      posts: [{}, {}, {}],
      likeCount: 5,
      followerCount: 2,
      followingCount: 4,
      ...over,
    }) as any;

  it("shows the profile summary and follow links", () => {
    render(<UserCard user={user()} />);
    expect(screen.getByText("Ana Anić")).toBeInTheDocument();
    expect(screen.getByText("ana")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // posts
    expect(screen.getByText("5")).toBeInTheDocument(); // likes
    expect(screen.getByRole("link", { name: "2 pratitelja" })).toHaveAttribute(
      "href",
      "/follows/u1?tab=Followers",
    );
    expect(
      screen.getByRole("link", { name: "prati 4 korisnika" }),
    ).toHaveAttribute("href", "/follows/u1?tab=Following");
  });

  it("offers to follow other users but not yourself", () => {
    const { rerender } = render(<UserCard user={user()} />);
    expect(screen.getByTestId("user-follow")).toBeInTheDocument();
    mockMe.data = { id: "u1" };
    rerender(<UserCard user={user()} />);
    expect(screen.queryByTestId("user-follow")).toBeNull();
  });
});

describe("WorkCard", () => {
  const work = (over: Record<string, unknown> = {}) =>
    ({
      id: "w1",
      title: "Flora Jadrana",
      description: "Opis rada",
      poster: "/poster.png",
      type: "BOOK",
      organisationId: "o1",
      organisationName: "Muzej",
      authorId: "u1",
      auhtorName: "Ana",
      tags: ["flora", "jadran"],
      isApproved: true,
      ...over,
    }) as any;

  it("shows a platform work with author, tags and type", () => {
    render(<WorkCard work={work()} />);
    expect(
      screen.getByRole("link", { name: "Flora Jadrana..." }),
    ).toHaveAttribute("href", "/work/w1");
    expect(screen.getByRole("link", { name: "Ana" })).toHaveAttribute(
      "href",
      "/user/u1",
    );
    expect(screen.getByText("flora")).toBeInTheDocument();
    expect(screen.getByText("jadran")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Muzej" })).toHaveAttribute(
      "href",
      "/organisation/o1",
    );
    expect(screen.getByTestId("save")).toBeInTheDocument();
  });

  it("links GBIF publications to their website and hides poster/author links", () => {
    render(
      <WorkCard
        work={work({
          isGbif: true,
          website: "https://example.org/paper",
          auhtorName: "A. Autor",
        })}
      />,
    );
    expect(
      screen.getByRole("link", { name: "Flora Jadrana..." }),
    ).toHaveAttribute("href", "https://example.org/paper");
    expect(screen.getByText("A. Autor - GBIF")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "A. Autor" })).toBeNull();
    expect(screen.getByRole("link", { name: "Muzej" })).toHaveAttribute(
      "href",
      "https://www.gbif.org/",
    );
  });

  it("explains a missing abstract", () => {
    render(<WorkCard work={work({ description: "" })} />);
    expect(screen.getByText("Ne postoji abstrakt")).toBeInTheDocument();
  });

  it("only admins get the moderation row", () => {
    const { rerender } = render(<WorkCard work={work()} />);
    expect(screen.queryByTestId("approval")).toBeNull();
    rerender(<WorkCard work={work({ isApproved: false })} isAdmin />);
    expect(screen.getByTestId("approval")).toHaveTextContent("entity=works");
    expect(screen.getByTestId("remove-work")).toHaveTextContent(
      "isHidden=true",
    );
  });

  it("unapproved works point to the organisation's admin page", () => {
    render(<WorkCard work={work({ isApproved: false })} />);
    expect(screen.getByRole("link", { name: "Muzej" })).toHaveAttribute(
      "href",
      "/organisation/o1/admin",
    );
  });
});

describe("SocialPostCard", () => {
  const post = (over: Record<string, unknown> = {}) =>
    ({
      id: "s1",
      title: "Dan otvorenih vrata",
      text: "Dođite!",
      organisationId: "o1",
      organisationName: "Muzej",
      organisationMainImage: "/m.png",
      images: ["/a.png", "/b.png"],
      type: "NEWS",
      updatedAt: new Date(2024, 4, 17),
      ...over,
    }) as any;

  it("shows the announcement with every image", () => {
    render(<SocialPostCard post={post()} />);
    expect(screen.getByText("Dan otvorenih vrata")).toBeInTheDocument();
    expect(screen.getByText("Dođite!")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Muzej" })).toHaveAttribute(
      "href",
      "/organisation/o1",
    );
    expect(screen.getAllByAltText("post image")).toHaveLength(2);
  });

  it("shows authorship information when present", () => {
    const { rerender } = render(<SocialPostCard post={post()} />);
    expect(screen.queryByTestId("authorship")).toBeNull();
    rerender(<SocialPostCard post={post({ authorhipInfo: { id: "a1" } })} />);
    expect(screen.getByTestId("authorship")).toBeInTheDocument();
  });

  it("labels the post with its type", () => {
    render(<SocialPostCard post={post({ type: "NEWS" })} />);
    expect(screen.getByText("Vijesti")).toBeInTheDocument();
  });
});

describe("CategorizationCard", () => {
  it("lists the taxonomy from domain down to genus", () => {
    render(
      <CategorizationCard
        categorization={
          {
            domain: "Eukaryota",
            kingdom: "Animalia",
            phylum: "Chordata",
            class: "Mammalia",
            order: "Carnivora",
            family: "Canidae",
            genus: "Vulpes",
          } as any
        }
      />,
    );
    const values = screen
      .getAllByText(/./)
      .map((e) => e.textContent)
      .filter(Boolean);
    expect(values).toEqual([
      "Eukaryota",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Carnivora",
      "Canidae",
      "Vulpes",
    ]);
    expect(screen.getAllByAltText("arrow")).toHaveLength(6); // none after the genus
  });
});

describe("MembershipCard", () => {
  const card = (over: Record<string, unknown> = {}) => ({
    name: "Muzej",
    description: "ZAGREBACKA",
    image: "/m.png",
    type: "organisation" as const,
    id: "o1",
    organisationId: "o1",
    role: "MEMBER",
    object: { id: "o1" } as any,
    ...over,
  });

  it.each([
    ["ADMIN", "Admin"],
    ["OWNER", "Vlasnik"],
    ["MEMBER", "Član"],
    ["REQUESTED", "Zahtjev"],
    ["ZAGREBACKA", "Zagrebačka županija"],
  ])("labels role %s as %s", (role, label) => {
    render(<MembershipCard {...card({ role })} />);
    expect(screen.getAllByText(label).length).toBeGreaterThan(0);
  });

  it("links to the organisation or the user", () => {
    const { rerender } = render(<MembershipCard {...card()} />);
    expect(screen.getByRole("link", { name: "Muzej" })).toHaveAttribute(
      "href",
      "/organisation/o1",
    );
    rerender(
      <MembershipCard {...card({ type: "user", id: "u9", name: "Ana" })} />,
    );
    expect(screen.getByRole("link", { name: "Ana" })).toHaveAttribute(
      "href",
      "/user/u9",
    );
  });

  it("members can leave their own memberships", () => {
    render(<MembershipCard {...card({ isUser: true })} />);
    expect(screen.getByTestId("leave")).toBeInTheDocument();
    expect(screen.queryByTestId("remove-member")).toBeNull();
  });

  it("admins can remove members and edit their role", () => {
    render(
      <MembershipCard {...card({ isAdmin: true, object: { id: "u2" } })} />,
    );
    expect(screen.getByTestId("remove-member")).toHaveTextContent("userId=u2");
    expect(screen.getByTestId("edit-role")).toHaveTextContent(
      "organisationId=o1",
    );
    expect(screen.queryByTestId("leave")).toBeNull();
  });

  it("follow cards never show management buttons", () => {
    render(
      <MembershipCard
        {...card({ isUser: true, isAdmin: true, isFollowCard: true })}
      />,
    );
    expect(screen.queryByTestId("leave")).toBeNull();
    expect(screen.queryByTestId("remove-member")).toBeNull();
    expect(screen.getByTestId("follow")).toHaveTextContent("type=organisation");
  });
});

describe("NotificationCard", () => {
  const notification = (over: Record<string, unknown> = {}) =>
    ({
      id: "n1",
      title: "Novi pratitelj",
      text: "Ana te prati",
      link: "/user/u1",
      read: false,
      type: "OTHER",
      notificationImage: "/img.png",
      createdAt: new Date(2024, 4, 17).toISOString(),
      ...over,
    }) as any;

  it("shows the title and text, with a fallback for empty text", () => {
    const { rerender } = render(
      <NotificationCard notification={notification()} />,
    );
    expect(screen.getByText("Novi pratitelj")).toBeInTheDocument();
    expect(screen.getByText("Ana te prati")).toBeInTheDocument();
    rerender(<NotificationCard notification={notification({ text: "" })} />);
    expect(screen.getByText("Nema teksta")).toBeInTheDocument();
  });

  it("marks read notifications", () => {
    const { container } = render(
      <NotificationCard notification={notification({ read: true })} />,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(/read/);
  });

  it("clicking marks it as read on the server and locally, then opens the link", async () => {
    mockMarkAsRead.mockResolvedValue(undefined);
    render(<NotificationCard notification={notification()} />);
    await userEvent.click(screen.getByText("Novi pratitelj"));
    expect(mockMarkAsRead).toHaveBeenCalledWith("n1");
    expect(mockNotifications.markAsRead).toHaveBeenCalledWith("n1");
    expect(mockRouter.push).toHaveBeenCalledWith("/user/u1");
  });

  it("does not navigate for notifications without a link", async () => {
    mockMarkAsRead.mockResolvedValue(undefined);
    render(<NotificationCard notification={notification({ link: "" })} />);
    await userEvent.click(screen.getByText("Novi pratitelj"));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it.each(["NEW_FOLLOWER", "MEMBERSHIP_REQUEST"])(
    "%s notifications show the profile picture of the user in the image",
    (type) => {
      render(
        <NotificationCard
          notification={notification({ type, notificationImage: "u7" })}
        />,
      );
      // next/image rewrites the address to /_next/image?url=<encoded original>
      expect(
        decodeURIComponent(screen.getByAltText("img").getAttribute("src")!),
      ).toContain("/user/u7");
    },
  );

  it("omits the image when the notification has none", () => {
    render(
      <NotificationCard
        notification={notification({ notificationImage: "" })}
      />,
    );
    expect(screen.queryByAltText("img")).toBeNull();
  });
});
