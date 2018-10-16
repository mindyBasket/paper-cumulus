import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import FrameFeeder from "./FrameFeeder";
import Spinner from "./Spinner";
import key from "weak-key";

// Custom helpers
import Helper from "./Helper"
const h = new Helper();


// Global param
var T_STEP = 400; //ms
var STANDBY_OPACITY = 0.5

// Static functions
// These are used to make components communicate with each other



function _setState_Scrubber(newState){
	try {
		this.setState(newState);
	} catch(err){
		// console.warn("Scrubber not found.");
	}
	
}

function _setState_FlipbookPlayer(newState){
	try {
		this.setState(newState);
	} catch(err){
		// console.warn("Flipbook Player not found.");
	}
}

var flipbook_publicFunctions = {

	// TODO: move the setState functions in here...
}




function playFrameStage(){
	// BAD!!!: this is binded to only ONE FrameStage. If you want to
	//		   be able to switch from multiple FrameStage, make sure
	//		   you provide Id or something.
	// TODO: I don't think I can utilize this function. Remove any uses. 
	this.setState({playNow: true});
}


// http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=FrameStage

// ███████╗██████╗  █████╗ ███╗   ███╗███████╗███████╗████████╗ █████╗  ██████╗ ███████╗
// ██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔════╝ ██╔════╝
// █████╗  ██████╔╝███████║██╔████╔██║█████╗  ███████╗   ██║   ███████║██║  ███╗█████╗  
// ██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝  ╚════██║   ██║   ██╔══██║██║   ██║██╔══╝  
// ██║     ██║  ██║██║  ██║██║ ╚═╝ ██║███████╗███████║   ██║   ██║  ██║╚██████╔╝███████╗
// ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
                                                                                     

class FrameStage extends Component{

	constructor(props){
		super(props);
		this.data = this.props.data;
		this.currStrip;
		this.$node = React.createRef(); 

		this.frameState = {
			isStripHead: true,
			isPlaying: false
		}

		this.setTimeOutArr = []
		this.state = {
		}

		// props reference
		// this.props.standAlone; // this component can be used by itself without scrubber and timer

		this.gotoNextAndPlay=this.gotoNextAndPlay.bind(this);
		this.rewind=this.rewind.bind(this);
		this.gotoPrev=this.gotoPrev.bind(this);

		this.playFrame=this.playFrame.bind(this);
		this.killSetTimeOut=this.killSetTimeOut.bind(this);

		// public function
		playFrameStage = playFrameStage.bind(this);

	}

	componentDidMount(){
		// scroll to first element just in case
		this.currStrip = this.$node.current.querySelector('.strip.start');
		//this.currStrip.scrollIntoView(true); // This may be unnecessary scrolling

		 if (this.props.standAlone){
		 	// This component can be used by itself. Currently used in
		 	// SceneEditor's preview
		 	this.$node.current.click(); // autoplay

		 } else {
			// bind keyboard
			// TODO: this variable appears to be not being used.
			var playNext = this.playNext;

			document.addEventListener('keydown', (event) => {
			    if(event.keyCode == 37) {
			    	this.killSetTimeOut();

			        if(this.frameState.isStripHead){
			        	this.gotoPrev(); //go to previous strip
			        } else {
			        	this.rewind(); //rewind to beginning of strip
			        }
			        //doing either action places you at the head of Strip
			        this.frameState.isStripHead = true;
			    }
			    else if(event.keyCode == 39) {
			    	this.gotoNextAndPlay();
			    }
			});

			// TODO: this seem like a bad place to initialize the Scrubber.
			//	 	 this pattern is being used because frames are fetched in this component,
			//		 instead of the parent component to pass it down
			_setState_Scrubber({numStrips: this.props.data['strips'].length});

			// Tell parent the frame has been loaded
			// TODO: this is the same problem as above
			_setState_FlipbookPlayer({frameLoaded: true});
		}
	
	}

	componentDidUpdate(prevProps, prevState, snapshot){
		console.log("[UPDATE] FrameStage");

		// Note: Used for SceneEditor's Strip animation previews
		console.log(prevProps.playPreviewNow + " =? " + this.props.playPreviewNow);
		if (prevProps.playPreviewNow != this.props.playPreviewNow){
			const useScrollTop = true;
			this.gotoNextAndPlay(useScrollTop);
		}
	}


