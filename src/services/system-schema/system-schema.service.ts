import { SystemSchema as SystemSchemaRepository } from '~/data/repositories/repositories';
import { resolvePath, writeFile } from '~/helpers/helpers';
import { JSONSchema } from '~/services/services';

type Constructor = {
  systemSchemaRepository: SystemSchemaRepository;

  jsonSchemaService: JSONSchema;
};

class SystemSchema {
  private systemSchemaRepository: SystemSchemaRepository;

  private jsonSchemaService: JSONSchema;

  public constructor({
    systemSchemaRepository,
    jsonSchemaService,
  }: Constructor) {
    this.systemSchemaRepository = systemSchemaRepository;
    this.jsonSchemaService = jsonSchemaService;
  }

  public async exportTableJSONSchemas(path: string): Promise<void> {
    const tables = await this.systemSchemaRepository.getTables();
    const udts = await this.systemSchemaRepository.getUserDefinedTypes();

    // TODO catch errors
    await Promise.allSettled(
      tables.map(async ({ name }) => {
        const columns = await this.systemSchemaRepository.getTableColumns(name);

        const schema = this.jsonSchemaService.getTableJSONSchema(
          name,
          columns,
          udts,
        );

        const schemaPath = resolvePath(
          process.cwd(),
          path,
          `${name}_table.json`,
        );

        await writeFile(schemaPath, schema);
      }),
    );
  }
}

export { SystemSchema };
