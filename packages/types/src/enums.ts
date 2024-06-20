export enum Role {
  SUPER,
  ADMIN,
  USER,
}

export enum ExponatKind {
  PROCARIOT,
  EUCARIOT,
  MINERAL,
}

export enum MemberRole {
  ADMIN,
  MEMBER,
}

export enum County {
  SPLITSKO_DALMATINSKA = "SPLITSKO_DALMATINSKA",
  DUBROVACKO_NERETVANSKA = "DUBROVACKO_NERETVANSKA",
  SIBENSKO_KNINSKA = "SIBENSKO_KNINSKA",
  ZADARSKA = "ZADARSKA",
  ZAGREBACKA = "ZAGREBACKA",
  KARLOVACKA = "KARLOVACKA",
  VARAZDINSKA = "VARAZDINSKA",
  KOPRIVNICKO_KRIZEVACKA = "KOPRIVNICKO_KRIZEVACKA",
  KRAPINSKO_ZAGORSKA = "KRAPINSKO_ZAGORSKA",
  MEDIMURSKA = "MEDIMURSKA",
  OSIJECKO_BARANJSKA = "OSIJECKO_BARANJSKA",
  POZESKO_SLAVONSKA = "POZESKO_SLAVONSKA",
  PRIMORSKO_GORANSKA = "PRIMORSKO_GORANSKA",
  SISACKO_MOSLAVACKA = "SISACKO_MOSLAVACKA",
  VUKOVARSKO_SRIJEMSKA = "VUKOVARSKO_SRIJEMSKA",
  GRAD_ZAGREB = "GRAD_ZAGREB",
  BJELOVARSKO_BILOGORSKA = "BJELOVARSKO_BILOGORSKA",
  BRODSKO_POSAVSKA = "BRODSKO_POSAVSKA",
  ISTARSKA = "ISTARSKA",
  LICKO_SENJSKA = "LICKO_SENJSKA",
  VIROVITICKO_PODRAVSKA = "VIROVITICKO_PODRAVSKA",
  OTHER = "OTHER",
}

export enum AdminApprovalRequestType {
  ORGANISATION,
  EXPONAT,
  MEMBER,
  POST,
}

export enum WorkType {
  JOURNAL = "Časopis",
  BOOK = "Knjiga",
  GENERIC = "Rad",
  BOOK_SECTION = "Sekcija knjige",
  CONFERENCE_PROCEEDINGS = "Zbornik",
  WORKING_PAPER = "Paper",
  REPORT = "Izvještaj",
  WEB_PAGE = "Web stranica",
  THESIS = "Disertacija",
  MAGAZINE_ARTICLE = "Članak u časopisu",
  STATUTE = "Statut",
  PATENT = "Patent",
  NEWSPAPER_ARTICLE = "Članak u novinama",
  COMPUTER_PROGRAM = "Računalni program",
  HEARING = "Saslušanje",
  TELEVISION_BROADCAST = "Televizijska emisija",
  ENCYCLOPEDIA_ARTICLE = "Članak u enciklopediji",
  CASE = "Slučaj",
  FILM = "Film",
  BILL = "Zakon",
}

export enum Topics {
  AGRICULTURE = "Poljoprivreda",
  BIODIVERSITY_SCIENCE = "Znanost o biološkoj raznolikosti",
  BIOGEOGRAPHY = "Biogeografija",
  CITIZEN_SCIENCE = "Građanska znanost",
  CLIMATE_CHANGE = "Klimatske promjene",
  CONSERVATION = "Očuvanje",
  DATA_MANAGEMENT = "Upravljanje podacima",
  DATA_PAPER = "Podatkovni rad",
  ECOLOGY = "Ekologija",
  ECOSYSTEM_SERVICES = "Usluge i održavanje ekosustava",
  EVOLUTION = "Evolucija",
  FRESHWATER = "Slatkovodni radovi",
  HUMAN_HEALTH = "Zdravlje",
  INVASIVES = "Invazivne vrste",
  MARINE = "Morski radovi",
  PHYLOGENETICS = "Filogenetika",
  SPECIES_DISTRIBUTIONS = "Distribucija vrsta",
  TAXONOMY = "Taksonomija",
}

