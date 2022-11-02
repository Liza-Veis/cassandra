import { initRepositories } from '~/data/repositories/repositories';
import { Logger } from '~/utils/utils';

import { JSONSchema } from './json-schema/json-schema.service';
import { SystemSchema } from './system-schema/system-schema.service';

type InitServicesArgs = {
  repositories: ReturnType<typeof initRepositories>;
  logger: Logger;
};

type InitServicesReturn = {
  systemSchema: SystemSchema;
};

const initServices = ({
  repositories,
  logger,
}: InitServicesArgs): InitServicesReturn => {
  const { systemSchema: systemSchemaRepository } = repositories;

  const jsonSchema = new JSONSchema({
    logger,
  });

  const systemSchema = new SystemSchema({
    systemSchemaRepository,
    jsonSchemaService: jsonSchema,
    logger,
  });

  return { systemSchema };
};

export { initServices, type JSONSchema };
