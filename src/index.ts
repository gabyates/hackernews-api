/* Core */
import { join } from 'path';
import { createServer } from 'http';
import dotenv from 'dotenv';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
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
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app });

    const { host, port, protocol } = getUrlParts();

    httpServer.listen({ port, host: '0.0.0.0' }, () => {
        const wsServer = new ws.Server({
            server: httpServer,
            path:   apolloServer.graphqlPath,
            host:   '0.0.0.0',
        });

        useServer(
            {
                schema,
                context(ctx) {
                    const userId = getUserId(
                        ctx.connectionParams?.Authorization as string,
                    );

                    const subCtx = { pubsub, prisma, userId };

                    return subCtx;
                },
                onConnect: () => {
                    console.log(
                        chalk.yellow('∞'),
                        chalk.white('Subscription server'),
                        `${chalk.greenBright('connected')}`,
                    );
                },
                onSubscribe: (_, msg) => {
                    console.log(
                        chalk.yellow('∞'),
                        chalk.white('Subscribed to'),
                        `${chalk.redBright(msg.payload.operationName)}`,
                    );
                },
                onError: (_, msg, errors) => {
                    console.error(
                        chalk.yellow('∞'),
                        chalk.red('Subscription Error'),
                        { msg, errors },
                    );
                },
                onComplete: (_, operation) => {
                    console.log(
                        chalk.yellow('∞'),
                        chalk.white('Subscription'),
                        chalk.blueBright(operation.id),
                        chalk.greenBright(operation.type),
                    );
                },
            },
            wsServer,
        );

        console.log(
            chalk.cyanBright(
                `🚀 HTTP server ready at ${chalk.blueBright(
                    `${protocol.http}://${host}:${port}${apolloServer.graphqlPath}`,
                )}`,
            ),
        );
        console.log(
            chalk.cyanBright(
                `📲 Subscription server ready at ${chalk.blueBright(
                    `${protocol.ws}://${host}:${port}${apolloServer.graphqlPath}`,
                )}`,
            ),
        );
    });
})();

/* Helpers */
function getUrlParts() {
    /* eslint-disable-next-line prefer-destructuring */
    const port = Number(process.env.PORT);
    const isProd = process.env.NODE_ENV === 'production';
    const protocol = {
        http: isProd ? 'https' : 'http',
        ws:   isProd ? 'wss' : 'ws',
    };
    const host = isProd
        ? 'hackernews-api-production.up.railway.app'
        : 'localhost';

    return { port, protocol, host };
}
