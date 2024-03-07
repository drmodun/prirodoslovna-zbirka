import { County } from "@biosfera/types";

export const makeCountyName = (county: string) => {
  if (!Object.keys(County).includes(county)) return county;
  if (county === "OTHER") return "Ostalo";
  if (county === "GRAD_ZAGREB") return "Grad Zagreb";
  if (!county) return "Nepoznato";
  const addHiphen = county.replace("_", "-").toLowerCase();
  const capitalize = addHiphen.charAt(0).toUpperCase() + addHiphen.slice(1);
  let final = capitalize + " županija";

  for (let i = 0; i < final.length; i++) {
    if (final[i] === "c") {
      final = final.slice(0, i) + "č" + final.slice(i + 1);
    }

    if (final[i] === "z" && final[i - 1] !== "-") {
      final = final.slice(0, i) + "ž" + final.slice(i + 1);
    }
  }

  if (county === "SIBENSKO_KNINSKA") return "Š" + final.slice(1);
  if (county === "MEDIMURSKA") return final.slice(0, 2) + "đ" + final.slice(3);

  return final;
};
