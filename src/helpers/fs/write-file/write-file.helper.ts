import fs from 'fs';

import { getDirectoryPath } from '~/helpers/helpers';

const writeFile = async (path: string, data: string): Promise<void> => {
  const directoryPath = getDirectoryPath(path);

  await fs.promises.mkdir(directoryPath, {
    recursive: true,
  });
  await fs.promises.writeFile(path, data);
};

export { writeFile };
