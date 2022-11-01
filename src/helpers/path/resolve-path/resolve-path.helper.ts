import path from 'path';

const resolvePath = (...paths: string[]): string => {
  return path.resolve(...paths);
};

export { resolvePath };
