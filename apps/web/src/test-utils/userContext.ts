/**
 * A controllable stand-in for `useUser()`. Tests mock the UserContext module
 * with it:
 *
 *   jest.mock("@/utility/context/UserContext", () => ({
 *     __esModule: true,
 *     default: () => require("test-utils/userContext").mockUserContext,
 *   }));
 */
const defaults = () => ({
  user: undefined as any,
  logout: jest.fn(),
  setUser: jest.fn(),
  loading: false,
  likedPosts: [] as any[],
  memberships: [] as any[],
  favouriteExponats: [] as any[],
  posts: [] as any[],
  savedWorks: [] as any[],
  savedLiterature: [] as any[],
  followers: [] as any[],
  following: [] as any[],
  followedOrganisations: [] as any[],
  updateLikes: jest.fn(),
  updateFavourites: jest.fn(),
  updateMemberships: jest.fn(),
  updatePosts: jest.fn(),
  updateFollowers: jest.fn(),
  updateFollowing: jest.fn(),
  updateFollowedOrganisation: jest.fn(),
  updateSavedWorks: jest.fn(),
  updateSavedLiterature: jest.fn(),
});

export const mockUserContext = defaults();

/** Restore the defaults, then apply overrides. Call from beforeEach. */
export const setUserContext = (
  over: Partial<ReturnType<typeof defaults>> = {},
) => {
  Object.assign(mockUserContext, defaults(), over);
  return mockUserContext;
};
