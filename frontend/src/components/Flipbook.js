import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import DataFeeder from "./DataFeeder";
import key from "weak-key";


const Table = ({ data }) =>
  !data || !data.length ? (
    <p>Nothing to show</p>
  ) : (
    <div className="container scene">
      <h3>
        <strong>{data.length} Scenes</strong>
      </h3>
      
      <ul className="list_scenes">
        {Object.entries(data).map(el_scene => ( 

          <li className="scene_container" key={key(el_scene)}>
    
            {Object.entries(el_scene[1]).map(scene_prop => (
              JSON.stringify(scene_prop[1])
              )
            )}

          </li>
        )) // end map of each scene element
        }
      </ul>
    </div>

  );
Table.propTypes = {
  data: PropTypes.array.isRequired
};




class Curtain extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
  };
  state = {
      open: "TRUE"
    };

  componentDidMount() {
   
  }
  render() {
    return (
      <p>{this.state.open}</p>
    )
  }
}


  




const Flipbook = () => (
  <Curtain color="black"/>
);

// render flipbook
const wrapper = document.getElementById("flip");
wrapper ? ReactDOM.render(<Flipbook />, wrapper) : null;


