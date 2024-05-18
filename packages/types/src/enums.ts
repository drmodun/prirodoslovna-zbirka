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

export const getKeyByValue = (object: any, value: any) => {
  return Object.keys(object).find((key) => object[key] === value);
};

export const getEnumValue = (enumObject: any, key: any) => {
  return enumObject[key];
};

//Not the best functionsbut are very convenient
