/* Core */
import { join } from 'path';
import { ApolloServer } from 'apollo-server';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { PrismaClient } from '@prisma/client';

/* Instruments */
import { ServerContext } from './types';
import { resolvers } from './resolvers';
import { getUserId } from './utils';

const prisma = new PrismaClient();

const schema = loadSchemaSync(join(__dirname, './schema.graphql'), {
    loaders: [new GraphQLFileLoader()],
}) as unknown as string;

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: (expressContext: ServerContext) => {
        const { req } = expressContext;

        console.log(getUserId(req.headers.authorization));

        return {
            req,
            prisma,
            userId:
                req && req.headers.authorization
                    ? getUserId(req.headers.authorization)
                    : null,
        };
    },
});

server
    .listen()
    .then(({ url }: { url: string }) =>
        console.log(`Server is running on ${url}`),
    );
