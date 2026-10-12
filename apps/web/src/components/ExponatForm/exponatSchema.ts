import { z } from "zod";

export const exponatSchema = z
  .object({
    name: z
      .string()
      .min(5, " Ime mora imati više od 5 slova")
      .max(100, "Ime mora imati manje od 100 slova"),
    description: z
      .string()
      .min(10, "Opis mora imati više od 10 slova")
      .max(2000, "Opis mora imati manje od 2000 slova"),
    alternateName: z.string().min(2, "Nomenklatura mora imati više od 2 slova"),
    funFacts: z
      .array(z.string().min(2, "Mora imati više od 2 slova"))
      .min(1, "Mora postojati barem jedan fun fact"),
    exponatKind: z.enum(["EUCARIOT", "PROCARIOT", "MINERAL"]),
    attributes: z.any(),
    authorshipInfoId: z
      .string({
        required_error: "Mora postojati autor",
      })
      .uuid(),
    mainImage: z.any(),
  })
  .refine(
    (data) => {
      return Object.keys(data.attributes).length > 0;
    },
    {
      message: "Mora postojati barem jedan atribut",
      path: ["attributes"],
    },
  );

export const exponatKindOptions = [
  { value: "EUCARIOT", label: "Eukariot" },
  { value: "PROCARIOT", label: "Procariot" },
  { value: "MINERAL", label: "Mineral" },
];

// Minerals have no taxonomy, so they skip the species lookup.
export const isMineral = (exponatKind?: string) =>
  exponatKind?.toLowerCase() === "mineral";
