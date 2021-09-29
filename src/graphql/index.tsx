export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Maybe<Scalars['String']>;
  user: Maybe<User>;
};

export type Feed = {
  __typename?: 'Feed';
  count: Scalars['Int'];
  links: Array<Link>;
};

export type Link = {
  __typename?: 'Link';
  createdAt: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['ID'];
  postedBy: User;
  url: Scalars['String'];
  votes: Array<Vote>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createLink: Link;
  deleteLink: Scalars['Boolean'];
  login: Maybe<AuthPayload>;
  signup: Maybe<AuthPayload>;
  updateLink: Link;
  vote: Maybe<Vote>;
};


export type MutationCreateLinkArgs = {
  description: Scalars['String'];
  url: Scalars['String'];
};


export type MutationDeleteLinkArgs = {
  id: Scalars['ID'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationSignupArgs = {
  email: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['String'];
};


export type MutationUpdateLinkArgs = {
  description: Scalars['String'];
  id: Scalars['ID'];
  url: Scalars['String'];
};


export type MutationVoteArgs = {
  linkId: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  feed: Feed;
  link: Maybe<Link>;
};


export type QueryFeedArgs = {
  filter: Maybe<Scalars['String']>;
  skip: Maybe<Scalars['Int']>;
  take: Maybe<Scalars['Int']>;
};


export type QueryLinkArgs = {
  id: Scalars['ID'];
};

export enum Sort {
  Asc = 'asc',
  Desc = 'desc'
}

export type Subscription = {
  __typename?: 'Subscription';
  linkCreated: Maybe<Link>;
  linkVoted: Maybe<Vote>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['ID'];
  links: Array<Link>;
  name: Scalars['String'];
};

export type Vote = {
  __typename?: 'Vote';
  id: Scalars['ID'];
  link: Link;
  user: User;
};
