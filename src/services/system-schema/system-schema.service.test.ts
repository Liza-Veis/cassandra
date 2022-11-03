import { deepEqual, instance, mock, when } from 'ts-mockito';

import { CQLDataType, JSONSchemaDataType } from '~/common/enums/enums';
import { DatabaseColumn, DatabaseTable } from '~/data/models/models';
import { SystemSchema as SystemSchemaRepository } from '~/data/repositories/repositories';
import { writeFile } from '~/helpers/helpers';
import { JSONSchema as JSONSchemaService } from '~/services/services';
import { Logger } from '~/utils/utils';

import { SystemSchema as SystemSchemaService } from './system-schema.service';

jest.mock('~/helpers/fs/write-file/write-file.helper.ts', () => ({
  writeFile: jest.fn(),
}));

enum TableName {
  USER = 'user',
}

enum ColumnName {
  ID = 'id',
  NAME = 'name',
  AGE = 'age',
}

describe('SystemSchemaService', () => {
  let mockSystemSchemaService: SystemSchemaService;
  let mockSystemSchemaRepository: SystemSchemaRepository;
  let mockJSONSchemaService: JSONSchemaService;

  beforeEach(() => {
    jest.resetAllMocks();

    const mockLogger = mock<Logger>();
    mockSystemSchemaRepository = mock<SystemSchemaRepository>();
    mockJSONSchemaService = mock<JSONSchemaService>();

    mockSystemSchemaService = new SystemSchemaService({
      systemSchemaRepository: instance(mockSystemSchemaRepository),
      jsonSchemaService: instance(mockJSONSchemaService),
      logger: instance(mockLogger),
    });
  });

  describe('exportTableJSONSchemas', () => {
    it('Should export table JSON Schemas', async () => {
      const RESULT_PATH = './result';
      const TABLES = [{ name: TableName.USER }].map(DatabaseTable.initialize);
      const COLUMNS = [
        {
          tableName: TableName.USER,
          columnName: ColumnName.ID,
          type: CQLDataType.UUID,
        },
        {
          tableName: TableName.USER,
          columnName: ColumnName.NAME,
          type: CQLDataType.TEXT,
        },
        {
          tableName: TableName.USER,
          columnName: ColumnName.AGE,
          type: CQLDataType.INT,
        },
      ].map(DatabaseColumn.initialize);
      const JSON_SCHEMA = {
        $schema: 'http://json-schema.org/draft-04/schema#',
        title: TableName.USER,
        type: JSONSchemaDataType.OBJECT,
        properties: {
          id: {
            type: JSONSchemaDataType.STRING,
          },
          name: {
            type: JSONSchemaDataType.STRING,
          },
          age: {
            type: JSONSchemaDataType.NUMBER,
          },
        },
      };

      when(mockSystemSchemaRepository.getTables()).thenResolve(TABLES);
      when(
        mockSystemSchemaRepository.getTableColumns(TableName.USER),
      ).thenResolve(COLUMNS);
      when(mockSystemSchemaRepository.getUserDefinedTypes()).thenResolve([]);
      when(
        mockJSONSchemaService.getTableJSONSchema(
          TableName.USER,
          deepEqual(COLUMNS),
          deepEqual([]),
        ),
      ).thenReturn(JSON_SCHEMA);

      await mockSystemSchemaService.exportTableJSONSchemas(RESULT_PATH);

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(writeFile).toHaveBeenCalledWith(
        expect.anything(),
        JSON.stringify(JSON_SCHEMA, null, '  '),
      );
    });
  });
});
