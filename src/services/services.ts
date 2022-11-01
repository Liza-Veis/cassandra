import { initRepositories } from '~/data/repositories/repositories';

import { JSONSchema } from './json-schema/json-schema.service';
import { SystemSchema } from './system-schema/system-schema.service';

type InitServicesReturn = {
  systemSchema: SystemSchema;
};

const initServices = (
  repositories: ReturnType<typeof initRepositories>,
): InitServicesReturn => {
  const { systemSchema: systemSchemaRepository } = repositories;

  const jsonSchema = new JSONSchema();

  const systemSchema = new SystemSchema({
    systemSchemaRepository,
    jsonSchemaService: jsonSchema,
  });

  return { systemSchema };
};

export { initServices, type JSONSchema };
