/* Core */
import { join } from 'path';
import { createServer } from 'http';
import dotenv from 'dotenv';
import express from 'express';
import session, { type Store } from 'express-session';
import bodyParser from 'body-parser';
import createSQLiteStore from 'connect-sqlite3';
import { ApolloServer } from 'apollo-server-express';
import chalk from 'chalk';

import createPino from 'pino-http';
import createPinoPretty from 'pino-pretty';

/* Instruments */
import { createApolloCtx, getUrlParts } from '@/utils';
import { schema } from '@/graphql/schema';
import { Session } from '@/types';

const pinoPretty = createPinoPretty({ colorize: true, levelFirst: true });
const pino = createPino(pinoPretty);

const IS_PROD = process.env.NODE_ENV === 'production';

dotenv.config({ path: join(__dirname, '../.env.development.local') });

const db = process.env.DATABASE_URL?.replace('file:', '');

const cors = {
    origin: [
        'http://localhost:3000',

        'https://studio.apollographql.com',

        'https://z-hackernews-ui.vercel.app',
    ],
    credentials: true,
};

const SQLiteStore = createSQLiteStore(session);
const jsonParser = bodyParser.json();

(async () => {
    const app = express();
    // app.use(pino);

    // ? 1. Generate and save cookie only on:
    // ?   - login
    // ?   - signup
    // ? 2. Prune cookie on logout
    // ? 3. Choose authentication check strategy

    app.use(
        session({
            // ? Type-asserted due to wrong connect-sqlite3 typing
            store: new SQLiteStore({ table: 'sessions', dir: 'prisma', db }) as Store,

            name:              'session-cookie',
            secret:            'secret',
            resave:            false,
            saveUninitialized: false,

            cookie: {
                maxAge:   1000 * 60 * 60 * 24 * 30, // 30 days
                httpOnly: true,
                secure:   IS_PROD,
                sameSite: IS_PROD ? 'none' : 'lax',
            },
        }),
    );

    const httpServer = createServer(app);

    const apolloServer = new ApolloServer({ schema, context: createApolloCtx });

    await apolloServer.start();

    app.post('/graphql', jsonParser, (req, res, next) => {
        const operationName = req.body?.operationName?.toLowerCase();

        // console.log(chalk.red('session 0', operationName));

        // req.log.info('/graphql');

        // console.log(
        //     chalk.cyan('req.body.variables'),
        //     req.body.variables,
        //     '\n',
        //     chalk.cyan('req.headers.authorization'),
        //     req.headers.authorization?.slice(0, 15),
        //     '\n',
        //     chalk.cyan('req.headers.cookie'),
        //     req.headers.cookie,
        //     '\n',
        //     chalk.cyan('req.sessionID'),
        //     req.sessionID,
        //     '\n',
        //     chalk.cyan('req.session'),
        //     req.session,
        //     '\n',
        //     chalk.cyan('req.headers'),
        //     req.headers,
        //     '\n',
        //     // chalk.cyan('req.body'),
        //     // req.body,
        // );

        if ([ 'authenticate', 'login', 'signup' ].includes(operationName)) {
            console.log(chalk.red('session +', operationName));

            if (operationName === 'login') {
                // const body = req.body;
                // console.log(body);
            }

            if ((req.session as Session).views) {
                (req.session as Session).views++;
            } else {
                (req.session as Session).views = 1;
            }
        } else {
            console.log(chalk.red('session -', operationName));
        }

        next();
    });

    apolloServer.applyMiddleware({ app, cors });

    const { host, port, protocol } = getUrlParts();

    httpServer.listen({ port, host: '0.0.0.0' }, () => {
        console.log(
            chalk.cyanBright(
                `🚀 HTTP server ready at ${chalk.blueBright(
                    `${protocol.http}://${host}:${port}${apolloServer.graphqlPath}`,
                )}`,
            ),
        );
    });
})();
