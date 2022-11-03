import { CQLDataType } from '~/common/enums/enums';

class CQLTypeParser {
  private static TYPE_SEPARATOR = ', ';

  public static checkIsType(type: string, typeToCheck: CQLDataType): boolean {
    return type.startsWith(typeToCheck);
  }

  public static getInnerTypes(type: string): string[] {
    return type.replace(/\w+<(.+)>/, '$1').match(/\w+(<.*>)?/g) as string[];
  }

  public static getNestedType(type: CQLDataType, innerType: string[]): string {
    return `${type}<${innerType.join(CQLTypeParser.TYPE_SEPARATOR)}>`;
  }
}

export { CQLTypeParser };
