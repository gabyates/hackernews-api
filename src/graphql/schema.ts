/* Core */
import { join } from 'path';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { makeExecutableSchema } from '@graphql-tools/schema';

/* Instruments */
import { resolvers } from '../resolvers';

const typeDefs = loadSchemaSync(join(__dirname, './schema.graphql'), {
    loaders: [ new GraphQLFileLoader() ],
}) as unknown as string;
export const schema = makeExecutableSchema({ typeDefs, resolvers });