	gotoNextAndPlay(useScrollTop){
		// Kill any preexisting animation
		this.killSetTimeOut();

		if (!this.frameState.isStripHead && this.currStrip.nextElementSibling != null ){
			// Go to next Strip
			this.currStrip = this.currStrip.nextElementSibling;

			if (useScrollTop){
				this.$node.current.parentElement.scrollTop = currStrip.offsetTop;
			} else { 
				this.currStrip.scrollIntoView(true);
			}

			// Note: it became a positive feature to replay the last existing strip.
			//		 For now, do not add extra behavior to indicate end of Scene.	 
		}

		//Enter playing state
		this.frameState.isPlaying = true;
		this.frameState.isStripHead = false;

		//Make timeline
		var frameCount = this.currStrip.getAttribute('count');
		for(var i=0;i<frameCount;i++){
			// Add reference to stop it later
          	this.setTimeOutArr.push(
          		setTimeout(this.playFrame.bind(this, i, useScrollTop), i*T_STEP)
          	);
		}


		//update scrubber
		if (!this.props.standAlone){
			_setState_Scrubber({
				numFrames: Number(frameCount),
				currStrip: Number(this.currStrip.getAttribute("index"))
			});
			_setState_FlipbookPlayer({onStandby: false});

			if(this.currStrip.getAttribute("index") == 0){
				_setState_FlipbookPlayer({introActive: false});
			}
		}
		
	 
	}

	rewind(){
		this.currStrip.scrollIntoView(true);

		// Clear timer
		_setState_Scrubber({currFrame: -1});
		_setState_FlipbookPlayer({onStandby: true});
		
	}

	gotoPrev(){
		if (this.currStrip.previousElementSibling != null){
			//scroll
			this.currStrip = this.currStrip.previousElementSibling;
			this.currStrip.scrollIntoView(true);

			_setState_Scrubber({
				numFrames: Number(this.currStrip.getAttribute("count")),
				currStrip: Number(this.currStrip.getAttribute("index"))
			});
		} else {
			// check if you reached the beginning
			if (this.currStrip.getAttribute("index") == 0){
				// turn on intro page
				_setState_FlipbookPlayer({introActive: true});
				_setState_Scrubber({
					currStrip: -1
				});
			}
			
		}

		
	}


	playFrame(index,useScrollTop){

		var targetFrame = this.currStrip.querySelectorAll(".frame")[index];
		if (targetFrame != null) {
			if (useScrollTop){
				this.$node.current.parentElement.scrollTop = targetFrame.offsetTop;
				console.log(targetFrame.offsetTop);
			} else {
				targetFrame.scrollIntoView(true);
			}
			
		}
		else {console.warn("Could not find frame at index " + index)}

		//update timer
		_setState_Scrubber({currFrame: index});

	}

	killSetTimeOut(){
		for(var i=0;i<this.setTimeOutArr.length;i++){
            clearTimeout(this.setTimeOutArr[i]);
        }
        
        // Dump array
        // the array only gets new entry in playNext()
        this.setTimeOutArr = new Array();
	}

