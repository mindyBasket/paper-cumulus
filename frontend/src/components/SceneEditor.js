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
		this.$node = React.createRef();
		// TODO: BAD. $lb is also referenced by each StripCards!
		this.$lb = document.querySelector("#lightbox_bg"); //lightbox
		this.state = {
			toSceneCardList: null,
			spotlightedAll: false // lightbox is off by default
		}

		this.setParentState = this.setParentState.bind(this);
		this.handle_dragAndDrop = this.handle_dragAndDrop.bind(this);
		this.setSpotlightAll = this.setSpotlightAll.bind(this);

	}

	componentDidMount(){
		//bind entire body for drag and drop event
		console.log(document.querySelector('body'));
		document.querySelector('body').ondragover = e=> {
			e.preventDefault();
			this.handle_dragAndDrop(true);
		}
		document.querySelector('body').ondragleave = e=> {
			e.preventDefault();
			// warning: the entire body will be covered by lightbox cover, which will
			//			trigger ondragleave event...
			this.handle_dragAndDrop(false);
		}
		document.querySelector('body').ondrop = e => {
			e.preventDefault();
			// exit dragAndDrop
			this.handle_dragAndDrop(false);
		}
	}

	
	// Function to be used by its children to communicate to parent (this)
	setParentState(newState){
		this.setState(newState);
	}

	setSpotlightAll(on){
        // Set ALL StripCards on spotlight. For individual spotlight, 
        // see each StripCard.
 
        

        if (on){
            this.setState({spotlightedAll: true}); 
            this.$lb.classList.add('active');

            this.$lb.onclick = e => { // Re-bind spotlight off event
            console.log("lightbox clicked");
	        this.setSpotlightAll(false);
	    }
        } else {
            this.setState({spotlightedAll: false});
            this.$lb.classList.remove('active');
        }

        
    }

	handle_dragAndDrop(on){
		if (on) { this.setSpotlightAll(true) }
		else { this.setSpotlightAll(false) }
	}


	render (){
		return (
			<div className="scene_editor" ref={this.$node}>
				
				<SceneCreateForm endpoint={`/api/scene/${this.state.sceneId}/strip/create/`}
								 setParentState={this.setParentState}/>

				{/* list of strips */}
				<SceneCardList sceneId={this.sceneId}
							   spotlightedAll={this.state.spotlightedAll}
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
