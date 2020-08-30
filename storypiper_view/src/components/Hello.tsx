import * as React from "react";
// import gql from 'graphql-tag';
import { useQuery, gql } from '@apollo/client';
import renamedUtilFunction from "@Storypiper/utils/testUtils";
import * as FlipbookTypes from '@Storypiper/types/graphql';

// import { gql, useQuery } from '@apollo/client';
// import { LaunchTile, Header, Button, Loading } from '../components';
// import { RouteComponentProps } from '@reach/router';

// ref: https://www.apollographql.com/docs/react/data/queries/

// TODO: this is relay query. I am not using relay anymore. Come 
//       back to this after you've un-relay'd your server side.
const FLIPBOOKS_QUERY = gql`
query {
  allFlipbooks {
    edges {
      node {
        id
        pk
        id64
        title
        description
        series {
          id
        }
      }
    }
  }
}`;


interface HelloProps { compiler: string; framework: string; }

export const Hello = (props: HelloProps) => {
  const {
    data,
    loading,
    error
  } = useQuery(FLIPBOOKS_QUERY);


  if(loading) {
    return (<div>Loading...</div>);
  }
  if(error || !data) {
    return (<div>Error...</div>);
  }

  console.log(data);

  const storypipers = data.allFlipbooks.edges;

  return (
    <div>
      <h1>Hello from {props.compiler} and {props.framework}!</h1>
      <p>
        {renamedUtilFunction("Lucas")}
      </p>
      <p>
        This is where I will attempt to query data using graphQL and make it display on front end
      </p>
      <ol>
        {storypipers.map((storypiper: FlipbookTypes.FlipbookNodeEdge) => (
          <li>
            {`ID: ${storypiper.node.id} [id64: ${storypiper.node.id64}, title: ${storypiper.node.title}]`}
          </li>
        ))}
      </ol>
    </div>
  );
}
