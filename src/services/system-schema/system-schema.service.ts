import { NotificationMessage } from '~/common/enums/enums';
import { UserDefinedType } from '~/data/models/models';
import { SystemSchema as SystemSchemaRepository } from '~/data/repositories/repositories';
import { JSONSchemaError, SystemSchemaError } from '~/exceptions/exceptions';
import {
  getMessageWithParams,
  resolvePath,
  writeFile,
} from '~/helpers/helpers';
import { JSONSchema } from '~/services/services';
import { Logger } from '~/utils/utils';

type Constructor = {
  systemSchemaRepository: SystemSchemaRepository;
  jsonSchemaService: JSONSchema;
  logger: Logger;
};

class SystemSchema {
  private systemSchemaRepository: SystemSchemaRepository;

  private jsonSchemaService: JSONSchema;

  private logger: Logger;

  public constructor({
    systemSchemaRepository,
    jsonSchemaService,
    logger,
  }: Constructor) {
    this.systemSchemaRepository = systemSchemaRepository;
    this.jsonSchemaService = jsonSchemaService;
    this.logger = logger;
  }

  public async exportTableJSONSchemas(path: string): Promise<void> {
    const tables = await this.systemSchemaRepository.getTables();

    await Promise.allSettled(
      tables.map(async ({ name }) => {
        try {
          await this.exportTableJSONSchema(name, path);

          const successMessage = getMessageWithParams(
            NotificationMessage.$TABLE_JSON_SCHEMA_EXPORT_SUCCESS,
            { table: name },
          );
          this.logger.info(successMessage);
        } catch (e) {
          const errorMessage = `${getMessageWithParams(
            NotificationMessage.$TABLE_JSON_SCHEMA_EXPORT_FAILURE,
            { table: name },
          )} ${e instanceof JSONSchemaError ? e.message : ''}`;

          this.logger.error(
            new SystemSchemaError({
              message: errorMessage,
            }),
          );
        }
      }),
    );
  }

  private async exportTableJSONSchema(
    name: string,
    path: string,
  ): Promise<void> {
    const udts = await this.systemSchemaRepository.getUserDefinedTypes();
    const schemaPath = resolvePath(process.cwd(), path, `${name}_table.json`);
    const schema = await this.getTableJSONSchema(name, udts);

    await writeFile(schemaPath, schema);
  }

  private async getTableJSONSchema(
    name: string,
    udts: UserDefinedType[],
  ): Promise<string> {
    const columns = await this.systemSchemaRepository.getTableColumns(name);

    return this.jsonSchemaService.getTableJSONSchema(name, columns, udts);
  }
}

export { SystemSchema };
