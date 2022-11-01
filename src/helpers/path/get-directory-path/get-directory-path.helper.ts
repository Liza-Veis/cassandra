import path from 'path';

const getDirectoryPath = (filePath: string): string => {
  return path.dirname(filePath);
};

export { getDirectoryPath };
