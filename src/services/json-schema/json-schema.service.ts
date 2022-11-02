import {
  CQLDataType,
  NotificationMessage,
  JSONSchemaDataType,
} from '~/common/enums/enums';
import { DatabaseColumn, UserDefinedType } from '~/data/models/models';
import { JSONSchemaError } from '~/exceptions/exceptions';
import { getMessageWithParams } from '~/helpers/helpers';
import { CQLTypeParser, Logger } from '~/utils/utils';

type Constructor = {
  logger: Logger;
};

class JSONSchema {
  private logger: Logger;

  public static JSON_SCHEMA_DIALECT = 'http://json-schema.org/draft-04/schema#';

  private static JSON_SCHEMA_SPACE = '  ';

  private static CQLBaseTypeMap: Record<string, JSONSchemaDataType> = {
    [CQLDataType.ASCII]: JSONSchemaDataType.STRING,
    [CQLDataType.BIGINT]: JSONSchemaDataType.NUMBER,
    [CQLDataType.BLOB]: JSONSchemaDataType.STRING,
    [CQLDataType.BOOLEAN]: JSONSchemaDataType.BOOLEAN,
    [CQLDataType.COUNTER]: JSONSchemaDataType.NUMBER,
    [CQLDataType.DATE]: JSONSchemaDataType.STRING,
    [CQLDataType.DECIMAL]: JSONSchemaDataType.NUMBER,
    [CQLDataType.DOUBLE]: JSONSchemaDataType.NUMBER,
    [CQLDataType.FLOAT]: JSONSchemaDataType.NUMBER,
    [CQLDataType.INET]: JSONSchemaDataType.STRING,
    [CQLDataType.INT]: JSONSchemaDataType.NUMBER,
    [CQLDataType.SMALLINT]: JSONSchemaDataType.NUMBER,
    [CQLDataType.TEXT]: JSONSchemaDataType.STRING,
    [CQLDataType.TIME]: JSONSchemaDataType.STRING,
    [CQLDataType.TIMESTAMP]: JSONSchemaDataType.STRING,
    [CQLDataType.TIMEUUID]: JSONSchemaDataType.STRING,
    [CQLDataType.TINYINT]: JSONSchemaDataType.NUMBER,
    [CQLDataType.UUID]: JSONSchemaDataType.STRING,
    [CQLDataType.VARCHAR]: JSONSchemaDataType.STRING,
    [CQLDataType.VARINT]: JSONSchemaDataType.NUMBER,
  };

  public constructor({ logger }: Constructor) {
    this.logger = logger;
  }

  public getTableJSONSchema(
    name: string,
    columns: DatabaseColumn[],
    udts: UserDefinedType[],
  ): string {
    const properties = columns.reduce((acc, { name, type }) => {
      return {
        ...acc,
        [name]: this.getCQLTypeJSONSchema(type, udts),
      };
    }, {});

    const schema = {
      $schema: JSONSchema.JSON_SCHEMA_DIALECT,
      title: name,
      type: JSONSchemaDataType.OBJECT,
      properties,
    };

    return JSON.stringify(schema, null, JSONSchema.JSON_SCHEMA_SPACE);
  }

  private getCQLTypeJSONSchema(
    cqlType: string,
    udts: UserDefinedType[],
  ): Record<string, unknown> {
    const pureType = CQLTypeParser.getNestedType(cqlType, CQLDataType.FROZEN);

    if (pureType === CQLDataType.BLOB) {
      this.logger.warn(
        getMessageWithParams(
          NotificationMessage.CQL_$TYPE_CANNOT_BE_REPRESENTED,
          {
            type: CQLDataType.BLOB,
          },
        ),
      );
    }

    if (pureType in JSONSchema.CQLBaseTypeMap) {
      const type = JSONSchema.CQLBaseTypeMap[pureType];

      return { type };
    }

    if (CQLTypeParser.isList(pureType)) {
      return this.getListJSONSchema(pureType, udts);
    }

    if (CQLTypeParser.isSet(pureType)) {
      return this.getSetJSONSchema(pureType, udts);
    }

    if (CQLTypeParser.isMap(pureType)) {
      this.logger.warn(
        getMessageWithParams(
          NotificationMessage.CQL_$TYPE_CANNOT_BE_REPRESENTED,
          {
            type: CQLDataType.MAP,
          },
        ),
      );

      return this.getMapJSONSchema(pureType, udts);
    }

    if (CQLTypeParser.isTuple(pureType)) {
      return this.getTupleJSONSchema(pureType, udts);
    }

    return this.getUDTJSONSchema(pureType, udts);
  }

  private getListJSONSchema(
    type: string,
    udts: UserDefinedType[],
  ): Record<string, unknown> {
    const itemType = CQLTypeParser.getNestedType(type, CQLDataType.LIST);

    return {
      type: JSONSchemaDataType.ARRAY,
      items: this.getCQLTypeJSONSchema(itemType, udts),
    };
  }

  private getSetJSONSchema(
    type: string,
    udts: UserDefinedType[],
  ): Record<string, unknown> {
    const itemType = CQLTypeParser.getNestedType(type, CQLDataType.SET);

    return {
      type: JSONSchemaDataType.ARRAY,
      items: this.getCQLTypeJSONSchema(itemType, udts),
      uniqueItems: true,
    };
  }

  private getMapJSONSchema(
    type: string,
    udts: UserDefinedType[],
  ): Record<string, unknown> {
    const [_keyType, valueType] = CQLTypeParser.getNestedMultipleTypes(
      type,
      CQLDataType.MAP,
    );

    return {
      type: JSONSchemaDataType.OBJECT,
      additionalProperties: this.getCQLTypeJSONSchema(valueType, udts),
    };
  }

  private getTupleJSONSchema(
    type: string,
    udts: UserDefinedType[],
  ): Record<string, unknown> {
    const itemTypes = CQLTypeParser.getNestedMultipleTypes(
      type,
      CQLDataType.TUPLE,
    );

    return {
      type: JSONSchemaDataType.ARRAY,
      items: itemTypes.map((type) => this.getCQLTypeJSONSchema(type, udts)),
    };
  }

  private getUDTJSONSchema(
    type: string,
    udts: UserDefinedType[],
  ): Record<string, unknown> {
    const udt = udts.find(({ name }) => name === type);

    if (!udt) {
      throw new JSONSchemaError({
        message: getMessageWithParams(
          NotificationMessage.CQL_$TYPE_WAS_NOT_DEFINED,
          { type },
        ),
      });
    }

    const properties = Object.entries(udt.fields).reduce(
      (acc, [key, value]) => {
        return {
          ...acc,
          [key]: this.getCQLTypeJSONSchema(value, udts),
        };
      },
      {},
    );

    return {
      type: JSONSchemaDataType.OBJECT,
      properties,
    };
  }
}

export { JSONSchema };
