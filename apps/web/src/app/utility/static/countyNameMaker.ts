import { County } from "@biosfera/types";

const COUNTY_NAMES: Record<keyof typeof County, string> = {
  SPLITSKO_DALMATINSKA: "Splitsko-dalmatinska županija",
  DUBROVACKO_NERETVANSKA: "Dubrovačko-neretvanska županija",
  SIBENSKO_KNINSKA: "Šibensko-kninska županija",
  ZADARSKA: "Zadarska županija",
  ZAGREBACKA: "Zagrebačka županija",
  KARLOVACKA: "Karlovačka županija",
  VARAZDINSKA: "Varaždinska županija",
  KOPRIVNICKO_KRIZEVACKA: "Koprivničko-križevačka županija",
  KRAPINSKO_ZAGORSKA: "Krapinsko-zagorska županija",
  MEDIMURSKA: "Međimurska županija",
  OSIJECKO_BARANJSKA: "Osječko-baranjska županija",
  POZESKO_SLAVONSKA: "Požeško-slavonska županija",
  PRIMORSKO_GORANSKA: "Primorsko-goranska županija",
  SISACKO_MOSLAVACKA: "Sisačko-moslavačka županija",
  VUKOVARSKO_SRIJEMSKA: "Vukovarsko-srijemska županija",
  GRAD_ZAGREB: "Grad Zagreb",
  BJELOVARSKO_BILOGORSKA: "Bjelovarsko-bilogorska županija",
  BRODSKO_POSAVSKA: "Brodsko-posavska županija",
  ISTARSKA: "Istarska županija",
  LICKO_SENJSKA: "Ličko-senjska županija",
  VIROVITICKO_PODRAVSKA: "Virovitičko-podravska županija",
  OTHER: "Ostalo",
};

// The Croatian name of a county key; anything else is returned as it is.
export const makeCountyName = (county: string) =>
  COUNTY_NAMES[county as keyof typeof County] ?? county;
