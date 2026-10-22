"use client";

import { api } from "@/api/shared";
import { ButtonColor } from "@/shared/enums";
import BaseButton from "components/BaseButton";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import classes from "./OrganisationQuizzes.module.scss";

interface VansyQuiz {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | null;
  publishState: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";
  questionCount: number;
  timeLimitTotalSec: number | null;
  isAnonymousAllowed: boolean;
}

export interface OrganisationQuizzesProps {
  organisationId: string;
  isAdmin: boolean;
  canModerate: boolean;
  isLoggedIn: boolean;
}

// Quizzes are written and taken on Vansy. The API asks Vansy for a one-time
// launch URL and the browser follows it; no Vansy credential reaches the page.
const openVansy = async (path: string) => {
  const { launchUrl } = await api.post<never, { launchUrl: string }>(path);
  window.location.assign(launchUrl);
};

export const OrganisationQuizzes = ({
  organisationId,
  isAdmin,
  canModerate,
  isLoggedIn,
}: OrganisationQuizzesProps) => {
  const t = useTranslations("OrganisationQuizzes");
  const [quizzes, setQuizzes] = useState<VansyQuiz[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    api
      .get<never, VansyQuiz[]>(
        `/quiz-launch/organisation/${organisationId}/quizzes`,
      )
      .then(setQuizzes)
      .catch(() => setUnavailable(true));
  }, [organisationId, isLoggedIn]);

  const launch = (path: string) =>
    openVansy(path).catch(() => toast.error(t("launchFailed")));

  return (
    <div className={classes.container}>
      {(isAdmin || canModerate) && (
        <div className={classes.actions}>
          {isAdmin && (
            <BaseButton
              isNotSubmit
              text={t("author")}
              onClick={() => launch(`/quiz-launch/author/${organisationId}`)}
            />
          )}
          {canModerate && (
            <BaseButton
              isNotSubmit
              initColor={ButtonColor.BLUE}
              text={t("review")}
              onClick={() => launch(`/quiz-launch/review/${organisationId}`)}
            />
          )}
        </div>
      )}

      {unavailable && <p className={classes.empty}>{t("unavailable")}</p>}
      {quizzes && quizzes.length === 0 && (
        <p className={classes.empty}>{t("empty")}</p>
      )}

      <div className={classes.list}>
        {quizzes?.map((quiz) => (
          <div key={quiz.id} className={classes.card}>
            <h3>{quiz.title}</h3>
            {quiz.publishState !== "PUBLISHED" && (
              <span className={classes.badge}>
                {t(`state.${quiz.publishState}`)}
              </span>
            )}
            {quiz.description && <p>{quiz.description}</p>}
            <p className={classes.meta}>
              {t("questions", { count: quiz.questionCount })}
              {quiz.timeLimitTotalSec
                ? ` · ${t("minutes", { count: Math.round(quiz.timeLimitTotalSec / 60) })}`
                : ""}
              {quiz.difficulty
                ? ` · ${t(`difficulty.${quiz.difficulty}`)}`
                : ""}
            </p>
            {quiz.publishState === "PUBLISHED" &&
              (isLoggedIn || quiz.isAnonymousAllowed ? (
                <BaseButton
                  isNotSubmit
                  text={t("take")}
                  onClick={() => launch(`/quiz-launch/take/${quiz.id}`)}
                />
              ) : (
                <p className={classes.meta}>{t("loginToTake")}</p>
              ))}
            {canModerate && quiz.publishState === "PUBLISHED" && (
              <BaseButton
                isNotSubmit
                initColor={ButtonColor.BLUE}
                text={t("proctor")}
                onClick={() =>
                  launch(`/quiz-launch/proctor/${organisationId}/${quiz.id}`)
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
