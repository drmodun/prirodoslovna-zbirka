import { useTranslations } from "next-intl";

// Tab ids stay the Croatian names the views switch on; this maps them to the
// Tabs messages for display.
const TAB_MESSAGE_KEYS: Record<string, string> = {
  Korisnici: "users",
  Organizacije: "organisations",
  Eksponati: "exponats",
  Objave: "posts",
  Radovi: "works",
  "Radovi (GBIF)": "gbifWorks",
  Literatura: "literature",
  Početna: "home",
  Članovi: "members",
  Edit: "edit",
  Followers: "followers",
  Following: "following",
  Lajkano: "liked",
  Favoriti: "favourites",
  Spremljeno: "saved",
  Čitano: "read",
  "O korisniku": "about",
  Kreacije: "creations",
  Reakcije: "reactions",
  Članstva: "memberships",
  Uredi: "edit",
  Kvizovi: "quizzes",
};

export const useTabLabel = () => {
  const t = useTranslations("Tabs");

  return (tab: string) =>
    tab in TAB_MESSAGE_KEYS ? t(TAB_MESSAGE_KEYS[tab]) : tab;
};
