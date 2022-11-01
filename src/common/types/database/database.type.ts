import { Client } from 'cassandra-driver';

type Database = InstanceType<typeof Client>;

export { type Database };
