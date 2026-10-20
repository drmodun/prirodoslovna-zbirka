import { County, Topics, WorkType } from "@biosfera/types";
import { blobToBase64 } from "./blobToBase64";
import { makeCountyName } from "./countyNameMaker";
import { createMediaStream } from "./createMediaStream";
import { dateShortener, dateShortenerWithoutTime } from "./dateShortener";
import {
  getDifficultyTypesList,
  getLiteratureTypesList,
  getQuestionTypesList,
  getTimeLimitTypesList,
  getTopicsList,
  getTopicsValues,
} from "./getEnumLists";
import { getPfpUrl } from "./getPfpUrl";
import { shortenText } from "./shortenText";
import { stringCapitaliser } from "./stringCapitaliser";

describe("stringCapitaliser", () => {
  it.each([
    ["hELLO", "Hello"],
    ["a", "A"],
    ["", ""],
    ["ŠIBENIK", "Šibenik"],
  ])("%p -> %p", (input, expected) => {
    expect(stringCapitaliser(input)).toBe(expected);
  });
});

describe("shortenText", () => {
  it("keeps the first N words and appends the ending", () => {
    expect(shortenText("a b c d", 2)).toBe("a b...");
  });
  it("supports a custom ending", () => {
    expect(shortenText("a b c d", 3, " (više)")).toBe("a b c (više)");
  });
  it("appends the ending even when the text is already short", () => {
    expect(shortenText("a b", 5)).toBe("a b...");
  });
  it("handles a missing text", () => {
    expect(shortenText(undefined, 3)).toBe("...");
  });
  it("0 words leaves only the ending", () => {
    expect(shortenText("a b", 0)).toBe("...");
  });
});

describe("makeCountyName", () => {
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
  ])("%s -> %s", (county, expected) => {
    expect(makeCountyName(county)).toBe(expected);
  });

  it("returns unknown values unchanged", () => {
    expect(makeCountyName("ATLANTIS")).toBe("ATLANTIS");
    expect(makeCountyName("")).toBe("");
  });

  it("names every county in the enum", () => {
    for (const county of Object.keys(County)) {
      const name = makeCountyName(county);
      expect(name).toBeTruthy();
      expect(name).not.toContain("_");
    }
  });

  it("spells Požeško-slavonska županija correctly", () => {
    expect(makeCountyName("POZESKO_SLAVONSKA")).toBe(
      "Požeško-slavonska županija",
    );
  });
});

describe("dateShortener", () => {
  const date = new Date(2024, 4, 17, 13, 45, 9); // local time

  it("replaces slashes with dots and the comma with a dot", () => {
    const text = dateShortener(date);
    expect(text).not.toMatch(/[\/,]/);
    expect(text).toContain("2024");
  });

  it("accepts date strings", () => {
    expect(dateShortener(date.toISOString())).toContain("2024");
  });

  it("without time keeps only the date part", () => {
    const text = dateShortenerWithoutTime(date);
    expect(text).not.toContain("/");
    expect(text).not.toMatch(/\d:\d/);
  });

  it("an invalid date shows 'Invalid Date' rather than throwing", () => {
    expect(dateShortener("nonsense")).toBe("Invalid Date");
  });
});

describe("getPfpUrl", () => {
  it("builds the profile picture address from the files base URL", () => {
    expect(getPfpUrl("u1")).toMatch(/\/user\/u1$/);
  });
});

describe("enum lists", () => {
  it("lists the keys (not the labels) of each enum", () => {
    expect(getTopicsList()).toEqual(Object.keys(Topics));
    expect(getTopicsValues()).toEqual(Object.values(Topics));
    expect(getLiteratureTypesList()).toEqual(Object.keys(WorkType));
    expect(getTimeLimitTypesList()).toContain("NONE");
    expect(getDifficultyTypesList()).toContain("EASY");
    expect(getQuestionTypesList()).toContain("MULTIPLE_CHOICE");
  });
});

describe("blobToBase64", () => {
  it("passes the base64 payload without the data-URL prefix", (done) => {
    blobToBase64(new Blob(["hello"], { type: "audio/wav" }), (data: string) => {
      expect(Buffer.from(data, "base64").toString()).toBe("hello");
      done();
    });
  });
});

describe("createMediaStream", () => {
  const analyser = (peak: number) => ({
    fftSize: 4,
    getByteTimeDomainData: (array: Uint8Array) =>
      array.fill(Math.min(255, 127 + peak)),
  });

  beforeEach(() => {
    (global as any).AudioContext = jest.fn(() => ({
      createMediaStreamSource: () => ({ connect: jest.fn() }),
      createAnalyser: () => analyser(64),
    }));
  });

  it("reports the normalised peak level while recording", () => {
    const callback = jest.fn();
    const raf = jest.fn();
    (global as any).requestAnimationFrame = raf;
    createMediaStream({}, true, callback);
    expect(callback).toHaveBeenCalledWith(0.5); // 64 / 128
    expect(raf).toHaveBeenCalled(); // keeps sampling
  });

  it("samples nothing when not recording", () => {
    const callback = jest.fn();
    createMediaStream({}, false, callback);
    expect(callback).not.toHaveBeenCalled();
  });
});
