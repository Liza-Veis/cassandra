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
    tableName: string,
    columns: DatabaseColumn[],
    udts: UserDefinedType[],
  ): Record<string, unknown> {
    const properties = columns.reduce((acc, { name, type }) => {
      return {
        ...acc,
        [name]: this.getCQLTypeJSONSchema(type, udts),
      };
    }, {});

    return {
      $schema: JSONSchema.JSON_SCHEMA_DIALECT,
      title: tableName,
      type: JSONSchemaDataType.OBJECT,
      properties,
    };
  }

  private getCQLTypeJSONSchema(
    rawCQLDataType: string,
    udts: UserDefinedType[],
  ): Record<string, unknown> {
    let cqlDataType = rawCQLDataType;

    if (CQLTypeParser.checkIsType(cqlDataType, CQLDataType.FROZEN)) {
      [cqlDataType] = CQLTypeParser.getInnerTypes(cqlDataType);
    }

    if (cqlDataType === CQLDataType.BLOB) {
      this.logger.warn(
        getMessageWithParams(
          NotificationMessage.CQL_$TYPE_CANNOT_BE_REPRESENTED,
          {
            type: CQLDataType.BLOB,
          },
        ),
      );
    }

    if (cqlDataType in JSONSchema.CQLBaseTypeMap) {
      const type = JSONSchema.CQLBaseTypeMap[cqlDataType];

      return { type };
    }

    if (CQLTypeParser.checkIsType(cqlDataType, CQLDataType.LIST)) {
      return this.getListJSONSchema(cqlDataType, udts);
    }

    if (CQLTypeParser.checkIsType(cqlDataType, CQLDataType.SET)) {
      return this.getSetJSONSchema(cqlDataType, udts);
    }

    if (CQLTypeParser.checkIsType(cqlDataType, CQLDataType.MAP)) {
      this.logger.warn(
        getMessageWithParams(
          NotificationMessage.CQL_$TYPE_CANNOT_BE_REPRESENTED,
          {
            type: CQLDataType.MAP,
          },
        ),
      );

      return this.getMapJSONSchema(cqlDataType, udts);
    }

    if (CQLTypeParser.checkIsType(cqlDataType, CQLDataType.TUPLE)) {
      return this.getTupleJSONSchema(cqlDataType, udts);
    }

    return this.getUDTJSONSchema(cqlDataType, udts);
  }

  private getListJSONSchema(
    type: string,
    udts: UserDefinedType[],
  ): Record<string, unknown> {
    const [itemType] = CQLTypeParser.getInnerTypes(type);

    return {
      type: JSONSchemaDataType.ARRAY,
      items: this.getCQLTypeJSONSchema(itemType, udts),
    };
  }

  private getSetJSONSchema(
    type: string,
    udts: UserDefinedType[],
  ): Record<string, unknown> {
    const [itemType] = CQLTypeParser.getInnerTypes(type);

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
    const [_keyType, valueType] = CQLTypeParser.getInnerTypes(type);

    return {
      type: JSONSchemaDataType.OBJECT,
      additionalProperties: this.getCQLTypeJSONSchema(valueType, udts),
    };
  }

  private getTupleJSONSchema(
    type: string,
    udts: UserDefinedType[],
  ): Record<string, unknown> {
    const itemTypes = CQLTypeParser.getInnerTypes(type);

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
