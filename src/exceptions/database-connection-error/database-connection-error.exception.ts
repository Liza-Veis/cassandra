import { ExceptionName } from '~/common/enums/enums';

const DEFAULT_ERROR_MESSAGE = 'Failed to connect to database';

type Constructor = {
  message?: string;
};

class DatabaseConnectionError extends Error {
  public constructor({ message = DEFAULT_ERROR_MESSAGE }: Constructor = {}) {
    super(message);

    this.message = message;
    this.name = ExceptionName.DATABASE_CONNECTION_ERROR;
  }
}

export { DatabaseConnectionError };
