import { InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export const anonymousExponatsDiscover = async (
  page: number,
  size: number,
  prismaService: PrismaService,
) => {
  try {
    return await prismaService.$queryRaw`    
        SELECT e.id, e."name", e."mainImage", e."updatedAt", e.description, e."alternateName", e."organisationId", e."ExponatKind",	
        (coalesce (f."amountOfFavourites", 0) + coalesce(ouf.organisationPopularity / 2, 0) + (CASE when ARRAY_LENGTH(e."funFacts", 1) > 2 THEN 5 ELSE 0 END) + (case when e."attributes" is not null then 5 else 0 end)) as "points",
        o."name" as "organisationName",   
        p."amountOfPosts" as "amountOfPosts",
        f."amountOfFavourites" as "amountOfFavourites"
        FROM "Exponat" e 
        LEFT JOIN (
        SELECT "ExponatId", COUNT(*) AS "amountOfFavourites"
        FROM "FavouriteExponat" 
        GROUP BY "ExponatId"
        ) f ON e.id = f."ExponatId" 
        LEFT JOIN "Organisation"  o ON e."organisationId" = o.id
        left join ( select "organisationId", COUNT(*) as organisationPopularity 
        from "UserOrganisationFollower" 
        group by "organisationId"
        ) ouf on ouf."organisationId" = e."organisationId" 
        LEFT JOIN (
        SELECT "ExponatId", COUNT(*) AS "amountOfPosts"
        FROM "Post"  
        GROUP BY "ExponatId"
        ) p ON e.id = p."ExponatId" 
        where e."isApproved" = true
        ORDER BY ("points") DESC, e."name" ASC
        limit ${size}
        offset (${size}*(${page}-1))
`;
  } catch (e) {
    throw new InternalServerErrorException(e);
  }
};

export const personalizedExponatsDiscover = async (
  page: number,
  size: number,
  userIdRaw: string,
  prismaService: PrismaService,
) => {
  try {
    const userId = `${userIdRaw}`;
    return await prismaService.$queryRaw`
    SELECT e.id, e."name", e."mainImage", e."updatedAt", e.description, e."alternateName", e."organisationId", e."ExponatKind",	
        (coalesce (f."amountOfFavourites", 0) + coalesce(ouf.organisationPopularity / 2, 0) + (CASE when ARRAY_LENGTH(e."funFacts", 1) > 2 THEN 5 ELSE 0 END) + (case when e."attributes" is not null then 5 else 0 end) + (case when exists (select 1 from "FavouriteExponat" fe where fe."ExponatId" = e.id and fe."userId" = ${userId}) = true then -10000 else 0 end) + (case when exists (select 1 from "UserOrganisationFollower" uo where uo."organisationId" = e."organisationId" and uo."userId" = ${userId}) then 15 else 0 end) + (
        case when exists (select 1 from "FavouriteExponat" fex 
                left join "Exponat" fexp on fexp.id = fex."ExponatId" 
                where fex."userId" = ${userId} and fex."ExponatId" != e.id and fexp."alternateName" = e."alternateName") then 15 else 0 end
        )) as "points",
        o."name" as "organisationName",
        p."amountOfPosts" as "amountOfPosts",
        f."amountOfFavourites" as "amountOfFavourites"
        FROM "Exponat" e 
        LEFT JOIN (
        SELECT "ExponatId", COUNT(*) AS "amountOfFavourites"
        FROM "FavouriteExponat" 
        GROUP BY "ExponatId"
        ) f ON e.id = f."ExponatId" 
        LEFT JOIN "Organisation"  o ON e."organisationId" = o.id
        left join ( select "organisationId", COUNT(*) as organisationPopularity 
        from "UserOrganisationFollower" 
        group by "organisationId"
        ) ouf on ouf."organisationId" = e."organisationId" 
        LEFT JOIN (
        SELECT "ExponatId", COUNT(*) AS "amountOfPosts"
        FROM "Post"  
        GROUP BY "ExponatId"
        ) p ON e.id = p."ExponatId" 
        where e."isApproved" = true
        ORDER BY ("points") DESC, e."name" ASC
        limit ${size}
        offset (${size}*(${page}-1))
`;
  } catch (e) {
    throw new InternalServerErrorException(e);
  }
};
