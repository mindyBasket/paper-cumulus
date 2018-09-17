import React from "react";
import ReactDOM from "react-dom";
import DataProvider from "./DataFeeder";
import Table from "./Table";

const App = () => (
  <DataProvider endpoint="api/lead/" 
                render={data => <Table data={data} />} />
);
const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;
