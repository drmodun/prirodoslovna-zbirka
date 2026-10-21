import { z } from "zod";

type Translate = (key: string) => string;

const EXPONAT_KINDS = ["EUCARIOT", "PROCARIOT", "MINERAL"] as const;

// `t` reads the ExponatForm messages.
export const createExponatSchema = (t: Translate) =>
  z
    .object({
      name: z.string().min(5, t("nameMin")).max(100, t("nameMax")),
      description: z
        .string()
        .min(10, t("descriptionMin"))
        .max(2000, t("descriptionMax")),
      alternateName: z.string().min(2, t("nomenclatureMin")),
      funFacts: z
        .array(z.string().min(2, t("funFactMin")))
        .min(1, t("funFactsMin")),
      exponatKind: z.enum(EXPONAT_KINDS),
      attributes: z.any(),
      authorshipInfoId: z
        .string({
          required_error: t("authorRequired"),
        })
        .uuid(),
      mainImage: z.any(),
    })
    .refine(
      (data) => {
        return Object.keys(data.attributes).length > 0;
      },
      {
        message: t("attributesMin"),
        path: ["attributes"],
      },
    );

// `t` reads the ExponatKinds messages.
export const getExponatKindOptions = (t: Translate) =>
  EXPONAT_KINDS.map((value) => ({ value, label: t(value) }));

// Minerals have no taxonomy, so they skip the species lookup.
export const isMineral = (exponatKind?: string) =>
  exponatKind?.toLowerCase() === "mineral";
