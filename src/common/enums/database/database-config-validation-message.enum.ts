enum DatabaseConfigValidationMessage {
  HOST_REQUIRED = 'Host is required',
  HOST_TYPE = 'Host must be of type string',
  PORT_REQUIRED = 'Port is required',
  PORT_TYPE = 'Port must be of type number',
  USER_REQUIRED = 'User is required',
  USER_TYPE = 'User must be of type string',
  PASSWORD_REQUIRED = 'Password is required',
  PASSWORD_TYPE = 'Password must be of type string',
}

export { DatabaseConfigValidationMessage };
