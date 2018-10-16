import React, { Component } from "react";
import ReactDOM from "react-dom";



                                        
var lightBox_publicFunctions = {

	setState_LightBox: function(newState){
		this.setState(newState);
	},
	pub_LightBox_on: function(){
		this.setState({active: true});
	},
	pub_LightBox_off: function(){
		this.handle_click();
	},

	pub_LightBox_addToOnClick: function(func){
		this.setState({addToOnClick: func});
	}

}

// alias
const lb = lightBox_publicFunctions








// ██╗     ██╗ ██████╗ ██╗  ██╗████████╗██████╗  ██████╗ ██╗  ██╗
// ██║     ██║██╔════╝ ██║  ██║╚══██╔══╝██╔══██╗██╔═══██╗╚██╗██╔╝
// ██║     ██║██║  ███╗███████║   ██║   ██████╔╝██║   ██║ ╚███╔╝ 
// ██║     ██║██║   ██║██╔══██║   ██║   ██╔══██╗██║   ██║ ██╔██╗ 
// ███████╗██║╚██████╔╝██║  ██║   ██║   ██████╔╝╚██████╔╝██╔╝ ██╗
// ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝  ╚═╝

/*
How to turn LightBox on:
- Use {active: true}

How to turn LightBox off:
- Use {active: false} BUT!! closing is more involved then opening it,
  because it must also close other related elements, or end their states.
- LightBox can be closed by clicking on it, or may be told to close 
  by another component.  
*/

class LightBox extends Component{
	constructor(props){
		super(props);
		//this.$node = document.querySelector("#lightbox_bg"); //lightbox
		this.$node = React.createRef();

		this.state = {
			active: false, // applies z-index:1000;
			intangible: false, // appiles pointer-event: none;
			isDragAndDrop: false, // response to dragAndDrop behavior, like dragLeave

			addToOnClick: null // there is already props for this. Bad? 
		}

		this.handle_click = this.handle_click.bind(this);

		//public function
		lb.setState_LightBox = lb.setState_LightBox.bind(this);
		lb.pub_LightBox_on = lb.pub_LightBox_on.bind(this);
		lb.pub_LightBox_off = lb.pub_LightBox_off.bind(this);
		lb.pub_LightBox_addToOnClick = lb.pub_LightBox_addToOnClick.bind(this);



	}

	componentDidMount(){
		//things may be dropped onto LightBox. Expect to be misfire.
		this.$node.current.ondrop = e => {
			e.preventDefault();
			console.log("DROPPED TO LIGHTBOX");
		}
	}




	handle_click(){
		// Clicking on the lightbox is currently set to "CANCEL EVERYTHING".
		// Therefore close everything and hide everything. 
		console.log("lightbox clicked");

		
		// A. make itself disappear
		this.setState({active: false}); 

		// B. Undo group spotlight [spotlighting is done by setting z-index on component]
		this.props.setParentState({spotlightedAll: false}); 
		// note: this overrides individual 'selfSpotlight'

		// TODO: any other default behaviors? Modals perhaps? 

		// C. Individualized additional behavior added by sibling comps.
		//	  Usually for closing individual modal/callout that is opened.
		if (this.state.addToOnClick) {
			this.state.addToOnClick();
		} else if(this.props.addToOnClick) {
			this.props.addToOnClick(); // only place this is done is SceneEditor
		}

	}

	render(){
		return (
			<div id="lightbox_bg"
				 className={(this.state.intangible ? "intangible" : "") +
					 		(this.state.active ? " active" : "")}
			 	 onClick={this.handle_click}
			 	 ref={this.$node}>
			 	 
			 	 {/* Note: dragAndDrop events disabled for now. May be needed 
			 	 	 again when dragAndDrop behavior is returned to the whole body */}
			 	 {/*onDragOver={(e)=>(this.props.handle_dragAndDrop(true))}
                 onDragLeave={(e)=>(this.props.handle_dragAndDrop(false))}
                 onDrop={(e)=>(this.props.handle_dragAndDrop(false))}*/}
				 
			</div>
		)
	}

}


//export default LightBox;

// Do NAMED export becaues you are exporting multiple things
export {
	LightBox,
	lightBox_publicFunctions
}
