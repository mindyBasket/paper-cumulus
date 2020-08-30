import * as React from "react";
import * as ReactDOM from "react-dom";
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';



import { Hello } from "./components/Hello";

// 2
// const httpLink = createHttpLink({
//   uri: 
// })


// 3
const client = new ApolloClient({
  uri: 'http://localhost:8000/grphi/',
  cache: new InMemoryCache()
});

const entryElem = document.getElementById("react_entry");

if (entryElem) {
  ReactDOM.render(
    <ApolloProvider client={client}>    
      <Hello compiler="TypeScript" framework="React" />
    </ApolloProvider>,
        document.getElementById("react_entry")
    );   
} else {
    console.error("Could not find entry point to render");
}

// 4
// serviceWorker.unregister(); // not sure what this is