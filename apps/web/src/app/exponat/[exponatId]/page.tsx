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
import { ExponatAsyncWrapper } from "@/utility/wrappers/exponatAsyncWrapper";
import BaseButton from "components/BaseButton";
import ExtrasExponatButton from "components/ExtrasExponatButton";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

const ExponatPage = async ({ params }: { params: any }) => {
  const exponatInfo: ExponatExtendedResponse = await serverGetExponat(
    params.exponatId,
  );
  console.log(exponatInfo?.categorization?.speciesKey);

  if (!exponatInfo) {
    redirect(`/exponat/${params.exponatId}/admin`);
  }

  return (
    <div className={classes.container}>
      <div className={classes.modal}>
        <ExponatModal exponat={exponatInfo} />
        {exponatInfo && (
          <ExtrasExponatButton
            thirdDimensionalModel={exponatInfo?.thirdDimensionalModel}
            video={exponatInfo?.video}
          />
        )}
      </div>
      <UserWrapper>
        <Suspense fallback={<SingleExponatView exponat={exponatInfo} />}>
          <ExponatAsyncWrapper exponat={exponatInfo} />
        </Suspense>
      </UserWrapper>
    </div>
  );
};

export default ExponatPage;
