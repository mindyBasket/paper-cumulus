import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";




// ██╗     ██╗ ██████╗ ██╗  ██╗████████╗██████╗  ██████╗ ██╗  ██╗
// ██║     ██║██╔════╝ ██║  ██║╚══██╔══╝██╔══██╗██╔═══██╗╚██╗██╔╝
// ██║     ██║██║  ███╗███████║   ██║   ██████╔╝██║   ██║ ╚███╔╝ 
// ██║     ██║██║   ██║██╔══██║   ██║   ██╔══██╗██║   ██║ ██╔██╗ 
// ███████╗██║╚██████╔╝██║  ██║   ██║   ██████╔╝╚██████╔╝██╔╝ ██╗
// ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
                                                              
// I might move this

function setState_LightBox(newState){
	console.warn("Attempt setState LightBox (module)");
	//console.warn(this);
	this.setState(newState);
}

class LightBox extends Component{
	constructor(props){
		super(props);
		//this.$node = document.querySelector("#lightbox_bg"); //lightbox
		this.$node = React.createRef();

		this.state = {
			active: false, // applies z-index:1000;
			intangible: false // appiles pointer-event: none;
		}

		this.handle_click = this.handle_click.bind(this);

		//public function
		setState_LightBox = setState_LightBox.bind(this);

	}

	componentDidMount(){
		//things may be dropped onto LightBox. Expect to be misfire.
		this.$node.current.ondrop = e => {
			e.preventDefault();
		}
	}

	handle_click(){
		// this function may be modified by others. But how do I do that? 
		console.log("lightbox clicked");
		// also, most likely it will become inactive/hidden
		this.setState({active: false});

		// There may be additional behavior required by other components
		this.props.addToOnClick();
	}

	render(){
		return (
			<div id="lightbox_bg"
				 className={(this.state.intangible ? "intangible" : "") +
					 		(this.state.active ? " active" : "")}
			 	 onClick={this.handle_click}
				 ref={this.$node}>
			</div>
		)
	}

}


export {
    LightBox,
    setState_LightBox
};
