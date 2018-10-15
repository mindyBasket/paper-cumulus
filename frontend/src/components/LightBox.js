import React, { Component } from "react";
import ReactDOM from "react-dom";



                                         

var lightBox_publicFunctions = {

	setState_LightBox: function(newState){
		this.setState(newState);
	},
	pub_LightBox_on: function(){
		console.log("[LightBox] on");
		this.setState({active: true});
	},
	pub_LightBox_off: function(){
		console.log("[LightBox] off");
		//this.setState({active: false});
		// Closing lightbox is more involved then opening it. 
		// So call the function that you use when clicking on it

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
		}
	}




	handle_click(){
		console.log("lightbox clicked");

		// Clicking on the lightbox is currently set to "CANCEL EVERYTHING".
		// Therefore close everything and hide everything. 

		// A. make itself disappear
		this.setState({active: false}); 

		// B. Undo any spotlight [spotlighting is done by setting z-index on component]
		this.props.setParentState({spotlightedAll: false}); 
		// note: this does overrides individual 

		// TODO: any other default behaviors? Modals perhaps? 

		// D. Individualized additional behavior added by sibling comps.
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
			 	 onDragOver={(e)=>(this.props.handle_dragAndDrop(true))}
                 onDragLeave={(e)=>(this.props.handle_dragAndDrop(false))}
                 onDrop={(e)=>(this.props.handle_dragAndDrop(false))}
				 ref={this.$node}>
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
