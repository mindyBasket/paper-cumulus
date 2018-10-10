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


// Static function 
// This function is accessed by another element. Triggered externally, but effects the Curtain.
// https://www.codeproject.com/Tips/1215984/Update-State-of-a-Component-from-Another-in-React
function updateCurtain(text){
  this.setState({msg: text});
  this.expandCurtain();
}


class Curtain extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
  };

  constructor(props){
    super(props);
    this.state = {
      msg: "...nothing playing",
      opened: false

    };
    this.node_curtain; //don't define it here, nothing's rendered

    // bind to external function
    updateCurtain = updateCurtain.bind(this);
  }
  
  findNodes(){
    // Finds its DOM nodes after it is mounted.
    // TODO: pretty sure there is a better way than this.
    //       Investigate how others implement animation with React Comps
    this.node_curtain = document.querySelector("#curtain");
    console.log("findNode done");
  }

  expandCurtain(){
    // lock scroll


    // visibility
    // ref: https://codepen.io/Shokeen/pen/QgEyLa
    var curtain = anime({
      targets: this.node_curtain,
      scale: 30,
      easing: 'easeInCubic',
      duration: 300
    });

  }

  componentDidMount() {
    this.findNodes();


    // need to bind clicks onto the scene buttons. can you do that?

    // TODO: below is bad method to give each scene to call a function upon click. 
    //       They should really be a react component.
    const buttonList = document.querySelectorAll('.flipbook-btn');

    for(let i=0; i<buttonList.length; i++){
      // bind function to each of the button 
      buttonList[i].onclick = () => {
        updateCurtain("play " + buttonList[i].getAttribute("id"));
      };


    }
  }
  render() {
    return (
      <div>
        {this.state.msg}
        <div id="curtain"></div>
      </div>
      
    )
  }
}


const Flipbook = () => (
  <Curtain color="black"/>
);

// render flipbook
const wrapper = document.getElementById("flipbook");
wrapper ? ReactDOM.render(<Flipbook />, wrapper) : null;


