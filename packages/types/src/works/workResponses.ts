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
  tags: string[];
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
}
