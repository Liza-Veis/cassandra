import { CQLDataType } from '~/common/enums/enums';

class CQLTypeParser {
  private static TYPE_SEPARATOR = ', ';

  public static isList(type: string): boolean {
    const regexp = CQLTypeParser.getNestedTypeRegExp(CQLDataType.LIST);

    return regexp.test(type);
  }

  public static isSet(type: string): boolean {
    const regexp = CQLTypeParser.getNestedTypeRegExp(CQLDataType.SET);

    return regexp.test(type);
  }

  public static isMap(type: string): boolean {
    const regexp = CQLTypeParser.getNestedTypeRegExp(CQLDataType.MAP);

    return regexp.test(type);
  }

  public static isTuple(type: string): boolean {
    const regexp = CQLTypeParser.getNestedTypeRegExp(CQLDataType.TUPLE);

    return regexp.test(type);
  }

  public static getNestedType(
    type: string,
    outerType: Exclude<CQLDataType, CQLDataType.MAP | CQLDataType.TUPLE>,
  ): string {
    const regexp = CQLTypeParser.getNestedTypeRegExp(outerType);
    const nestedType = type.replace(regexp, '$1');

    if (!type.match(regexp)) {
      return type;
    }

    return nestedType;
  }

  public static getNestedMultipleTypes(
    type: string,
    outerType: CQLDataType.MAP | CQLDataType.TUPLE,
  ): string[] {
    const regexp = CQLTypeParser.getNestedTypeRegExp(outerType);
    const nestedType = type.replace(regexp, '$1');

    if (!type.match(regexp)) {
      return [type];
    }

    return nestedType.split(CQLTypeParser.TYPE_SEPARATOR);
  }

  private static getNestedTypeRegExp(type: CQLDataType): RegExp {
    return new RegExp(`^${type}<([^\\][]+)>`);
  }
}

export { CQLTypeParser };
