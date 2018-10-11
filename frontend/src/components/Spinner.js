import React, { Component } from "react";
import ReactDOM from "react-dom";

/* will usually cover the entire component wrapper */
/* Known weakness: the wrapper always have to display:flex */




class Spinner extends Component{
	constructor(props){
		super(props);
		this.parentPreviousCSS = {};
		this.$node = React.createRef();

		this.removeSpinner = this.removeSpinner.bind(this);
	}


 	componentDidMount(){
 		//prep Parent node
 		// Spinner does not look as intended unless parent is
 		// 1. is flex
 		// 2. position: relative
 		// TODO: If you thought of something better? Spinner is waiting for you
 		const parentNode = this.$node.current.parentElement;
 		const cs = getComputedStyle(parentNode)
 		this.parentPreviousCSS = {
 			display: cs.getPropertyValue("display"),
 			position: cs.getPropertyValue("position")
 		}
 		console.log("css extracted: " + JSON.stringify(this.parentPreviousCSS))

 		parentNode.setAttribute("style", "display: flex; position: relative;");

 		// reapply style if specified
 		if (this.props.playgroundStyle) {
 			this.$node.current.setAttribute("style", this.props.playgroundStyle);
 		}

 		if (this.props.spinnerStyle) {
 			this.$node.current.querySelector('.spinner').setAttribute("style", this.props.spinnerStyle);
 		}

 	}

 	componentDidUpdate(prevProps, prevState, snapshot){
 		if (prevProps.spinning && !this.props.spinning && this.$node.current != null){
 			console.log("Stop spinner");

 			//1. stop animation
 			const $spinner = this.$node.current.querySelector(".spinner");
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
				    targets: this.$node.current,
				    opacity: 0,
				    duration: 1000
			  	});
	
			var promise = stopSpinner.finished.then(() => {
				console.log("putting parent back to way it was");
		        //2. put parent at original state
	 			const parentNode = this.$node.current.parentElement;
	 			const cs = this.parentPreviousCSS;
	 			parentNode.setAttribute("style", `display: ${cs.display}; position: ${cs.position};`);

	 			// 	Remove spinner
 				this.removeSpinner();

		    });
 			
 		}
 	}

 	removeSpinner(){
    	// Removes an element from the document
    	var spinnerPlayground = this.$node.current;
    	spinnerPlayground.parentNode.removeChild(spinnerPlayground);

 	}

	render(){
		return (
			<div className={"spinner_playground " + (this.props.float ? "float" : "")} 
				 ref={this.$node}
				 style={{backgroundColor: this.props.bgColor}}>
	        	<div className={'spinner ' + this.props.style} />
	      	</div>
		)
	}
}


export default Spinner;