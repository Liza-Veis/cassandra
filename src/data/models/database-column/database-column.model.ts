type Constructor = {
  name: string;
  type: string;
  tableName: string;
};

type InitializeArgs = {
  tableName: string;
  columnName: string;
  type: string;
};

class DatabaseColumn {
  public name: string;

  public type: string;

  public tableName: string;

  private constructor({ name, type, tableName }: Constructor) {
    this.name = name;
    this.type = type;
    this.tableName = tableName;
  }

  public static initialize({
    tableName,
    columnName,
    type,
  }: InitializeArgs): DatabaseColumn {
    return new DatabaseColumn({
      name: columnName,
      type: type,
      tableName,
    });
  }
}

export { DatabaseColumn };
