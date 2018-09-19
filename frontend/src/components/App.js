import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import DataFeeder from "./DataFeeder";
import key from "weak-key";


const Table = ({ data }) =>
  !data || !data.length ? (
    <p>Nothing to show</p>
  ) : (
    <div className="column">
      <h2 className="subtitle">
        Showing <strong>{data.length} items</strong>
      </h2>
      <table className="table is-striped">
        <thead>
          <tr>
            
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(elems_scene => (
            <tr key={key(elems_scene)}>
              <strong>Item</strong>: {JSON.stringify(elems_scene[1])}
            </tr>
          ))
          }


        </tbody>
      </table>
    </div>
  );

  
Table.propTypes = {
  data: PropTypes.array.isRequired
};




const App = () => (
  <DataFeeder endpoint="/api/chapter/1/scene/all/" 
                render={data => <Table data={data} />} />
);
const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;


