import { exponatInfoPrompt, ttsPrompt } from "@/api/AI";
import SingleExponatView from "@/views/SingleExponatView.ts";
import { ExponatExtendedResponse } from "@biosfera/types";

export const ExponatAsyncWrapper = async ({
  exponat,
}: {
  exponat: ExponatExtendedResponse;
}) => {
  const gpt = await exponatInfoPrompt(exponat.alternateName);
  const audio = await ttsPrompt(gpt, "exponat", exponat.id);

  return (
    <SingleExponatView
      audioDescription={audio}
      generatedDescription={gpt}
      exponat={exponat}
    />
  );
};