	render(){
		return ((data) => {
			// TODO: why did you do this? haha
			data = new Array(data); //unify format
			return (
				!data || !data.length ? (
					<p ref={this.$node}>No frame registered to this strip</p>
				) : (
					<div className="frame_stage" onClick={this.gotoNextAndPlay} ref={this.$node}>
				 
					 	{/* data.strips is an array of JSON objects */}
						{data[0]['strips'].map((el_strip,index) => (
							<span className={`strip${index==0 ? " start" : ""}`} 
								  key={key(el_strip)}
								  index={index} 
								  count={el_strip.frames.length}>

								{/* TODO: edge case, if el_strip does not have frames */}
								{h.reorderFrames(el_strip).map(el_frame => {
									{/* TODO: edge case there are no frames */}
									return (
										<img src={el_frame.frame_image} className="frame" key={el_frame.id}/>
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










// ███████╗ ██████╗██████╗ ██╗   ██╗██████╗ ██████╗ ███████╗██████╗ 
// ██╔════╝██╔════╝██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔════╝██╔══██╗
// ███████╗██║     ██████╔╝██║   ██║██████╔╝██████╔╝█████╗  ██████╔╝
// ╚════██║██║     ██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔══╝  ██╔══██╗
// ███████║╚██████╗██║  ██║╚██████╔╝██████╔╝██████╔╝███████╗██║  ██║
// ╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
                                                                 
class Scrubber extends Component{
	constructor(props){
		super(props);

		// These states are unknown until FrameStage is mounted
		this.state={
			numFrames: 0,
			currFrame: -1,
			numStrips: 0,
			currStrip: -1,
			
		}

		//static function
		_setState_Scrubber = _setState_Scrubber.bind(this);
	}

	// componentDidMount(){
	// }

	render(){
		return(
			<div className="frame_scrubber">
				{/* Method 1: clone children prop*/}
		    	<Timer numFrames={this.state.numFrames} 
		    		   currFrame={this.state.currFrame}>
		    		<span className="frame_icon"/>
		    	</Timer>

		    	<div className="scrubber">
		    		<div className="cell_fill"
			    		 style={{
			    		 	width: (this.state.currStrip+1)*(100/this.state.numStrips) + "%"
			    		 }}
			    	/>

			    	{/* Method 2: map it directly */}
			    	<div className="cell_container">
			    		{Array.apply(null, Array(this.state.numStrips)).map((n,index) => (
			    			<div className="cell"
			    				 key={key({cell: "cell"+index})}/>
			    		))}

			    	</div>
		    	</div>
		    	

		    </div>
		) //end: return
	}
}










// ████████╗██╗███╗   ███╗███████╗██████╗ 
// ╚══██╔══╝██║████╗ ████║██╔════╝██╔══██╗
//    ██║   ██║██╔████╔██║█████╗  ██████╔╝
//    ██║   ██║██║╚██╔╝██║██╔══╝  ██╔══██╗
//    ██║   ██║██║ ╚═╝ ██║███████╗██║  ██║
//    ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝
                                     
class Timer extends Component{

	constructor(props){
		super(props);
		this.renderChildren = this.renderChildren.bind(this);
	}

	renderChildren() {
		return (
			Array.apply(null, Array(this.props.numFrames)).map((n,index) => {
			    return React.cloneElement(this.props.children, {
			    	index: index,
			    	className: "frame_icon" +(index<=this.props.currFrame ? " on" : ""),
			    	key: key({tickmark: "tickmark"+index})

			    })
			})
			
		) //end: return

  	}


	render(){
		return(
			<div className="timer">
				{this.renderChildren()}
			</div>
		)
	}

}












// ██████╗ ██╗      █████╗ ██╗   ██╗███████╗██████╗ 
// ██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝██╔════╝██╔══██╗
// ██████╔╝██║     ███████║ ╚████╔╝ █████╗  ██████╔╝
// ██╔═══╝ ██║     ██╔══██║  ╚██╔╝  ██╔══╝  ██╔══██╗
// ██║     ███████╗██║  ██║   ██║   ███████╗██║  ██║
// ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
                                                 


class FlipbookPlayer extends Component{

	constructor(props){
		super(props);
		this.endpoint = "/api/scene/" + this.props.startSceneId + "/";
		this.state = {
			introActive: true,
			onStandby: false,
			frameLoaded: false
		}

		//static function
		_setState_FlipbookPlayer = _setState_FlipbookPlayer.bind(this);
	}

	render (){
		return (
			<div className="flipbook_player">
				{/* -Frames are loaded here */}
				<div className="frame_window" 
					 style={{ 
					 	opacity: (this.state.onStandby ? STANDBY_OPACITY : 1),
					 	width: '800px',
					 	height: '500px'
					 }}>

					<FrameFeeder endpoint = {this.endpoint} 
								render={data => <FrameStage data={data} />} />

					

					<div className="player_instruction" 
						 style={{opacity: (this.state.introActive ? 1 : 0) }}>
						<span>Use keyboard to navigate</span>
						<span>
							<span className="bigtext-2 far fa-caret-square-left"></span>
							<span className="bigtext-2 far fa-caret-square-right"></span>
						</span>
					</div>

				</div>


				{/* Scrubber, to hint which strip you are on */}
				<Scrubber/>
				
				{/* Loading spinner. Still looking for a better place to put this*/}
				<Spinner style="light" 
						 float={true} 
						 bgColor="#1d1e1f"
						 spinning={this.state.frameLoaded ? false : true}/>

			</div>
		)
	}

}


// const Flipbook = () => (
//   <Curtain color="black"/>
// );

// render flipbook
const wrapper = document.getElementById("letterbox");

const refNode = wrapper ? document.getElementById("ref").querySelector("#ref-content") : null;
const sceneId = wrapper ? refNode.getAttribute("sceneId") : null;
wrapper ? ReactDOM.render(<FlipbookPlayer startSceneId={sceneId}/>, wrapper) : null;



// Can I also export...?
export {
    FrameStage,
    playFrameStage
};
