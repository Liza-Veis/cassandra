import { instance, mock } from 'ts-mockito';

import { CQLDataType, JSONSchemaDataType } from '~/common/enums/enums';
import { DatabaseColumn, UserDefinedType } from '~/data/models/models';
import { CQLTypeParser, Logger } from '~/utils/utils';

import { JSONSchema as JSONSchemaService } from './json-schema.service';

enum TableName {
  USER = 'user',
}

enum ColumnName {
  ID = 'id',
  NAME = 'name',
  AGE = 'age',
  ADDRESS = 'address',
  SCHEDULE = 'schedule',
}

enum UDTName {
  ADDRESS = 'address',
}

enum UDTFieldName {
  CITY = 'city',
  STREET = 'street',
  HOUSE = 'house',
}

describe('JSONSchemaService', () => {
  let jsonSchemaService: JSONSchemaService;

  beforeEach(() => {
    jest.resetAllMocks();

    const mockLogger = mock<Logger>();

    jsonSchemaService = new JSONSchemaService({
      logger: instance(mockLogger),
    });
  });

  describe('getTableJSONSchema', () => {
    it('Should return valid JSON Schema for columns with base types', async () => {
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
        $schema: JSONSchemaService.JSON_SCHEMA_DIALECT,
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

      const result = jsonSchemaService.getTableJSONSchema(
        TableName.USER,
        COLUMNS,
        [],
      );

      expect(result).toEqual(JSON_SCHEMA);
    });

    it('Should return valid JSON Schema for columns with map type', async () => {
      const COLUMNS = [
        {
          tableName: TableName.USER,
          columnName: ColumnName.SCHEDULE,
          type: CQLTypeParser.getNestedType(CQLDataType.MAP, [
            CQLDataType.TEXT,
            CQLDataType.TEXT,
          ]),
        },
      ].map(DatabaseColumn.initialize);

      const JSON_SCHEMA = {
        $schema: JSONSchemaService.JSON_SCHEMA_DIALECT,
        title: TableName.USER,
        type: JSONSchemaDataType.OBJECT,
        properties: {
          [ColumnName.SCHEDULE]: {
            type: JSONSchemaDataType.OBJECT,
            additionalProperties: {
              type: JSONSchemaDataType.STRING,
            },
          },
        },
      };

      const result = jsonSchemaService.getTableJSONSchema(
        TableName.USER,
        COLUMNS,
        [],
      );

      expect(result).toEqual(JSON_SCHEMA);
    });

    it('Should return valid JSON Schema for columns with list type', async () => {
      const COLUMNS = [
        {
          tableName: TableName.USER,
          columnName: ColumnName.SCHEDULE,
          type: CQLTypeParser.getNestedType(CQLDataType.LIST, [
            CQLDataType.DATE,
          ]),
        },
      ].map(DatabaseColumn.initialize);

      const JSON_SCHEMA = {
        $schema: JSONSchemaService.JSON_SCHEMA_DIALECT,
        title: TableName.USER,
        type: JSONSchemaDataType.OBJECT,
        properties: {
          [ColumnName.SCHEDULE]: {
            type: JSONSchemaDataType.ARRAY,
            items: {
              type: JSONSchemaDataType.STRING,
            },
          },
        },
      };

      const result = jsonSchemaService.getTableJSONSchema(
        TableName.USER,
        COLUMNS,
        [],
      );

      expect(result).toEqual(JSON_SCHEMA);
    });

    it('Should return valid JSON Schema for columns with set type', async () => {
      const COLUMNS = [
        {
          tableName: TableName.USER,
          columnName: ColumnName.SCHEDULE,
          type: CQLTypeParser.getNestedType(CQLDataType.SET, [
            CQLDataType.DATE,
          ]),
        },
      ].map(DatabaseColumn.initialize);

      const JSON_SCHEMA = {
        $schema: JSONSchemaService.JSON_SCHEMA_DIALECT,
        title: TableName.USER,
        type: JSONSchemaDataType.OBJECT,
        properties: {
          [ColumnName.SCHEDULE]: {
            type: JSONSchemaDataType.ARRAY,
            items: {
              type: JSONSchemaDataType.STRING,
            },
            uniqueItems: true,
          },
        },
      };

      const result = jsonSchemaService.getTableJSONSchema(
        TableName.USER,
        COLUMNS,
        [],
      );

      expect(result).toEqual(JSON_SCHEMA);
    });

    it('Should return valid JSON Schema for columns with tuple type', async () => {
      const COLUMNS = [
        {
          tableName: TableName.USER,
          columnName: ColumnName.SCHEDULE,
          type: CQLTypeParser.getNestedType(CQLDataType.TUPLE, [
            CQLDataType.DATE,
            CQLDataType.INT,
          ]),
        },
      ].map(DatabaseColumn.initialize);

      const JSON_SCHEMA = {
        $schema: JSONSchemaService.JSON_SCHEMA_DIALECT,
        title: TableName.USER,
        type: JSONSchemaDataType.OBJECT,
        properties: {
          [ColumnName.SCHEDULE]: {
            type: JSONSchemaDataType.ARRAY,
            items: [
              {
                type: JSONSchemaDataType.STRING,
              },
              {
                type: JSONSchemaDataType.NUMBER,
              },
            ],
          },
        },
      };

      const result = jsonSchemaService.getTableJSONSchema(
        TableName.USER,
        COLUMNS,
        [],
      );

      expect(result).toEqual(JSON_SCHEMA);
    });

    it('Should return valid JSON Schema for columns with udt type', async () => {
      const COLUMNS = [
        {
          tableName: TableName.USER,
          columnName: ColumnName.ADDRESS,
          type: UDTName.ADDRESS,
        },
      ].map(DatabaseColumn.initialize);
      const UDTS = [
        {
          typeName: UDTName.ADDRESS,
          fieldNames: [
            UDTFieldName.CITY,
            UDTFieldName.STREET,
            UDTFieldName.HOUSE,
          ],
          fieldTypes: [CQLDataType.TEXT, CQLDataType.TEXT, CQLDataType.INT],
        },
      ].map(UserDefinedType.initialize);

      const JSON_SCHEMA = {
        $schema: JSONSchemaService.JSON_SCHEMA_DIALECT,
        title: TableName.USER,
        type: JSONSchemaDataType.OBJECT,
        properties: {
          address: {
            type: JSONSchemaDataType.OBJECT,
            properties: {
              [UDTFieldName.CITY]: {
                type: JSONSchemaDataType.STRING,
              },
              [UDTFieldName.STREET]: {
                type: JSONSchemaDataType.STRING,
              },
              [UDTFieldName.HOUSE]: {
                type: JSONSchemaDataType.NUMBER,
              },
            },
          },
        },
      };

      const result = jsonSchemaService.getTableJSONSchema(
        TableName.USER,
        COLUMNS,
        UDTS,
      );

      expect(result).toEqual(JSON_SCHEMA);
    });

    it('Should return valid JSON Schema for columns with nested type', async () => {
      const COLUMNS = [
        {
          tableName: TableName.USER,
          columnName: ColumnName.SCHEDULE,
          type: CQLTypeParser.getNestedType(CQLDataType.TUPLE, [
            CQLDataType.DATE,
            CQLTypeParser.getNestedType(CQLDataType.TUPLE, [
              CQLDataType.TEXT,
              CQLDataType.DOUBLE,
            ]),
          ]),
        },
      ].map(DatabaseColumn.initialize);

      const JSON_SCHEMA = {
        $schema: JSONSchemaService.JSON_SCHEMA_DIALECT,
        title: TableName.USER,
        type: JSONSchemaDataType.OBJECT,
        properties: {
          [ColumnName.SCHEDULE]: {
            type: JSONSchemaDataType.ARRAY,
            items: [
              {
                type: JSONSchemaDataType.STRING,
              },
              {
                type: JSONSchemaDataType.ARRAY,
                items: [
                  {
                    type: JSONSchemaDataType.STRING,
                  },
                  {
                    type: JSONSchemaDataType.NUMBER,
                  },
                ],
              },
            ],
          },
        },
      };

      const result = jsonSchemaService.getTableJSONSchema(
        TableName.USER,
        COLUMNS,
        [],
      );

      expect(result).toEqual(JSON_SCHEMA);
    });
  });
});
