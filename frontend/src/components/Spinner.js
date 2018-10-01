import React, { Component } from "react";
import ReactDOM from "react-dom";

/* will usually cover the entire component wrapper */
/* Known weakness: the wrapper always have to display:flex */




class Spinner extends Component{
	constructor(props){
		super(props);
		this.parentPreviousCSS = {};
		this.ref = React.createRef();

		this.removeSpinner = this.removeSpinner.bind(this);
	}


 	componentDidMount(){
 		//prep Parent node
 		// Spinner does not look as intended unless parent is
 		// 1. is flex
 		// 2. position: relative
 		// TODO: If you thought of something better? Spinner is waiting for you
 		const parentNode = this.ref.current.parentElement;
 		const cs = getComputedStyle(parentNode)
 		this.parentPreviousCSS = {
 			display: cs.getPropertyValue("display"),
 			position: cs.getPropertyValue("position")
 		}
 		console.log("css extracted: " + JSON.stringify(this.parentPreviousCSS))

 		parentNode.setAttribute("style", "display: flex; position: relative;");

 	}

 	componentDidUpdate(prevProps, prevState, snapshot){
 		if (prevProps.spinning && !this.props.spinning && this.ref.current != null){
 			console.log("Stop spinner");

 			//1. stop animation
 			const $spinner = this.ref.current.querySelector(".spinner");
 			$spinner.classList.add("dead");

 			var stopSpinner = anime.timeline();
			stopSpinner
				.add({
			   		targets: $spinner,
			        scale: 0,
			        easing: 'easeInCubic',
			        duration: 400
			    })
			    .add({
				    targets: this.ref.current,
				    opacity: 0,
				    duration: 1000
			  	});
	
			var promise = stopSpinner.finished.then(() => {
				console.log("putting parent back to way it was");
		        //2. put parent at original state
	 			const parentNode = this.ref.current.parentElement;
	 			const cs = this.parentPreviousCSS;
	 			parentNode.setAttribute("style", `display: ${cs.display}; position: ${cs.position};`);

	 			// 	Remove spinner
 				this.removeSpinner();

		    });
 			
 			

 		}
 	}

 	removeSpinner(){

    	// Removes an element from the document
    	var spinnerPlayground = this.ref.current;
    	spinnerPlayground.parentNode.removeChild(spinnerPlayground);

 	}

	render(){
		return (
			<div className={"spinner_playground " + (this.props.float ? "float" : "")} 
				 ref={this.ref}
				 style={{backgroundColor: this.props.bgColor}}>
	        	<div className={'spinner ' + this.props.style} />
	      	</div>
		)
	}
}


export default Spinner;