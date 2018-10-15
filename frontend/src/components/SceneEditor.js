import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import FrameFeeder from "./FrameFeeder";
import SceneCreateForm from "./crud/Form";
import {SceneCardList} from "./crud/Cards";
import {FrameModal} from "./crud/FrameModal";

import { LightBox, lightBox_publicFunctions as lb } from "./LightBox";
import Spinner from "./Spinner";
import key from "weak-key";

// Global param
var T_STEP = 400; //ms
var STANDBY_OPACITY = 0.5

// Static functions

// function _setState_SceneCard(newState){
// 	this.setState(newState);
// }


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





// // ██╗     ██╗ ██████╗ ██╗  ██╗████████╗██████╗  ██████╗ ██╗  ██╗
// // ██║     ██║██╔════╝ ██║  ██║╚══██╔══╝██╔══██╗██╔═══██╗╚██╗██╔╝
// // ██║     ██║██║  ███╗███████║   ██║   ██████╔╝██║   ██║ ╚███╔╝ 
// // ██║     ██║██║   ██║██╔══██║   ██║   ██╔══██╗██║   ██║ ██╔██╗ 
// // ███████╗██║╚██████╔╝██║  ██║   ██║   ██████╔╝╚██████╔╝██╔╝ ██╗
// // ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
                                                              
// // I might move this

// function setState_LightBox(newState){
// 	this.setState(newState);
// }
// function pub_LightBox_on(){
// 	console.log("[LightBox] on");
// 	this.setState({active: true});
// }
// function pub_LightBox_off(){
// 	console.log("[LightBox] off");
// 	this.setState({active: false});
// }
// function pub_LightBox_addToOnClick(func){
// 	this.setState({addToOnClick: func});
// }


// class LightBox extends Component{
// 	constructor(props){
// 		super(props);
// 		//this.$node = document.querySelector("#lightbox_bg"); //lightbox
// 		this.$node = React.createRef();

// 		this.state = {
// 			active: false, // applies z-index:1000;
// 			intangible: false, // appiles pointer-event: none;
// 			isDragAndDrop: false, // response to dragAndDrop behavior, like dragLeave

// 			addToOnClick: null // there is already props for this. Bad? 
// 		}

// 		this.handle_click = this.handle_click.bind(this);

// 		//public function
// 		setState_LightBox = setState_LightBox.bind(this);
// 		pub_LightBox_on = pub_LightBox_on.bind(this);
// 		pub_LightBox_off = pub_LightBox_off.bind(this);
// 		pub_LightBox_addToOnClick = pub_LightBox_addToOnClick.bind(this);
// 	}

// 	componentDidMount(){
// 		//things may be dropped onto LightBox. Expect to be misfire.
// 		this.$node.current.ondrop = e => {
// 			e.preventDefault();
// 		}
// 	}


// 	handle_click(){
// 		console.log("lightbox clicked");

// 		// Clicking on the lightbox is currently set to "CANCEL EVERYTHING".
// 		// Therefore close everything and hide everything. 

// 		// A. make itself disappear
// 		this.setState({active: false}); 

// 		// B. Undo any spotlight [spotlighting is done by setting z-index on component]
// 		this.props.setParentState({spotlightedAll: false}); 
// 		// note: this does not override individual 

// 		// TODO: any other default behaviors? Modals perhaps? 

// 		// D. Individualized additional behavior added by sibling comps.
// 		if (this.state.addToOnClick) {
// 			this.state.addToOnClick();
// 		} else if(this.props.addToOnClick) {
// 			this.props.addToOnClick();
// 		}

// 	}

// 	render(){
// 		return (
// 			<div id="lightbox_bg"
// 				 className={(this.state.intangible ? "intangible" : "") +
// 					 		(this.state.active ? " active" : "")}
// 			 	 onClick={this.handle_click}
// 			 	 onDragOver={(e)=>(this.props.handle_dragAndDrop(true))}
//                  onDragLeave={(e)=>(this.props.handle_dragAndDrop(false))}
//                  onDrop={(e)=>(this.props.handle_dragAndDrop(false))}
// 				 ref={this.$node}>
// 			</div>
// 		)
// 	}

// }






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
		// this.$lb = document.querySelector("#lightbox_bg"); //lightbox
		this.state = {
			mounted: false,

			toSceneCardList: null,
			spotlightedAll: false // lightbox is off by default
		}

		this.setParentState = this.setParentState.bind(this);
		this.handle_dragAndDrop = this.handle_dragAndDrop.bind(this);
		this.setSpotlightAll = this.setSpotlightAll.bind(this);
		this.addTo_LightBoxOnClick = this.addTo_LightBoxOnClick.bind(this);

	}

	componentDidMount(){
		//bind entire body for drag and drop event
		document.querySelector('body').ondragover = e=> {
			e.preventDefault();
			// Note: The entire body will be covered by lightbox cover, which will
			//		 trigger ondragleave event. So make it intangible.
			// Note: Use this only to initiate drag and drop. Body itself 
			// 		 shouldn't be any target. Leave it all to the LightBox. 
			// setState_LightBox({intangible: true});
			this.handle_dragAndDrop(true);
		}
		// document.querySelector('body').ondragleave = e=> {
		// 	e.preventDefault();
		// 	setState_LightBox({intangible: false});
		// 	this.handle_dragAndDrop(false);
		// }
		// document.querySelector('body').ondrop = e => {
		// 	e.preventDefault();
		// 	// exit dragAndDrop
		// 	setState_LightBox({intangible: false});
		// 	this.handle_dragAndDrop(false);
		// }

		// Attempt at solving issue where sibling-comp's function is set
		// as a prop before it bind(this)
		this.setState({mounted: true});
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
            //this.$lb.classList.add('active');
            lb.setState_LightBox({active: true});
        } else {
            this.setState({spotlightedAll: false});
            //this.$lb.classList.remove('active');
            lb.setState_LightBox({active: false})
        }

        
    }

	handle_dragAndDrop(on){
		if (on) { this.setSpotlightAll(true) }
		else { this.setSpotlightAll(false) }
	}


	
	// _______ ______  ______   _____  __   _                             
	// |_____| |     \ |     \ |     | | \  |                             
	// |     | |_____/ |_____/ |_____| |  \_|                             
	                                                                   
	// _______ _     _ __   _ _______ _______ _____  _____  __   _ _______
	// |______ |     | | \  | |          |      |   |     | | \  | |______
	// |       |_____| |  \_| |_____     |    __|__ |_____| |  \_| ______|
	                                                                    
	addTo_LightBoxOnClick(){
		// This function contain snippet of behavior that is to be
		// ADDED to default onClick event when LightBox is clicked.
		this.setSpotlightAll(false);
	}

	render (){
		return (
			<div className="scene_editor" ref={this.$node}>
				
				

				{/* list of strips */}
				<SceneCardList sceneId={this.sceneId}
							   spotlightedAll={this.state.spotlightedAll}
						   	   dataInbox={this.state.toSceneCardList}
						   	   setState_LightBox={ this.state.mounted ? lb.setState_LightBox : null }/>

				<SceneCreateForm endpoint={`/api/scene/${this.state.sceneId}/strip/create/`}
								 setParentState={this.setParentState}/>

				{/* invisible */}
				<LightBox addToOnClick={this.addTo_LightBoxOnClick}
						  handle_dragAndDrop={this.handle_dragAndDrop}
						  setParentState={this.setParentState}/>

				{/* A bit unsure where is the best place to put this */}
	            <FrameModal/>

	    


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




export {
    pub_LightBox_on,
    pub_LightBox_off,
    pub_LightBox_addToOnClick
};
