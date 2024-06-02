export const dateShortener = (date: string | Date): string => {
  const dateObj = new Date(date);
  return dateObj
    ? `${dateObj.toLocaleString().replaceAll("/", ".").replace(",", ".")}`
    : date.toString().replaceAll("/", ".").replace(",", ".");
};

export const dateShortenerWithoutTime = (date: string | Date): string => {
  const dateObj = new Date(date);
  return dateObj
    ? `${dateObj.toLocaleDateString().replaceAll("/", ".")}`
    : date.toString().replaceAll("/", ".");
};
