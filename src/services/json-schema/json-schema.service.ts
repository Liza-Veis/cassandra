import { CQLDataType, JSONSchemaDataType } from '~/common/enums/enums';
import { DatabaseColumn, UserDefinedType } from '~/data/models/models';
import { CQLTypeParser } from '~/utils/utils';

class JSONSchema {
  public static JSON_SCHEMA_DIALECT = 'http://json-schema.org/draft-04/schema#';

  private static JSON_SCHEMA_SPACE = '  ';

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

    // TODO if type blob or map throw warning

    const cqlDataTypeMap = {
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

    if (pureType in cqlDataTypeMap) {
      const type = cqlDataTypeMap[pureType as keyof typeof cqlDataTypeMap];

      return { type };
    }

    if (CQLTypeParser.isList(pureType)) {
      const type = CQLTypeParser.getNestedType(pureType, CQLDataType.LIST);

      return {
        type: JSONSchemaDataType.ARRAY,
        items: this.getCQLTypeJSONSchema(type, udts),
      };
    }

    if (CQLTypeParser.isSet(pureType)) {
      const type = CQLTypeParser.getNestedType(pureType, CQLDataType.SET);

      return {
        type: JSONSchemaDataType.ARRAY,
        items: this.getCQLTypeJSONSchema(type, udts),
        uniqueItems: true,
      };
    }

    if (CQLTypeParser.isMap(pureType)) {
      const [_keyType, valueType] = CQLTypeParser.getNestedMultipleTypes(
        pureType,
        CQLDataType.MAP,
      );

      return {
        type: JSONSchemaDataType.OBJECT,
        additionalProperties: this.getCQLTypeJSONSchema(valueType, udts),
      };
    }

    if (CQLTypeParser.isTuple(pureType)) {
      const types = CQLTypeParser.getNestedMultipleTypes(
        pureType,
        CQLDataType.TUPLE,
      );

      return {
        type: JSONSchemaDataType.ARRAY,
        items: types.map((type) => this.getCQLTypeJSONSchema(type, udts)),
      };
    }

    const udt = udts.find(({ name }) => name === pureType);

    // TODO throw warnig if udt is not found
    if (!udt) {
      throw Error();
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
