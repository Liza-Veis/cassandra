import { Client, auth } from 'cassandra-driver';

import { Database } from '~/common/types/types';
import { resolvePath } from '~/helpers/helpers';

import { DatabaseConnectionError } from './exceptions/exceptions';
import { databaseConfig } from './validation-schemas/validation-schemas';

const connectToDatabase = async (configPath: string): Promise<Database> => {
  const config = await import(resolvePath(process.cwd(), configPath));

  const configValidationResult = databaseConfig.safeParse(config);

  if (!configValidationResult.success) {
    const [{ message }] = configValidationResult.error.errors;

    throw new DatabaseConnectionError({ message });
  }

  try {
    const client = new Client({
      localDataCenter: 'datacenter1',
      contactPoints: [`${config.host}:${config.port}`],
      authProvider: new auth.PlainTextAuthProvider(
        config.user,
        config.password,
      ),
    });

    await client.connect();

    return client;
  } catch (e) {
    throw new DatabaseConnectionError({
      message: (e as Error).message,
    });
  }
};

export { connectToDatabase };
