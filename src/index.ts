/* Core */
import { join } from 'path';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { execute, subscribe } from 'graphql';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { PrismaClient } from '@prisma/client';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { PubSub } from 'graphql-subscriptions';
import chalk from 'chalk';

/* Instruments */
import { ExpressCtx } from './types';
import { getUserId } from './utils';
import { schema } from './graphql/schema';

dotenv.config({ path: join(__dirname, '../.env.development.local') });

const prisma = new PrismaClient();
const pubsub = new PubSub();

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

    /* eslint-disable-next-line prefer-destructuring */
    const PORT = process.env.PORT;

    await new Promise<void>(resolve => httpServer.listen({ port: PORT }, resolve));

    console.log(
        chalk.cyanBright(
            `🚀 Server ready at ${chalk.blueBright(
                `http://localhost:${PORT}${apolloServer.graphqlPath}`,
            )}`,
        ),
    );
    console.log(
        chalk.cyanBright(
            `📲 Subscription endpoint ready at ${chalk.blueBright(
                `ws://localhost:${PORT}${apolloServer.graphqlPath}`,
            )}`,
        ),
    );
})();
