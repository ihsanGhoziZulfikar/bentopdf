// Helper: Format Size
export const formatSize = (bytes: number): string => {
  if (bytes <= 0) return '0 KB';
  if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / 1024).toFixed(2) + ' KB';
};
