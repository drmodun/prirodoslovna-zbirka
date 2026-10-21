import en from "../../messages/en.json";
import hr from "../../messages/hr.json";

const allMessages = { en, hr };

export const intlState = {
  locale: "hr" as keyof typeof allMessages,
  messages: () => allMessages[intlState.locale],
};

// The language components render in; jest.setup resets it to Croatian.
export const setTestLocale = (locale: keyof typeof allMessages) => {
  intlState.locale = locale;
};

// A translator for code that takes `t` as an argument, e.g. form schemas.
// next-intl itself is mocked with this module, hence requireActual.
export const translator = (namespace?: string) =>
  jest.requireActual("next-intl").createTranslator({
    locale: intlState.locale,
    messages: intlState.messages(),
    namespace,
  }) as (key: string, values?: Record<string, unknown>) => string;
