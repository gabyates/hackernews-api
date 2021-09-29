/* Roots */
import { Query } from './Query';
import { Mutation } from './Mutation';
import { Subscription } from './Subscription';

/* Entities */
import { Post } from './Post';
import { User } from './User';
import { Vote } from './Vote';

export const resolvers = {
    Query,
    Mutation,
    Subscription,
    Post,
    User,
    Vote,
};
