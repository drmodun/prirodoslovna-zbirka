export const stringCapitaliser = (string: string) => {
  const firstLetter = string.charAt(0).toUpperCase();
  const rest = string.toLowerCase().slice(1);
  return firstLetter + rest;
};
