export const shortenText = (
  textToShorten: string = "",
  numberOfWords: number,
  finishingSequence: string = "...",
) => {
  return (
    textToShorten.split(" ").splice(0, numberOfWords).join(" ") +
    finishingSequence
  );
};
