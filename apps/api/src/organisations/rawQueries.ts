import { PrismaService } from 'src/prisma/prisma.service';

export const anonymousOrganisationDiscover = async (
  page: number,
  size: number,
  prisma: PrismaService,
) => {
  return await prisma.$queryRaw`
    select *, (coalesce("amountOfFollowers", 0) + coalesce("amountOfExponats" / 5, 0) + coalesce("totalPosts" / 10, 0) + coalesce("totalFavourites" / 10, 0) + coalesce("amountOfMembers" / 5, 0)) as "points", "totalPosts", "amountOfMembers", "totalFavourites"
    from "Organisation" o
    left join ( 
    select "organisationId", COUNT(*) as "amountOfFollowers"
    from "UserOrganisationFollower" 
    group by "organisationId"
    ) uof on uof."organisationId" = o.id
    left join ( 
    select "organisationId", COUNT(*) as "amountOfExponats"
    from "Exponat"  
    group by "organisationId"
    ) e on e."organisationId" = o.id 
    left join (
        select "organisationId", SUM("exponatPosts") as "totalPosts"
        from "Exponat" ex
        join (
            select "ExponatId",COUNT(*) as "exponatPosts"
                from "Post"  
                group by  "ExponatId"
            ) p on p."ExponatId" = ex.id
                group by "organisationId"
            ) es on es."organisationId" = o.id 
    left join (
     select "organisationId", SUM("exponatFavourites") as "totalFavourites"
     from "Exponat" ex
     join (
         select "ExponatId", COUNT(*) as "exponatFavourites"
             from "FavouriteExponat"  
             group by  "ExponatId"
         ) f on f."ExponatId" = ex.id
             group by "organisationId"
         ) ef on ef."organisationId" = o.id 
    left join ( 
    select "organisationId", COUNT(*) as "amountOfMembers"
    from "OrganisationUser" m
    where m.role != 'MEMBER'
    group by "organisationId"
    ) ou on ou."organisationId" = o.id
    order by ("points") desc, o."name" asc
    limit ${size}
    offset (${size}*(${page}-1))
    `;
};

export const personalizedOrganisationDiscover = async (
  page: number,
  size: number,
  userIdRaw: string,
  prisma: PrismaService,
) => {
  const userId = `${userIdRaw}`;
  console.log(userId);
  return await prisma.$queryRaw`
  select o.id, o.name, o.location, o."websiteUrl", o."mainImage", o."isApproved", o.description, o."updatedAt", "amountOfFollowers", "amountOfExponats",
   ((coalesce("amountOfFollowers", 0) + coalesce("amountOfExponats" / 5, 0) + coalesce("totalPosts" / 10, 0) + coalesce("totalFavourites" / 10, 0) + coalesce("amountOfMembers" / 5, 0)
  + (case when exists (select 1 from "UserOrganisationFollower" uo where uo."organisationId" = o.id and uo."userId" = ${userId}) then -1000 else 0 end)) * (case when o.location = u.location then 2 else 1 end))
   as "points", "totalPosts", "amountOfMembers", "totalFavourites"
 from "Organisation" o
 left join "User" u on u.id = ${userId}
 left join ( 
 select "organisationId", COUNT(*) as "amountOfFollowers"
 from "UserOrganisationFollower" 
 group by "organisationId"
 ) uof on uof."organisationId" = o.id
 left join ( 
 select "organisationId", COUNT(*) as "amountOfExponats"
 from "Exponat"  
 group by "organisationId"
 ) e on e."organisationId" = o.id 
 left join (
     select "organisationId", SUM("exponatPosts") as "totalPosts"
     from "Exponat" ex
     join (
         select "ExponatId",COUNT(*) as "exponatPosts"
             from "Post"  
             group by  "ExponatId"
         ) p on p."ExponatId" = ex.id
             group by "organisationId"
         ) es on es."organisationId" = o.id      
 left join (
     select "organisationId", SUM("exponatFavourites") as "totalFavourites"
     from "Exponat" ex
     join (
         select "ExponatId", COUNT(*) as "exponatFavourites"
             from "FavouriteExponat"  
             group by  "ExponatId"
         ) f on f."ExponatId" = ex.id
             group by "organisationId"
         ) ef on ef."organisationId" = o.id 
 left join ( 
 select "organisationId", COUNT(*) as "amountOfMembers"
 from "OrganisationUser" m
 where m.role != 'MEMBER'
 group by "organisationId"
 ) ou on ou."organisationId" = o.id
 order by ("points") desc, o."name" asc
 limit ${size}
 offset (${size}*(${page}-1))
        `;
};

//TODO: add algorithm boost if any of the user followers is a member
