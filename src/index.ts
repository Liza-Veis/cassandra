import { ENV } from './common/enums/enums';
import { initRepositories } from './data/repositories/repositories';
import { connectToDatabase } from './database';
import { initServices } from './services/services';

const initApp = async (): Promise<void> => {
  try {
    const database = await connectToDatabase(ENV.DATABASE_CONFIG_PATH);

    const repositories = initRepositories(database);
    const { systemSchema } = initServices(repositories);

    await systemSchema.exportTableJSONSchemas(ENV.SCHEMA_DIRECTORY_PATH);

    await database.shutdown();
  } catch (e) {
    console.error(e);
  }
};

initApp();
