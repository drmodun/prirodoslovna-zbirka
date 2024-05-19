import { exponatInfoPrompt, ttsPrompt } from "@/api/AI";
import { getMap, getMapPossibility } from "@/api/serverMap";
import SingleExponatView from "@/views/SingleExponatView.ts";
import { ExponatExtendedResponse, MapPossibility } from "@biosfera/types";

export const ExponatAsyncWrapper = async ({
  exponat,
}: {
  exponat: ExponatExtendedResponse;
}) => {
  const mapPossibility =
    exponat.categorization?.speciesKey &&
    (await getMapPossibility(exponat.categorization?.speciesKey));
  const gpt = await exponatInfoPrompt(exponat.alternateName);
  const audio = await ttsPrompt(gpt, "exponat", exponat.id);

  const checkMap = (item: MapPossibility) => {
    return item?.total > 5000;
  };

  return (
    <SingleExponatView
      audioDescription={audio}
      generatedDescription={gpt}
      exponat={exponat}
      isMapPossible={checkMap(mapPossibility as MapPossibility)}
    />
  );
};
