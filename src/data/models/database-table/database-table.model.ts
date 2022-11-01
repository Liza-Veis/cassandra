type Constructor = {
  name: string;
};

type InitializeArgs = {
  name: string;
};

class DatabaseTable {
  public name: string;

  private constructor({ name }: Constructor) {
    this.name = name;
  }

  public static initialize({ name }: InitializeArgs): DatabaseTable {
    return new DatabaseTable({
      name,
    });
  }
}

export { DatabaseTable };
