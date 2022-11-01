import { Client, auth } from 'cassandra-driver';

import { Database } from '~/common/types/types';
import { resolvePath } from '~/helpers/helpers';

const connectToDatabase = async (configPath: string): Promise<Database> => {
  const config = await import(resolvePath(process.cwd(), configPath));

  const client = new Client({
    localDataCenter: 'datacenter1',
    contactPoints: [`${config.host}:${config.port}`],
    authProvider: new auth.PlainTextAuthProvider(config.user, config.password),
  });

  await client.connect();

  return client;
};

export { connectToDatabase };
