/* Core */
import { join } from 'path';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { execute, subscribe } from 'graphql';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PrismaClient } from '@prisma/client';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { PubSub } from 'graphql-subscriptions';

/* Instruments */
import { ExpressCtx } from './types';
import { resolvers } from './resolvers';
import { getUserId } from './utils';

dotenv.config({ path: join(__dirname, '../.env.development.local') });

const prisma = new PrismaClient();

const typeDefs = loadSchemaSync(join(__dirname, './graphql/schema.graphql'), {
    loaders: [ new GraphQLFileLoader() ],
}) as unknown as string;
const schema = makeExecutableSchema({ typeDefs, resolvers });

export const pubsub = new PubSub();

(async () => {
    const app = express();
    const httpServer = createServer(app);

    const apolloServer = new ApolloServer({
        schema,
        context: (expressCtx: ExpressCtx) => {
            const { req } = expressCtx;

            return {
                req,
                pubsub,
                prisma,
                userId: getUserId(req.headers.authorization),
            };
        },
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            subscriptionServer.close();
                        },
                    };
                },
            },
        ],
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app });

    const subscriptionServer = SubscriptionServer.create(
        {
            schema,
            execute,
            subscribe,
            onConnect(connectionParams: { Authorization: string }) {
                const subscriptionsCtx = {
                    pubsub,
                    prisma,
                    userId: getUserId(null, connectionParams.Authorization),
                };

                return subscriptionsCtx;
            },
        },
        { server: httpServer, path: apolloServer.graphqlPath },
    );

    const { PORT } = process.env;

    await new Promise<void>(resolve => httpServer.listen({ port: PORT }, resolve));

    console.log(
        `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`,
    );
    console.log(
        `🚀 Subscription endpoint ready at ws://localhost:${PORT}${apolloServer.graphqlPath}`,
    );
})();
