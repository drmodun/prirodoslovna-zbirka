-- Gives notifications stored before message keys existed a key and parameters,
-- so they are shown in each reader's language like new ones. Their Croatian
-- title and text came from fixed templates (one per type); the parameters are
-- read back out of them. A row that does not match its template, for example
-- one written by an even older version, keeps its stored text.
--
-- Where a value could contain the surrounding words, only the part that cannot
-- is matched, and the rest is checked by rebuilding the stored text.

-- "Vaša objava <title> je odobrena|odbijena"
UPDATE "Notification" n
SET "messageKey" = CASE m[2] WHEN 'odobrena' THEN 'postApproved' ELSE 'postRejected' END,
    "params" = jsonb_build_object('title', m[1])
FROM (
  SELECT id, regexp_match("text", '^Vaša objava (.*) je (odobrena|odbijena)$') AS m
  FROM "Notification"
  WHERE "messageKey" IS NULL AND "type" = 'POST_APPROVAL'
) s
WHERE n.id = s.id AND s.m IS NOT NULL;

-- Title "Nova objava od korisnika <author id>: <title>", text the excerpt.
-- The author is a user id, which contains no colon.
UPDATE "Notification" n
SET "messageKey" = 'newPost',
    "params" = jsonb_build_object('author', m[1], 'title', m[2], 'excerpt', COALESCE(n."text", ''))
FROM (
  SELECT id, regexp_match("title", '^Nova objava od korisnika ([^:]*): (.*)$') AS m
  FROM "Notification"
  WHERE "messageKey" IS NULL AND "type" = 'POST_BY_FOLLOWED_ACCOUNT'
) s
WHERE n.id = s.id AND s.m IS NOT NULL;

-- "Novi zahtjev za objavu <title> korisnika"
UPDATE "Notification" n
SET "messageKey" = 'newPostRequest',
    "params" = jsonb_build_object('title', m[1])
FROM (
  SELECT id, regexp_match("text", '^Novi zahtjev za objavu (.*) korisnika$') AS m
  FROM "Notification"
  WHERE "messageKey" IS NULL AND "type" = 'NEW_POST_REQUEST'
) s
WHERE n.id = s.id AND s.m IS NOT NULL;

-- Title "Organizacija <organisation> je dobila novi zahtev za eksponat <name>",
-- text "Novi zahtev za eksponat <name> (<alternate name>) organizacije <organisation>".
UPDATE "Notification" n
SET "messageKey" = 'newExponatRequest',
    "params" = jsonb_build_object('organisation', s.organisation, 'name', s.name, 'alternateName', s."alternateName")
FROM (
  SELECT id, organisation, name,
         substr(rest, 1, length(rest) - length(') organizacije ' || organisation)) AS "alternateName",
         "text"
  FROM (
    SELECT id, "text", m[1] AS organisation, m[2] AS name,
           substr("text", length('Novi zahtev za eksponat ' || m[2] || ' (') + 1) AS rest
    FROM (
      SELECT id, "text", regexp_match("title", '^Organizacija (.*) je dobila novi zahtev za eksponat (.*)$') AS m
      FROM "Notification"
      WHERE "messageKey" IS NULL AND "type" = 'NEW_EXPONAT_REQUEST'
    ) matched
    WHERE m IS NOT NULL
  ) split
) s
WHERE n.id = s.id
  AND s."text" = 'Novi zahtev za eksponat ' || s.name || ' (' || s."alternateName" || ') organizacije ' || s.organisation;

-- Title "Novi eksponat organizacije <organisation>",
-- text "Organizacija <organisation> je dodala novi eksponat <name>".
UPDATE "Notification" n
SET "messageKey" = 'newExponat',
    "params" = jsonb_build_object('organisation', s.organisation, 'name', substr(s."text", length(s.prefix) + 1))
FROM (
  SELECT id, "text", m[1] AS organisation,
         'Organizacija ' || m[1] || ' je dodala novi eksponat ' AS prefix
  FROM (
    SELECT id, "text", regexp_match("title", '^Novi eksponat organizacije (.*)$') AS m
    FROM "Notification"
    WHERE "messageKey" IS NULL AND "type" = 'EXPONAT_BY_FOLLOWED_ORGANISATION'
  ) matched
  WHERE m IS NOT NULL
) s
WHERE n.id = s.id AND starts_with(s."text", s.prefix);

-- "Korisnik <username> te sada prati"
UPDATE "Notification" n
SET "messageKey" = 'newFollower',
    "params" = jsonb_build_object('username', m[1])
FROM (
  SELECT id, regexp_match("text", '^Korisnik (.*) te sada prati$') AS m
  FROM "Notification"
  WHERE "messageKey" IS NULL AND "type" = 'NEW_FOLLOWER'
) s
WHERE n.id = s.id AND s.m IS NOT NULL;

-- "Vaš status članstva u organizaciji <organisation> je promijenjen u <role>",
-- the role being the MemberRole in lower case.
UPDATE "Notification" n
SET "messageKey" = 'membershipChange',
    "params" = jsonb_build_object('organisation', m[1], 'role', upper(m[2]))
FROM (
  SELECT id, regexp_match("text", '^Vaš status članstva u organizaciji (.*) je promijenjen u (owner|admin|member|requested)$') AS m
  FROM "Notification"
  WHERE "messageKey" IS NULL AND "type" = 'MEMBERSHIP_CHANGE'
) s
WHERE n.id = s.id AND s.m IS NOT NULL;

-- "Korisnik <username> je poslao zahtjev za članstvo u organizaciji <organisation>"
UPDATE "Notification" n
SET "messageKey" = 'membershipRequest',
    "params" = jsonb_build_object('username', m[1], 'organisation', m[2])
FROM (
  SELECT id, regexp_match("text", '^Korisnik (.*) je poslao zahtjev za članstvo u organizaciji (.*)$') AS m
  FROM "Notification"
  WHERE "messageKey" IS NULL AND "type" = 'MEMBERSHIP_REQUEST'
) s
WHERE n.id = s.id AND s.m IS NOT NULL;

-- "Organizacija <organisation> je odobrena|odbijena"
UPDATE "Notification" n
SET "messageKey" = CASE m[2] WHEN 'odobrena' THEN 'organisationApproved' ELSE 'organisationRejected' END,
    "params" = jsonb_build_object('organisation', m[1])
FROM (
  SELECT id, regexp_match("title", '^Organizacija (.*) je (odobrena|odbijena)$') AS m
  FROM "Notification"
  WHERE "messageKey" IS NULL AND "type" = 'ORGANISATION_APPROVAL'
) s
WHERE n.id = s.id AND s.m IS NOT NULL;

-- Title "Nova najava organizacije <organisation>",
-- text "Nova najava organizacije <organisation>: <title>".
UPDATE "Notification" n
SET "messageKey" = 'newSocialPost',
    "params" = jsonb_build_object('organisation', s.organisation, 'title', substr(s."text", length(s.prefix) + 1))
FROM (
  SELECT id, "text", m[1] AS organisation,
         'Nova najava organizacije ' || m[1] || ': ' AS prefix
  FROM (
    SELECT id, "text", regexp_match("title", '^Nova najava organizacije (.*)$') AS m
    FROM "Notification"
    WHERE "messageKey" IS NULL AND "type" = 'NEW_SOCIAL_POST'
  ) matched
  WHERE m IS NOT NULL
) s
WHERE n.id = s.id AND starts_with(s."text", s.prefix);
