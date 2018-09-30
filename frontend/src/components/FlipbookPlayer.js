import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import FrameFeeder from "./FrameFeeder";
import key from "weak-key";

// Global param
var T_STEP = 400; //ms

// Static functions
// These are used to make components communicate with each other
// function startKeyListener(){
// 	console.warn("FrameFeeder done. start Key listener");
// }

class FrameStage extends Component{

	constructor(props){
		super(props);
		this.data = this.props.data;
		this.currStrip;
		this.frameState = {
			isStripHead: true,
			isPlaying: false
		}
		this.setTimeOutArr = []
		this.state = {
		}

		this.gotoNextAndPlay=this.gotoNextAndPlay.bind(this);
		this.rewind=this.rewind.bind(this);
		this.gotoPrev=this.gotoPrev.bind(this);

		this.playFrame=this.playFrame.bind(this);
		this.stopFrame=this.stopFrame.bind(this);

	}

	// componentWillUpdate(nextProps, nextState){
		// Could be useful
	// }

	componentDidMount(){
		// bind keyboard
		var playNext = this.playNext;

		document.addEventListener('keydown', (event) => {
		    if(event.keyCode == 37) {
		    	this.stopFrame();

		        if(this.frameState.isStripHead){
		        	this.gotoPrev(); //go to previous strip
		        } else {
		        	this.rewind(); //rewind to beginning of strip
		        }
		        //doing either action places you at the head of Strip
		        this.frameState.isStripHead = true;
		    }
		    else if(event.keyCode == 39) {
		    	this.stopFrame();
		    		
		    	this.gotoNextAndPlay();
		    }
		});

		// scroll to first element just in case
		this.currStrip = document.querySelector(".frame_stage .strip.start");
		this.currStrip.scrollIntoView(true);
	}

	gotoNextAndPlay(){

		if (!this.frameState.isStripHead && this.currStrip.nextElementSibling != null){
			console.log(this.currStrip.nextElementSibling.getAttribute("class"));
			//scroll
			this.currStrip = this.currStrip.nextElementSibling;
			this.currStrip.scrollIntoView(true);
		}

		//Enter playing state
		this.frameState.isPlaying = true;
		this.frameState.isStripHead = false;

		//Make time line
		var frameCount = this.currStrip.getAttribute('count');
		for(var i=0;i<frameCount;i++){
			// Add reference to stop it later
          	this.setTimeOutArr.push(
          		setTimeout(this.playFrame.bind(this, i), i*T_STEP)
          	);
		}
	 
	}

	rewind(){
		this.currStrip.scrollIntoView(true);
	}

	gotoPrev(){
		if (this.currStrip.previousElementSibling != null){
			//scroll
			this.currStrip = this.currStrip.previousElementSibling;
			this.currStrip.scrollIntoView(true);
		}
	}


	playFrame(index){
		console.log("Showing frame " + index);

		var targetFrame = this.currStrip.querySelectorAll(".frame")[index];
		if (targetFrame != null) { targetFrame.scrollIntoView(true);}
		else {console.warn("Could not find frame at index " + index)}
	}

	stopFrame(){
		for(var i=0;i<this.setTimeOutArr.length;i++){
            clearTimeout(this.setTimeOutArr[i]);
        }
        
        // Dump array
        // the array only gets new entry in playNext()
        this.setTimeOutArr = new Array();
	}

	render(){
		return ((data) => {
			data = new Array(data); //unify format
			return (
				!data || !data.length ? (
					<p>Nothing to show</p>
				) : (
					<div className="frame_stage">
				 
					 	{/* data.strips is an array of JSON objects */}
						{data[0]['strips'].map((el_strip,index) => (
							<span className={`strip${index==0 ? " start" : ""}`} 
								  id={el_strip.id} 
								  key={key(el_strip)} 
								  count={el_strip.frames.length}>
								{/* TODO: edge case, if el_strip does not have frames */}
								{el_strip.frames.map(el_frame => {
									JSON.stringify(el_frame[1]);
									{/* TODO: edge case there are no frames */}
									return (
										<img src={el_frame.frame_image} className="frame" key={key(el_frame)}/>
									);
								})}
							</span>
						))} {/* end of data.map() */}
							
				
					</div>

				)
			)
		})(this.props.data); 
	}
}


class FlipbookPlayer extends Component{

	constructor(props){
		super(props);

		this.state = {

		}
	}

	render (){
		return (
			<div className="flipbook_player">
				{/* -- fit_block frame_load --*/}
				<div className="frame_window">
					<FrameFeeder endpoint="/api/scene/1/" 
								render={data => <FrameStage data={data} />} />
				</div>

				{/* invisible */}
				

			</div>
		)
	}

}


// const Flipbook = () => (
//   <Curtain color="black"/>
// );

// render flipbook
const wrapper = document.getElementById("letterbox");
wrapper ? ReactDOM.render(<FlipbookPlayer />, wrapper) : null;