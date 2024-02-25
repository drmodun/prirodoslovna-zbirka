import { InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export const anonymousPostsDiscover = async (
  page: number,
  size: number,
  prisma: PrismaService,
) => {
  try {
    return await prisma.$queryRaw`SELECT p.id, p.title, e.id as "exponatId", p."thumbnailImage", u.username as "authorName", u.id as "authorId", p."ExponatId", "amountOfLikes", e."organisationId", o.name as "organisationName", o.id as "organisationid", p."updatedAt", p."isApproved", u."hasProfileImage", e.name as "exponatName",
        (coalesce ("amountOfLikes", 0) + coalesce ("amountOfExponatFavourites" / 2, 0) + coalesce ("amountOfOrganisationFollowers" / 4, 0) + coalesce ("amountOfAuthorFollowers" / 2, 0)) as "points"
            FROM "Post" p 
            LEFT JOIN (
              SELECT "postId", COUNT(*) AS "amountOfLikes"
              FROM "Like"  
              GROUP BY "postId"
            ) l ON l."postId" = p.id
            left join "Exponat" e on e.id = p."ExponatId"
            left join (
            select "ExponatId", COUNT(*) as "amountOfExponatFavourites"
            from "FavouriteExponat" fe 
            group by "ExponatId"
            ) ef on ef."ExponatId" = p."ExponatId"
            left join "Organisation" o on e."organisationId" = o.id
            left join (
             select "organisationId", COUNT(*) as "amountOfOrganisationFollowers"
            from "UserOrganisationFollower" uof  
            group by "organisationId"
            ) uofl on uofl."organisationId" = e."organisationId"
            left join "User" u on p."authorId" = u.id
            left join (
             select "followerId", COUNT(*) as "amountOfAuthorFollowers"
            from "UserFollows" uff  
            group by "followerId"
            ) usf on usf."followerId" = p."authorId"
            where e."isApproved" = true
            ORDER BY ("points") desc, e."name" ASC 
            limit ${size}
            offset (${size}*(${page}-1))
            `;
  } catch (e) {
    throw new InternalServerErrorException(e);
  }
};

export const personalizedPostsDiscover = async (
  page: number,
  size: number,
  userIdRaw: string,
  prisma: PrismaService,
) => {
  try {
    const userId = `${userIdRaw}`;
    return await prisma.$queryRaw`SELECT p.id, p.title, e.id as "exponatId", p."thumbnailImage", u.username as "authorName", u.id as "authorId", p."ExponatId", "amountOfLikes", e."organisationId", o.name as "organisationName", o.id as "organisationid", p."updatedAt", p."isApproved", u."hasProfileImage", e.name as "exponatName",
        (coalesce ("amountOfLikes", 0) + coalesce ("amountOfExponatFavourites" / 2, 0) + coalesce ("amountOfOrganisationFollowers" / 4, 0) + coalesce ("amountOfAuthorFollowers" / 2, 0)
         + (case when exists ( select 1 from "Like" li where li."userId" = ${userId} and li."postId" = p.id) then -1000 else 0 end) 
         + (case when exists (select 1 from "Like" li where li."userId" != ${userId} and li."postId" = p.id) then 15 else 0 end) 
         + (case when exists ( select 1 from "FavouriteExponat" fe where fe."ExponatId" = fe."ExponatId" and fe."userId" = ${userId}) then 15 else 0 end)
         + (case when p."authorId" = ${userId} then -1000 else 0 end)
         + (case when exists (select 1 from "UserFollows" usrf where usrf."followerId" = ${userId} and usrf."followeeId" = p."authorId") then 30 else 0 end)
         + (case when exists (select 1 from "FavouriteExponat" fe where fe."userId" = ${userId} and fe."ExponatId" = p."ExponatId") then 15 else 0 end)
         + (case when exists (select 1 from "UserOrganisationFollower" uof where uof."userId" = ${userId} and uof."organisationId" = e."organisationId") then 15 else 0 end)
                  )
        as "points"
            FROM "Post" p 
            LEFT JOIN (
              SELECT "postId", COUNT(*) AS "amountOfLikes"
              FROM "Like"  
              GROUP BY "postId"
            ) l ON l."postId" = p.id
            left join "Exponat" e on e.id = p."ExponatId"
            left join (
            select "ExponatId", COUNT(*) as "amountOfExponatFavourites"
            from "FavouriteExponat" fe 
            group by "ExponatId"
            ) ef on ef."ExponatId" = p."ExponatId"
            left join "Organisation" o on e."organisationId" = o.id
            left join (
             select "organisationId", COUNT(*) as "amountOfOrganisationFollowers"
            from "UserOrganisationFollower" uof  
            group by "organisationId"
            ) uofl on uofl."organisationId" = e."organisationId"
            left join "User" u on p."authorId" = u.id
            left join (
             select "followerId", COUNT(*) as "amountOfAuthorFollowers"
            from "UserFollows" uff  
            group by "followerId"
            ) usf on usf."followerId" = p."authorId"
            where e."isApproved" = true
            ORDER BY ("points") desc, e."name" ASC 
            limit ${size}
            offset (${size}*(${page}-1))
            `;
  } catch (e) {
    throw new InternalServerErrorException(e);
  }
};
