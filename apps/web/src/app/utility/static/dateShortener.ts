export const dateShortener = (date: string) => {
  const dateObj = new Date(date);
  return dateObj
    ? `${dateObj.toLocaleDateString()}${dateObj.toLocaleTimeString()}`
    : date;
};
