export const toBnNumber = (n: number): string =>
  n.toLocaleString("bn-BD");

export const formatDate = (date: string): string => {
  const parsedDate = new Date(date);
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = parsedDate.toLocaleString("en-US", { month: "long" }); // Full month name
  const year = parsedDate.getFullYear();

  return `${day} ${month}, ${year}`;
};

