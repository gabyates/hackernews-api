/* Core */
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env.development.local') });

import { createServer } from 'http';
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
import { ServerContext } from './types';
import { resolvers } from './resolvers';
import { getUserId } from './utils';

const prisma = new PrismaClient();

const typeDefs = loadSchemaSync(join(__dirname, './schema.graphql'), {
    loaders: [new GraphQLFileLoader()],
}) as unknown as string;
const schema = makeExecutableSchema({ typeDefs, resolvers });

export const pubsub = new PubSub();

(async () => {
    const app = express();
    const httpServer = createServer(app);

    const apolloServer = new ApolloServer({
        schema,
        context: (expressContext: ServerContext) => {
            const { req } = expressContext;

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

    const PORT = process.env.PORT;

    await new Promise<void>(resolve =>
        httpServer.listen({ port: PORT }, resolve),
    );

    console.log(
        `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`,
    );
    console.log(
        `🚀 Subscription endpoint ready at ws://localhost:${PORT}${apolloServer.graphqlPath}`,
    );
})();
