import { z } from 'zod';

import { DatabaseConfigValidationMessage } from '~/common/enums/enums';

const databaseConfig = z.object({
  host: z.string({
    required_error: DatabaseConfigValidationMessage.HOST_REQUIRED,
    invalid_type_error: DatabaseConfigValidationMessage.HOST_TYPE,
  }),
  port: z.number({
    required_error: DatabaseConfigValidationMessage.PORT_REQUIRED,
    invalid_type_error: DatabaseConfigValidationMessage.PORT_TYPE,
  }),
  user: z.string({
    required_error: DatabaseConfigValidationMessage.USER_REQUIRED,
    invalid_type_error: DatabaseConfigValidationMessage.USER_TYPE,
  }),
  password: z.string({
    required_error: DatabaseConfigValidationMessage.PASSWORD_REQUIRED,
    invalid_type_error: DatabaseConfigValidationMessage.PASSWORD_TYPE,
  }),
});

export { databaseConfig };
