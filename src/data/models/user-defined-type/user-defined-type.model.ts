type Constructor = {
  name: string;
  fields: Record<string, string>;
};

type InitializeArgs = {
  typeName: string;
  fieldNames: string[];
  fieldTypes: string[];
};

class UserDefinedType {
  public name: string;

  public fields: Record<string, string>;

  public constructor({ name, fields }: Constructor) {
    this.name = name;
    this.fields = fields;
  }

  public static initialize({
    typeName,
    fieldNames,
    fieldTypes,
  }: InitializeArgs): UserDefinedType {
    const fields = fieldNames.reduce((acc, name, i) => {
      return {
        ...acc,
        [name]: fieldTypes[i],
      };
    }, {});

    return new UserDefinedType({
      name: typeName,
      fields,
    });
  }
}

export { UserDefinedType };
