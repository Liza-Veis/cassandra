import { Database } from '~/common/types/types';

import { SystemSchema } from './system-schema/system-schema.repository';

type InitRepositoriesReturn = {
  systemSchema: SystemSchema;
};

const initRepositories = (database: Database): InitRepositoriesReturn => {
  const systemSchema = new SystemSchema({
    database,
  });

  return { systemSchema };
};

export { initRepositories, type SystemSchema };