export enum TaxonomyRankGbif {
  "DOMAIN",
  "SUPERKINGDOM",
  "KINGDOM",
  "SUBKINGDOM",
  "INFRAKINGDOM",
  "SUPERPHYLUM",
  "PHYLUM",
  "SUBPHYLUM",
  "INFRAPHYLUM",
  "SUPERCLASS",
  "CLASS",
  "SUBCLASS",
  "INFRACLASS",
  "PARVCLASS",
  "SUPERLEGION",
  "LEGION",
  "SUBLEGION",
  "INFRALEGION",
  "SUPERCOHORT",
  "COHORT",
  "SUBCOHORT",
  "INFRACOHORT",
  "MAGNORDER",
  "SUPERORDER",
  "GRANDORDER",
  "ORDER",
  "SUBORDER",
  "INFRAORDER",
  "PARVORDER",
  "SUPERFAMILY",
  "FAMILY",
  "SUBFAMILY",
  "INFRAFAMILY",
  "SUPERTRIBE",
  "TRIBE",
  "SUBTRIBE",
  "INFRATRIBE",
  "SUPRAGENERIC_NAME",
  "GENUS",
  "SUBGENUS",
  "INFRAGENUS",
  "SECTION",
  "SUBSECTION",
  "SERIES",
  "SUBSERIES",
  "INFRAGENERIC_NAME",
  "SPECIES_AGGREGATE",
  "SPECIES",
  "INFRASPECIFIC_NAME",
  "GREX",
  "SUBSPECIES",
  "CULTIVAR_GROUP",
  "CONVARIETY",
  "INFRASUBSPECIFIC_NAME",
  "PROLES",
  "RACE",
  "NATIO",
  "ABERRATION",
  "MORPH",
  "VARIETY",
  "SUBVARIETY",
  "FORM",
  "SUBFORM",
  "PATHOVAR",
  "BIOVAR",
  "CHEMOVAR",
  "MORPHOVAR",
  "PHAGOVAR",
  "SEROVAR",
  "CHEMOFORM",
  "FORMA_SPECIALIS",
  "CULTIVAR",
  "STRAIN",
  "OTHER",
  "UNRANKED",
}

export type TaxonomyGbifType = keyof typeof TaxonomyRankGbif;

export enum NotificationType {
  POST_APPROVAL = "Promjena odobrenja objave",
  EXPONAT_APPROVAL = "Promjena odobrenja eksponata",
  MEMBERSHIP_REQUEST = "Zahtjev za članstvo",
  MEMBERSHIP_CHANGE = "Promjena članstva",
  NEW_FOLLOWER = "Novi pratitelj",
  POST_BY_FOLLOWED_ACCOUNT = "Objava od praćenog računa",
  EXPONAT_BY_FOLLOWED_ORGANISATION = "Eksponat od praćene organizacije",
  WORK_BY_FOLLOWED_ORGANISATION = "Rad od praćene organizacije",
  NEW_SOCIAL_POST = "Nova društvena objava praćene organizacije",
  POINT_MILESTONE = "Dosegnut prag bodova",
  ORGANISATION_APPROVAL = "Promjena odobrenja organizacije",
  OTHER = "Ostalo",
  NEW_EXPONAT_REQUEST = "Novi zahtjev za eksponat",
  NEW_POST_REQUEST = "Novi zahtjev za objavu",
  NEW_WORK_REQUEST = "Novi zahtjev za rad",
}

export enum SocialPostType {
  STORY = "Priča",
  EU_PROJECT = "EU Projekt",
  EVENT = "Događaj",
  OTHER = "Ostalo",
  GUIDE = "Vodič",
  NEWS = "Vijesti",
  ANNOUNCEMENT = "Najava",
  WORKSHOP = "Radionica",
}

export type NotificationTypeEnumType = keyof typeof NotificationType;

export type SocialPostTypeEnumType = keyof typeof SocialPostType;

export type NotificationPromise = Promise<
  {
    UserNotification: {
      userId: string;
    }[];
  } & {
    id: string;
    title: string;
    text: string;
    createdAt: Date;
    link: string;
    notificationImage: string;
    type: NotificationTypeEnumType;
  }
>;

export type NotificationAwaited = {
  UserNotification: {
    userId: string;
  }[];
} & {
  id: string;
  title: string;
  text: string;
  createdAt: Date;
  link: string;
  notificationImage: string;
  type: NotificationTypeEnumType;
};

export enum QuizDifficulty {
  EASY = "Lako",
  MEDIUM = "Srednje",
  HARD = "Teško",
  UNSET = "Nije postavljeno",
}

export type QuizDifficultyType = keyof typeof QuizDifficulty;

export enum QuestionTypeEnum {
  MULTIPLE_CHOICE = "Višestruki izbor",
  TRUE_FALSE = "Točno/Netočno",
  FILL_IN_THE_BLANK = "Popuni praznine",
}

export type QuestionTypeEnumType = keyof typeof QuestionTypeEnum;

export enum TimeLimitTypeEnum {
  NONE = "Nema vremenskog ograničenja",
  TOTAL = "Ukupno vrijeme",
  PER_QUESTION = "Vrijeme po pitanju",
}

export type TimeLimitTypeEnumType = keyof typeof TimeLimitTypeEnum;

export const getKeyByValue = (object: any, value: any) => {
  return Object.keys(object).find((key) => object[key] === value);
};

export const getEnumValue = (enumObject: any, key: any) => {
  return enumObject ? enumObject[key] : null;
};

//Not the best functionsbut are very convenient
