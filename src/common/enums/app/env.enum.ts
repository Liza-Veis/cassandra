import { config } from 'dotenv';

config();

const { DATABASE_CONFIG_PATH, SCHEMA_DIRECTORY_PATH } = process.env;

const ENV = {
  DATABASE_CONFIG_PATH: DATABASE_CONFIG_PATH ?? '',
  SCHEMA_DIRECTORY_PATH: SCHEMA_DIRECTORY_PATH ?? '',
};

export { ENV };
