import { renderHook } from "@testing-library/react";
import { County } from "@biosfera/types";
import { setTestLocale } from "test-utils/intl";
import { useCountyName } from "./useCountyName";

const countyName = (county?: string) =>
  renderHook(() => useCountyName()).result.current(county);

describe("useCountyName", () => {
  it.each([
    ["GRAD_ZAGREB", "Grad Zagreb"],
    ["OTHER", "Ostalo"],
    ["ZAGREBACKA", "Zagrebačka županija"],
    ["SPLITSKO_DALMATINSKA", "Splitsko-dalmatinska županija"],
    ["DUBROVACKO_NERETVANSKA", "Dubrovačko-neretvanska županija"],
    ["VARAZDINSKA", "Varaždinska županija"],
    ["KOPRIVNICKO_KRIZEVACKA", "Koprivničko-križevačka županija"],
    ["KRAPINSKO_ZAGORSKA", "Krapinsko-zagorska županija"],
    ["SIBENSKO_KNINSKA", "Šibensko-kninska županija"],
    ["MEDIMURSKA", "Međimurska županija"],
    ["ISTARSKA", "Istarska županija"],
    ["POZESKO_SLAVONSKA", "Požeško-slavonska županija"],
  ])("%s -> %s in Croatian", (county, expected) => {
    expect(countyName(county)).toBe(expected);
  });

  it.each([
    ["GRAD_ZAGREB", "City of Zagreb"],
    ["OTHER", "Other"],
    ["SPLITSKO_DALMATINSKA", "Split-Dalmatia County"],
  ])("%s -> %s in English", (county, expected) => {
    setTestLocale("en");
    expect(countyName(county)).toBe(expected);
  });

  it("returns unknown values unchanged", () => {
    expect(countyName("ATLANTIS")).toBe("ATLANTIS");
    expect(countyName("")).toBe("");
    expect(countyName(undefined)).toBe("");
  });

  it.each(["en", "hr"] as const)(
    "names every county in the enum (%s)",
    (locale) => {
      setTestLocale(locale);
      for (const county of Object.keys(County)) {
        const name = countyName(county);
        expect(name).toBeTruthy();
        expect(name).not.toContain("_");
        expect(name).not.toContain("Counties.");
      }
    },
  );
});
