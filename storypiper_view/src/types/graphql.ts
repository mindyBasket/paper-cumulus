import { gql } from '@apollo/client';
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
  allFlipbooks?: Maybe<Array<Maybe<FlipbookType>>>;
  allFlipbooksByTitle?: Maybe<Array<Maybe<FlipbookType>>>;
  flipbook?: Maybe<FlipbookType>;
  seriess?: Maybe<Array<Maybe<SeriesType>>>;
};


export type QueryAllFlipbooksArgs = {
  search?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllFlipbooksByTitleArgs = {
  title?: Maybe<Scalars['String']>;
};


export type QueryFlipbookArgs = {
  id?: Maybe<Scalars['Int']>;
  id64?: Maybe<Scalars['String']>;
};

export type FlipbookType = DefaultInterface & {
  __typename?: 'FlipbookType';
  id64: Scalars['String'];
  description: Scalars['String'];
  series?: Maybe<SeriesType>;
  pk: Scalars['ID'];
  title?: Maybe<Scalars['String']>;
};

export type DefaultInterface = {
  pk: Scalars['ID'];
  title?: Maybe<Scalars['String']>;
};

export type SeriesType = DefaultInterface & {
  __typename?: 'SeriesType';
  id: Scalars['ID'];
  title?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  isDemo: Scalars['Boolean'];
  dateCreated: Scalars['DateTime'];
  dateModified: Scalars['DateTime'];
  flipbookSet: Array<FlipbookType>;
  pk: Scalars['ID'];
};


export type Mutation = {
  __typename?: 'Mutation';
  createFlipbook?: Maybe<CreateFlipbook>;
  updateFlipbook?: Maybe<UpdateFlipbook>;
  deleteFlipbook?: Maybe<DeleteFlipbook>;
};


export type MutationCreateFlipbookArgs = {
  inputData: CreateStoryletInput;
};


export type MutationUpdateFlipbookArgs = {
  inputData: UpdateStoryletInput;
};


export type MutationDeleteFlipbookArgs = {
  pk: Scalars['Int'];
};

export type CreateFlipbook = {
  __typename?: 'CreateFlipbook';
  success?: Maybe<Scalars['Boolean']>;
  flipbook?: Maybe<FlipbookType>;
};

export type CreateStoryletInput = {
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  seriesId?: Maybe<Scalars['Int']>;
};

export type UpdateFlipbook = {
  __typename?: 'UpdateFlipbook';
  success?: Maybe<Scalars['Boolean']>;
  flipbook?: Maybe<FlipbookType>;
};

export type UpdateStoryletInput = {
  pk: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  seriesId?: Maybe<Scalars['Int']>;
};

export type DeleteFlipbook = {
  __typename?: 'DeleteFlipbook';
  success?: Maybe<Scalars['Boolean']>;
  flipbook?: Maybe<DeletedFlipbookType>;
};

export type DeletedFlipbookType = {
  __typename?: 'DeletedFlipbookType';
  title?: Maybe<Scalars['String']>;
};
