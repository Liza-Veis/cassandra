import { Database } from '~/common/types/types';

import { SystemSchema } from './system-schema/system-schema.repository';

type InitRepositoriesArgs = {
  database: Database;
};

type InitRepositoriesReturn = {
  systemSchema: SystemSchema;
};

const initRepositories = ({
  database,
}: InitRepositoriesArgs): InitRepositoriesReturn => {
  const systemSchema = new SystemSchema({
    database,
  });

  return { systemSchema };
};

export { initRepositories, type SystemSchema };
