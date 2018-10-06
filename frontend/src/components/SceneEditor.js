import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import FrameFeeder from "./FrameFeeder";
import SceneCreateForm from "./crud/Form";
import {SceneCardList} from "./crud/Cards";


import Spinner from "./Spinner";
import key from "weak-key";

// Global param
var T_STEP = 400; //ms
var STANDBY_OPACITY = 0.5

// Static functions

function _setState_SceneCard(newState){
	this.setState(newState);
}


class MouseClickTracker extends Component{

	constructor(props){
		super(props);

		this.returnCoord = this.returnCoord.bind(this);
	}

	componentDidMount(){
		document.querySelector('body').onclick = (e)=>{
			this.x = e.clientX;
		    this.y = e.clientY;

		    console.log("Clicked at: " + this.x +", " + this.y);
		}

	}

	returnCoord(){
		return {x: this.x, y: this.y}
	}

	render(){return false;}
}

// http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=FrameStage

// ███████╗██████╗ ██╗████████╗ ██████╗ ██████╗ 
// ██╔════╝██╔══██╗██║╚══██╔══╝██╔═══██╗██╔══██╗
// █████╗  ██║  ██║██║   ██║   ██║   ██║██████╔╝
// ██╔══╝  ██║  ██║██║   ██║   ██║   ██║██╔══██╗
// ███████╗██████╔╝██║   ██║   ╚██████╔╝██║  ██║
// ╚══════╝╚═════╝ ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
                                             

class SceneEditor extends Component{

	constructor(props){
		super(props);
		
		this.sceneId = document.querySelector('#ref-content').getAttribute("sceneId"),
		this.state = {
			

			toSceneCardList: null
		}

		this.setParentState = this.setParentState.bind(this);

	}

	// componentDidMount(){

	// }

	// Function to be used by its children to communicate to parent (this)
	setParentState(newState){
		this.setState(newState);
	}



	render (){
		return (
			<div className="scene_editor">
				
				<SceneCreateForm endpoint={`/api/scene/${this.state.sceneId}/strip/create/`}
								 setParentState={this.setParentState}/>

				{/* list of strips */}
				<SceneCardList sceneId={this.sceneId}
						   dataInbox={this.state.toSceneCardList}/>




			</div>


		)
	}

}


// const Flipbook = () => (
//   <Curtain color="black"/>
// );

// render flipbook
const wrapper = document.getElementById("scene_editor_wrapper");

// const refNode = wrapper ? document.getElementById("ref").querySelector("#ref-content") : null;
// const sceneId = wrapper ? refNode.getAttribute("sceneId") : null;
wrapper ? ReactDOM.render(<SceneEditor/>, wrapper) : null;


//get Django context
