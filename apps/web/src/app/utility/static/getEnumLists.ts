import {
  QuestionTypeEnum,
  QuizDifficulty,
  TimeLimitTypeEnum,
  Topics,
  WorkType,
} from "@biosfera/types";

export const getTopicsList = () => {
  const array = Object.keys(Topics);
  return array;
};

export const getTopicsValues = () => {
  const array = Object.values(Topics);
  return array;
};

export const getLiteratureTypesList = () => {
  const array = Object.keys(WorkType);
  return array;
};

export const getTimeLimitTypesList = () => {
  const array = Object.keys(TimeLimitTypeEnum);
  return array;
};

export const getDifficultyTypesList = () => {
  const array = Object.keys(QuizDifficulty);
  return array;
};

export const getQuestionTypesList = () => {
  const array = Object.keys(QuestionTypeEnum);
  return array;
};
