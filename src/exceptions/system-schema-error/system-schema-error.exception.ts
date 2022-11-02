import { ExceptionName } from '~/common/enums/enums';

const DEFAULT_ERROR_MESSAGE = 'Failed to export table JSON Schema';

type Constructor = {
  message?: string;
};

class SystemSchemaError extends Error {
  public constructor({ message = DEFAULT_ERROR_MESSAGE }: Constructor = {}) {
    super(message);

    this.message = message;
    this.name = ExceptionName.SYSTEM_SCHEMA_ERROR;
  }
}

export { SystemSchemaError };
