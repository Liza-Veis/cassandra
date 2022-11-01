import { Database } from '~/common/types/types';
import {
  DatabaseColumn,
  DatabaseTable,
  UserDefinedType,
} from '~/data/models/models';

type Constructor = {
  database: Database;
};

class SystemSchema {
  private database: Database;

  private static SYSTEM_KEYSPACE_REGEX = /^system/;

  public constructor({ database }: Constructor) {
    this.database = database;
  }

  public async getTables(): Promise<DatabaseTable[]> {
    const query = 'SELECT table_name, keyspace_name FROM system_schema.tables';

    const result = await this.database.execute(query);

    const nonSystemTables = result.rows.filter(({ keyspace_name }) => {
      return !keyspace_name.match(SystemSchema.SYSTEM_KEYSPACE_REGEX);
    });

    return nonSystemTables.map((row) => {
      return DatabaseTable.initialize({
        name: row.table_name,
      });
    });
  }

  public async getTableColumns(tableName: string): Promise<DatabaseColumn[]> {
    const query = `SELECT table_name, column_name, type FROM system_schema.columns WHERE table_name = '${tableName}' ALLOW FILTERING`;

    const result = await this.database.execute(query);

    return result.rows.map((row) => {
      return DatabaseColumn.initialize({
        tableName: row.table_name,
        columnName: row.column_name,
        type: row.type,
      });
    });
  }

  public async getUserDefinedTypes(): Promise<UserDefinedType[]> {
    const query =
      'SELECT type_name, field_names, field_types FROM system_schema.types';

    const result = await this.database.execute(query);

    return result.rows.map((row) => {
      return UserDefinedType.initialize({
        typeName: row.type_name,
        fieldNames: row.field_names,
        fieldTypes: row.field_types,
      });
    });
  }
}

export { SystemSchema };
