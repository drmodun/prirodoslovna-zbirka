"use client";

import { serverGetExponat } from "@/api/serverExponat";
import NotFound from "@/not-found";
import { ExponatAsyncWrapper } from "@/utility/wrappers/exponatAsyncWrapper";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import SingleExponatView from "@/views/SingleExponatView.ts";
import { ExponatExtendedResponse } from "@biosfera/types";
import ExponatModal from "components/ExponatModal";
import { Suspense } from "react";
import classes from "../page.module.scss";
import { useGetClientExponat } from "@/api/useGetClientExponat";
import ExtrasExponatButton from "components/ExtrasExponatButton";

const ExponatPage = ({ params }: { params: any }) => {
  const { data: exponatInfo, isLoading } = useGetClientExponat(
    params.exponatId,
  );

  console.log(exponatInfo?.attributes);

  return exponatInfo && !isLoading ? (
    <div className={classes.container}>
      <div className={classes.modal}>
        <ExponatModal exponat={exponatInfo} />
        <ExtrasExponatButton
          thirdDimensionalModel={exponatInfo?.thirdDimensionalModel}
          video={exponatInfo?.video}
        />
      </div>
      <SingleExponatView exponat={exponatInfo} />
    </div>
  ) : (
    <NotFound />
  );
};

export default ExponatPage;
