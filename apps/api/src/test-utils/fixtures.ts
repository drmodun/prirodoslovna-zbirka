/** A fully populated `UsersService.findOne` result, shared by controller tests. */
export const fullUserItem = () => {
  const date = new Date('2024-01-01T00:00:00Z');
  const exponat = {
    id: 'e1',
    name: 'Exponat',
    organisationId: 'o1',
    mainImage: 'img',
    updatedAt: date,
    alternateName: 'alt',
    description: 'desc',
    ExponatKind: 'ANIMAL',
    isApproved: true,
    Organisation: { id: 'o1', name: 'Org' },
    _count: { FavouriteExponats: 4, Posts: 2 },
  };
  const work = {
    id: 'w1',
    description: 'wd',
    organisationId: 'o1',
    organisation: { name: 'Org' },
    poster: 'p',
    tags: ['t'],
    title: 'Work',
    type: 'PAPER',
    updatedAt: date,
    isApproved: true,
    _count: { SavedWorks: 3 },
  };
  return {
    id: 'u1',
    email: 'a@b.c',
    firstName: 'Ana',
    lastName: 'Anić',
    username: 'ana',
    location: 'ZAGREB',
    bio: 'bio',
    role: 'USER',
    hasProfileImage: true,
    createdAt: date,
    updatedAt: date,
    SavedLiterature: [{ id: 'l1' }],
    _count: { followers: 7, following: 8 },
    OrganisationUser: [
      {
        role: 'ADMIN',
        organisation: {
          id: 'o1',
          name: 'Org',
          location: 'ZAGREB',
          mainImage: 'm',
          websiteUrl: 'https://o.hr',
          updatedAt: date,
          _count: {
            Exponats: 1,
            OrganisationUsers: 2,
            UserOrganisationFollowers: 3,
          },
          Exponats: [
            { _count: { FavouriteExponats: 2 } },
            { _count: { FavouriteExponats: 5 } },
          ],
        },
      },
    ],
    Posts: [
      {
        id: 'p1',
        title: 'Post',
        thumbnailImage: 'th',
        updatedAt: date,
        isApproved: false,
        _count: { Likes: 3 },
        Exponat: { id: 'e1', name: 'Exponat', organisationId: 'o1' },
      },
      {
        id: 'p2',
        title: 'Post2',
        thumbnailImage: 'th2',
        updatedAt: date,
        isApproved: true,
        _count: { Likes: 4 },
        Exponat: { id: 'e1', name: 'Exponat', organisationId: 'o1' },
      },
    ],
    Likes: [
      {
        Post: {
          id: 'p9',
          title: 'Liked',
          thumbnailImage: 'lt',
          image: 'li',
          updatedAt: date,
          isApproved: true,
          author: { id: 'u2', username: 'bob', hasProfileImage: false },
          Exponat: { id: 'e2', name: 'Other', organisationId: 'o2' },
          _count: { Likes: 9 },
        },
      },
    ],
    FavouriteExponats: [{ Exponat: exponat }],
    Works: [work],
    SavedWorks: [{ work }],
  } as any;
};
