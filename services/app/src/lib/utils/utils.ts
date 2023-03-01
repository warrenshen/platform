export const getDataCyForTabLabel = (label: string): string => {
  return label.replace(/\s+/g, "-").toLowerCase();
};
