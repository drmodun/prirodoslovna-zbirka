import { Topics } from "@biosfera/types";

export const getTopicsList = () => {
  const array = Object.keys(Topics);
  return array.toSpliced(0, array.length);
};

export const getLiteratureTypesList = () => {
  const array = Object.keys(Topics);
  return array.toSpliced(0, array.length);
};
