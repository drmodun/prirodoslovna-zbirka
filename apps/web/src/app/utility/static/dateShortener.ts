export const dateShortener = (date: string | Date): string => {
  const dateObj = new Date(date);
  return dateObj
    ? `${dateObj.toLocaleDateString()}${dateObj.toLocaleTimeString()}`
    : date.toString();
};
