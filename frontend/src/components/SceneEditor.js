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

//DEMOONLY
import { DemoModal,DemoGuideBtn } from "./demo/Demo";

// Global param
var T_STEP = 400; //ms
var STANDBY_OPACITY = 0.5




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
		
		this.sceneId = document.querySelector('#ref-content').getAttribute("sceneId");
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
		// Bind entire body to prevent misfires from opening the file on the browser tab
	
		document.querySelector('body').ondragover = e=> {
			e.preventDefault();
			// Note: it seems I need ondragover in order to preventDefault on ondrop.
			// const $body = document.querySelector('body');
			// if (!$body.className.includes("dark_justcolor")){
			// 	document.querySelector('body').className += " " + "dark_justcolor";
			// }
			
		}
			
		document.querySelector('body').ondrop = e => {
			e.preventDefault();
			console.log("DragAndDrop Misfire: do nothing");

		}

		// temp solution for rendering a condensed version of strip-create button
		// that is outside of React component area (currently on the left sidebar)
		const condSc = document.querySelector("#condensed_strip_create");
		const formParent = document.querySelector("#condensed_sc");
			  formParent.appendChild(condSc);

		// Attempt at solving issue where sibling-comp's function is set
		// as a prop before it bind(this)
		this.setState({mounted: true});
	}

	
	// Function to be used by its children to communicate to parent (this)
	setParentState(newState){
		this.setState(newState);
	}

	setSpotlightAll(on){
        // Set ALL StripCards on spotlight. 
        // For individual spotlight, see each StripCard's 'selfSpotlighted'.
        // Currently, this function is not used. Setting ALL StripCard added
        // needless complications turning spotligh on and off.
 
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
		// Might get rid of this...
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

				{/* temp solution to put a condensed button on the left sidebar */}
				<SceneCreateForm endpoint={`/api/scene/${this.state.sceneId}/strip/create/`}
								 setParentState={this.setParentState}
								 condensed={true}/>

				{/* invisible */}
				<LightBox addToOnClick={this.addTo_LightBoxOnClick}
						  handle_dragAndDrop={this.handle_dragAndDrop}
						  setParentState={this.setParentState}/>

				{/* A bit unsure where is the best place to put this */}
	            <FrameModal/>

	    		{/* DEMOONLY */}
				<DemoGuideBtn onAtMount={true}
							  num={3}
						      proxyId={"#proxy_demoguide"}/>



			</div>


		)
	}

}




// render flipbook
const wrapper = document.getElementById("scene_editor_wrapper");

// const refNode = wrapper ? document.getElementById("ref").querySelector("#ref-content") : null;
// const sceneId = wrapper ? refNode.getAttribute("sceneId") : null;
wrapper ? ReactDOM.render(<SceneEditor/>, wrapper) : null;

console.log("SceneEditor ---- 0.1.3");


export {

};
