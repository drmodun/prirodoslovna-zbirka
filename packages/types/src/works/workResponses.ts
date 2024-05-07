export interface WorkResponseShort {
  title: string;
  description: string;
  poster: string;
  authorId: string;
  auhtorName: string;
  id: string;
  organisationId: string;
  organisationName: string;
  updatedAt: Date;
  amountOfSaves: number;
  isApproved?: boolean;
  tags: string[];
  isGbif?: boolean;
  website?: string;
  type: string;
}

export interface WorkResponseExtended {
  title: string;
  description: string;
  poster: string;
  document: string;
  presentation: string;
  authorId: string;
  auhtorName: string;
  id: string;
  organisationId: string;
  organisationName: string;
  updatedAt: Date;
  amountOfSaves: number;
  firstPublicationDate: Date;
  approvedById: string;
  approvedByName: string;
  tags: string[];
  type: string;
}

export interface LiteratureResponseGBIF {
  id: string;
  title: string;
  websites: string[];
  discovered: Date;
  abstract: string;
  literatureType: string;
  keywords: string[];
  authors: LiteratureAuthor[];
  publisher: string;
  published: Date;
}

export interface LiteratureAuthor {
  firstName: string;
  lastName: string;
}

export interface FullLiteratureResponseGBIF {
  offset: number;
  limit: number;
  endOfRecords: boolean;
  results: LiteratureResponseGBIF[];
  count: number;
}
