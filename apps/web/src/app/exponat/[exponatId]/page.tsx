import { serverGetExponat } from "@/api/serverExponat";
import { ExponatExtendedResponse } from "@biosfera/types";
import classes from "./page.module.scss";
import ExponatModal from "components/ExponatModal";
import { PostCard } from "components/PostCard";
import CardCollection from "components/CardCollection";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import SingleExponatView from "@/views/SingleExponatView.ts";
import NotFound from "@/not-found";
import { exponatInfoPrompt, ttsPrompt } from "@/api/AI";
import { Suspense } from "react";

const ExponatPage = async ({ params }: { params: any }) => {
  const exponatInfo: ExponatExtendedResponse = await serverGetExponat(
    params.exponatId
  );

  const gpt = exponatInfo && exponatInfoPrompt(exponatInfo.alternateName);
  const audio =
    exponatInfo && gpt.then((res) => ttsPrompt(res, "exponat", exponatInfo.id));

  return exponatInfo ? (
    <div className={classes.container}>
      <div className={classes.modal}>
        <ExponatModal exponat={exponatInfo} />
      </div>
      <UserWrapper>
        <Suspense fallback={<SingleExponatView exponat={exponatInfo} />}>
          <SingleExponatView
            audioDescription={audio}
            generatedDescription={gpt}
            exponat={exponatInfo}
          />
        </Suspense>
      </UserWrapper>
    </div>
  ) : (
    <NotFound />
  );
};

export default ExponatPage;
