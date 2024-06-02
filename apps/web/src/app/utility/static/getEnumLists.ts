import { Topics, WorkType } from "@biosfera/types";

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
