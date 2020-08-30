// import { gql } from '@apollo/client'; 
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: any;
};

export type Query = {
  __typename?: 'Query';
  /** The ID of the object */
  flipbook?: Maybe<FlipbookNode>;
  allFlipbooks?: Maybe<FlipbookNodeConnection>;
  /** The ID of the object */
  series?: Maybe<SeriesNode>;
  allSeriess?: Maybe<SeriesNodeConnection>;
};


export type QueryFlipbookArgs = {
  id: Scalars['ID'];
};


export type QueryAllFlipbooksArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  id64?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  title_Icontains?: Maybe<Scalars['String']>;
  title_Istartswith?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  description_Icontains?: Maybe<Scalars['String']>;
  series_Title?: Maybe<Scalars['String']>;
  series_Title_Icontains?: Maybe<Scalars['String']>;
};


export type QuerySeriesArgs = {
  id: Scalars['ID'];
};


export type QueryAllSeriessArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
};

export type FlipbookNode = Node & {
  __typename?: 'FlipbookNode';
  /** The ID of the object. */
  id: Scalars['ID'];
  id64: Scalars['String'];
  title: Scalars['String'];
  description: Scalars['String'];
  series?: Maybe<SeriesNode>;
  dateCreated: Scalars['DateTime'];
  dateModified: Scalars['DateTime'];
  pk?: Maybe<Scalars['Int']>;
};

/** An object with an ID */
export type Node = {
  /** The ID of the object. */
  id: Scalars['ID'];
};

export type SeriesNode = Node & {
  __typename?: 'SeriesNode';
  /** The ID of the object. */
  id: Scalars['ID'];
  title: Scalars['String'];
  slug: Scalars['String'];
  isDemo: Scalars['Boolean'];
  dateCreated: Scalars['DateTime'];
  dateModified: Scalars['DateTime'];
  flipbookSet: FlipbookNodeConnection;
  pk?: Maybe<Scalars['Int']>;
};


export type SeriesNodeFlipbookSetArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  id64?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  title_Icontains?: Maybe<Scalars['String']>;
  title_Istartswith?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  description_Icontains?: Maybe<Scalars['String']>;
  series_Title?: Maybe<Scalars['String']>;
  series_Title_Icontains?: Maybe<Scalars['String']>;
};


export type FlipbookNodeConnection = {
  __typename?: 'FlipbookNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<FlipbookNodeEdge>>;
};

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
};

/** A Relay edge containing a `FlipbookNode` and its cursor. */
export type FlipbookNodeEdge = {
  __typename?: 'FlipbookNodeEdge';
  /** The item at the end of the edge */
  node?: Maybe<FlipbookNode>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
};

export type SeriesNodeConnection = {
  __typename?: 'SeriesNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<SeriesNodeEdge>>;
};

/** A Relay edge containing a `SeriesNode` and its cursor. */
export type SeriesNodeEdge = {
  __typename?: 'SeriesNodeEdge';
  /** The item at the end of the edge */
  node?: Maybe<SeriesNode>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createFlipbook?: Maybe<CreateFlipbookPayload>;
  updateFlipbook?: Maybe<UpdateFlipbookPayload>;
  deleteFlipbook?: Maybe<DeleteFlipbookPayload>;
};


export type MutationCreateFlipbookArgs = {
  input: CreateFlipbookInput;
};


export type MutationUpdateFlipbookArgs = {
  input: UpdateFlipbookInput;
};


export type MutationDeleteFlipbookArgs = {
  input: DeleteFlipbookInput;
};

export type CreateFlipbookPayload = {
  __typename?: 'CreateFlipbookPayload';
  flipbook?: Maybe<FlipbookNode>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateFlipbookInput = {
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  seriesId?: Maybe<Scalars['Int']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateFlipbookPayload = {
  __typename?: 'UpdateFlipbookPayload';
  flipbook?: Maybe<FlipbookNode>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateFlipbookInput = {
  pk: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteFlipbookPayload = {
  __typename?: 'DeleteFlipbookPayload';
  response?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteFlipbookInput = {
  gid: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};
