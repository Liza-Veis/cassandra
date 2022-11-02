import { ENV } from './common/enums/enums';
import { initRepositories } from './data/repositories/repositories';
import { connectToDatabase } from './database';
import { initServices } from './services/services';
import { Logger } from './utils/utils';

const initApp = async (): Promise<void> => {
  const logger = new Logger();

  const database = await connectToDatabase(ENV.DATABASE_CONFIG_PATH);

  const repositories = initRepositories({
    database,
  });
  const { systemSchema } = initServices({
    repositories,
    logger,
  });

  await systemSchema.exportTableJSONSchemas(ENV.SCHEMA_DIRECTORY_PATH);

  await database.shutdown();
};

initApp();
