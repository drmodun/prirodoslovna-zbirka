import en from "../../messages/en.json";
import hr from "../../messages/hr.json";

type Messages = { [key: string]: string | Messages };

const keys = (messages: Messages, prefix = ""): string[] =>
  Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "string"
      ? [prefix + key]
      : keys(value, `${prefix}${key}.`),
  );

// ICU arguments such as {name} or {count, plural, ...}.
const argumentsOf = (message: string) =>
  [...message.matchAll(/\{(\w+)/g)].map((match) => match[1]).sort();

const get = (messages: Messages, key: string) =>
  key.split(".").reduce<any>((node, part) => node[part], messages) as string;

describe("messages", () => {
  it("has the same keys in English and Croatian", () => {
    expect(keys(hr).sort()).toEqual(keys(en).sort());
  });

  it("has no empty messages", () => {
    for (const messages of [en, hr]) {
      for (const key of keys(messages)) {
        expect(get(messages, key).trim()).not.toBe("");
      }
    }
  });

  it("uses the same arguments in both languages", () => {
    for (const key of keys(en)) {
      expect([key, ...argumentsOf(get(hr, key))]).toEqual([
        key,
        ...argumentsOf(get(en, key)),
      ]);
    }
  });
});
