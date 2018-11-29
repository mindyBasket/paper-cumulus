import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import FrameFeeder from "./FrameFeeder";
import Spinner from "./Spinner";
import key from "weak-key";

// Custom helpers
import Helper from "./Helper"
const h = new Helper();


// Global param
const T_STEP = 400; //ms
const STANDBY_OPACITY = 0.7;
const TEMP_WIDTH = 800;
const LAZYLOAD_THRESHOLD = 3; 

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

	// Bind to FrameWindow
	pub_setStandy: function(on){
		this.setState({onStandby: on});
	},

	pub_setIntroCover: function(on){
		this.setState({onIntro: on})
	},



	// Bind to FrameWindow
	pub_recalcDimension: function($strip){
		let width = this.state.windowWidth;
		let height = this.state.windowHeight;

		if (!$strip){
			console.error("[Recalc Dimension] Strip DOM element is null!");
			return false;
		}
		const frameImages = $strip.querySelectorAll('img');
		if (!frameImages || !frameImages.length){
			console.warn("[Recalc Dimension] Cannot find <img>s in strip object");
			return false;
		}

		let di = null;
		for(let i=0;i<frameImages.length;i++){
			di = frameImages[i].getAttribute("dimension");
			if (di) {break}
		}

		if (!di) {
			// TODO: implement alternatie way to get dimension if none of 
			//		 the frames contain dimensions
			// Warning: getting offsetWidth and Height causes reflow! 
			return false;
		}

		// Calc new aspect ratio
		// Currently, width is fixed, so change the height
		let newHeight = h.calcHeight(width, di);
		// console.log("Set new height: " + newHeight);
		this.setState({windowHeight: newHeight});
	}
}

//alias
var flpb = flipbook_publicFunctions





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
                                                                                     

class FrameStage extends PureComponent{

	constructor(props){
		super(props);

		// props reference
		// this.props.isStandAlone; // this component can be used by itself without scrubber and timer

		// Data is passed down from either 1) FrameFeeder, 2) Directly (in case of standalone)
		this.data = this.props.data;
		this.totalSceneCount = h.getTotalSceneCount(this.props.data);

		this.state = {
			lazySceneCount: 1 // always load at least one scene
		}

		this.currStrip;
		this.$node = React.createRef(); 

		this.frameState = {
			isStripHead: true,
			isPlaying: false
		}

		this.setTimeOutArr = []

	
	
		this.gotoNextAndPlay=this.gotoNextAndPlay.bind(this);
		this.rewind=this.rewind.bind(this);
		this.gotoPrev=this.gotoPrev.bind(this);

		this.playFrame=this.playFrame.bind(this);
		this.killSetTimeOut=this.killSetTimeOut.bind(this);
		this.lazyLoad = this.lazyLoad.bind(this);
	}


	componentDidMount(){

		if (!this.$node || !this.$node.current){
			// why would this be empty..?
			return false;
		}	

		// NOTE: update this.$node to this.currStrip. It is not always aware. 
		//		 this is especially the case since the lazy load makes the number of 
		//		 loaded scene to be 0 when first mounted.
		// this.currStrip = this.$node.current.querySelector('.strip.start');

		if (this.props.isStandAlone){
		 	// This component can be used by itself. Currently used in SceneEditor's preview
		 	this.$node.current.click(); // autoplay

		} else {
			// bind keyboard
			// TODO: this variable appears to be not being used.
			//var playNext = this.playNext;

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
			    	this.lazyLoad();
			    }
			});

			// initialize the Scrubber.
			console.log("init scrubber");
			_setState_Scrubber({
				data: this.props.data,
				numStrips: h.getTotalStripCount(this.props.data),
				numLoadedScene: 1
			});

			// initialize lazySceneCount
			// this.setState({lazySceneCount: 1});

			// Tell parent the frame has been loaded
			_setState_FlipbookPlayer({frameLoaded: true});
		}
	
	}

	componentWillUnmount(){
		// this component have a lot of setTimeOuts flying around. Kill them all.
		this.killSetTimeOut();

	}
	componentDidUpdate(prevProps, prevState, snapshot){
		console.log("[UPDATE] FrameStage");

		// Note: Used for SceneEditor's Strip animation previews
		if (prevProps.playPreviewNow != this.props.playPreviewNow){
			const useScrollTop = true;
			this.gotoNextAndPlay(useScrollTop);
		}
	}


	gotoNextAndPlay(useScrollTop){
		// Kill any preexisting animation
		this.killSetTimeOut();

		// Get next strip
		if (this.currStrip == null){
			// never initialized. Do it now!
			console.log("currStrip never initialized. Grab the first .strip.start.");
			this.currStrip = this.$node.current.querySelector('.strip.start');
		}

		if (!this.frameState.isStripHead){
			let nextStrip = null;

			try {
				// Note: you maybe on the last strip of current scene, so move to next scene
				nextStrip = this.currStrip.className.includes('last') ? (
					this.currStrip.parentElement.nextElementSibling.querySelector('.strip.start')
				) : (
				 	this.currStrip.nextElementSibling
				)
			}
			catch (err) {
				if (err instanceof TypeError) { console.warn("Could not grab next frame. It may not exist.") }
				else {console.error(err);return false;}
			}

			if (nextStrip == null){ console.error("No more next strip.");}
			this.currStrip = nextStrip==null ? this.currStrip : nextStrip;
			
			if (useScrollTop){
				this.$node.current.parentElement.scrollTop = this.currStrip.offsetTop;
			} else { 
				this.currStrip.scrollIntoView(true);
			} 
		} 


		// set frame_window to the right aspect ratio matching new strip
		flpb.pub_recalcDimension(this.currStrip);

		//Enter playing state
		this.frameState.isPlaying = true;
		this.frameState.isStripHead = false;

		//Make timeline
		var frameCount = this.currStrip.getAttribute('count');
		var frameDuration = Number(this.currStrip.getAttribute('dur'));
			frameDuration = frameDuration || T_STEP;
		for(var i=0;i<frameCount;i++){
			// Add reference to stop it later
          	this.setTimeOutArr.push(
          		setTimeout(this.playFrame.bind(this, i, useScrollTop), i*frameDuration)
          	);
		}


		//update scrubber
		if (!this.props.isStandAlone){
			_setState_Scrubber({
				numFrames: Number(frameCount),
				currStrip: Number(this.currStrip.getAttribute("index"))
			});
			
			flpb.pub_setStandy(false);

			if(this.currStrip.getAttribute("index") == 0){
				//_setState_FlipbookPlayer({introActive: false});
				console.warn("Current Strip index is 0, so put cover back");
				flpb.pub_setIntroCover(false);
			}
		}
		
	 
	}

	rewind(){
		this.currStrip.scrollIntoView(true);

		// Clear timer
		_setState_Scrubber({currFrame: -1});
		flpb.pub_setStandy(true);
		
	}

	gotoPrev(){

		// check if you reached the beginning
		if (this.currStrip.getAttribute("index") == 0){
			// turn on intro page
			//_setState_FlipbookPlayer({introActive: true});
			flpb.pub_setIntroCover(true);
			_setState_Scrubber({
				currStrip: -1
			});
		} else {
			// Get previous strip
			// Note: you maybe on the first strip of current scene, so move to previous scene
			let prevStrip = null;
				prevStrip = this.currStrip.className.includes('start') ? (
					this.currStrip.parentElement.previousElementSibling.querySelector('.strip.last')
				) : (
				 	this.currStrip.previousElementSibling
				)

			if (prevStrip != null){
				//scroll
				this.currStrip = prevStrip;
				this.currStrip.scrollIntoView(true);

				// set frame_window to the right aspect ratio
				flpb.pub_recalcDimension(this.currStrip);


				_setState_Scrubber({
					numFrames: Number(this.currStrip.getAttribute("count")),
					currStrip: Number(this.currStrip.getAttribute("index"))
				});
			}
		}

	}


	playFrame(index,useScrollTop){

		var targetFrame = this.currStrip.querySelectorAll(".frame")[index];
		if (targetFrame != null) {
			if (useScrollTop){
				this.$node.current.parentElement.scrollTop = targetFrame.offsetTop;
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

	lazyLoad(){
		// Check if 1) the chapter is not fully loaded
		//			2) user is not currently at tip of loaded (I can probably do something with class instead)
		if (this.state.lazySceneCount < this.totalSceneCount &&
			Number(this.currStrip.parentElement.getAttribute('index')) >= this.state.lazySceneCount-1){
			// is the user at threshold?
			const currPos = Number(this.currStrip.getAttribute("localindex"));
			const totalPos = this.currStrip.parentElement.querySelectorAll('.strip').length;
			// console.log("totalPos - currPos = " + (totalPos - currPos));
			if (totalPos - currPos <= LAZYLOAD_THRESHOLD){
				let lazyDataSoFar = this.state.lazySceneCount;
				this.setState({lazySceneCount:lazyDataSoFar+1});
				// see render() to see how this effects the loaded frames

				// Update scrubber
				_setState_Scrubber({
					numLoadedScene:lazyDataSoFar+1
				});
			}
		}

	}


	render(){

		// Note: do not do it like this. It causes this.$node to be sometimes null. 
		//		 which consequently messed up this.currStrip. Instead, make the whole 
		//		 component not render from its parents.
		//if (this.props.isStandAlone && !this.props.on){ return false;}

		let stripCount = 0; // used for properly indexing strip

		var data = Array.isArray(this.props.data) ? this.props.data : new Array(this.props.data); //unify format

		if (!data || !data.length){
			console.warn("[FrameStage] No frame registered to this scene");
			return (<p ref={this.$node}>No frame registered to this scene</p>)
		} 
		else{

			// Order scenes based on children_li, if provided
			if (this.props.children_li){
				data = h.reorderChildren(data, this.props.children_li); 
			} 

			let lazyData = data.slice(0,this.state.lazySceneCount);


			return (
				<div className="frame_stage" onClick={this.gotoNextAndPlay} ref={this.$node}>
			 
				 	{/* data.strips is an array of JSON objects */}
				 	{lazyData.map((el_scene,index_sc)=>{
				 		stripCount += index_sc > 0 ? lazyData[index_sc-1]['strips'].length : 0;
				 		console.log("StripCount in curr lazyScene: " + el_scene.strips.length);
				 		return (
				 		<span className="scene" 
				 			  key={'scene'+el_scene}
				 			  index={index_sc}>

				 			{el_scene['strips'].map((el_strip,index_st) => (
								<span className={`strip${index_st==0 ? " start" : ""}${index_st==el_scene['strips'].length-1 ? " last" : ""}`} 
									  key={"strip"+el_strip.id}
									  index={stripCount+index_st}
									  localindex={index_st}
									  dur={el_strip.frame_duration}
									  count={h.getUnignoredFrames(el_strip).length}>

									{/* map can be empty */}
									{h.getUnignoredFrames(el_strip).length == 0 && 
										<span className="frame empty">
											EMPTY STRIP
										</span>
									}

									{h.reorderFrames(el_strip).map(el_frame => {
										{/* TODO: edge case there are no frames */}
										if (el_frame && el_frame.frame_image) {
											return (
												<img src={el_frame.frame_image}
													 className="frame" 
													 dimension={el_frame.dimension} 
													 key={el_frame.id}/>
											)
										} else {
											return (
												<span className="frame empty">
													FRAME WITH MISSING IMAGE
												</span>
											)
										}
										
									})}

								</span>
							))} 

				 		</span>)
				 	})}
					
				</div>

			)
		}
		
	}



}







// ███████╗██████╗  █████╗ ███╗   ███╗███████╗██╗    ██╗██╗███╗   ██╗██████╗  ██████╗ ██╗    ██╗
// ██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝██║    ██║██║████╗  ██║██╔══██╗██╔═══██╗██║    ██║
// █████╗  ██████╔╝███████║██╔████╔██║█████╗  ██║ █╗ ██║██║██╔██╗ ██║██║  ██║██║   ██║██║ █╗ ██║
// ██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝  ██║███╗██║██║██║╚██╗██║██║  ██║██║   ██║██║███╗██║
// ██║     ██║  ██║██║  ██║██║ ╚═╝ ██║███████╗╚███╔███╔╝██║██║ ╚████║██████╔╝╚██████╔╝╚███╔███╔╝
// ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝ ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝  ╚══╝╚══╝ 
                                                                                             
class FrameWindow extends Component{

	constructor(props){
		super(props);

		if (chapterId == null){
			// if chapterId not provided, only retrieve one scene
			// Note: response will be an object
			this.endpoint = `/api/scene/${this.props.startSceneId}/`;
		} else {
			// Note: response will be an ARRAY of objects
			this.endpoint = `/api/chapter/${this.props.chapterId}/scene/all/`;
		}

		// prop ref
		// this.props.data 
		// this.props.isStandAlone 
		// this.props.widthOverride // should be passed down if standAlone
		// this.props.heightOverride 

		this.state={
			onStandby: false,
			onIntro: true,

			windowHeight: 500, 
			windowWidth: TEMP_WIDTH, // using a hardcoded width for now
		}

		flpb.pub_recalcDimension = flpb.pub_recalcDimension.bind(this);
		flpb.pub_setStandy = flpb.pub_setStandy.bind(this);
		flpb.pub_setIntroCover = flpb.pub_setIntroCover.bind(this);
	}

	render(){
		const wOv = this.props.widthOverride;
		const hOv = this.props.heightOverride;

		return (
			<div className="frame_window" 
				 style={{ 
				 	opacity: (this.state.onStandby ? STANDBY_OPACITY : 1),
				 	width: (wOv ? wOv : this.state.windowWidth + "px"), 
				 	height: (hOv ? hOv : this.state.windowHeight + "px")
				 }}>

				 

				{/* If stand alone, render Frames only if it is on. 
					Otherwise, it's too many unseen elements on the page. */}
				{ (this.props.isStandAlone && this.props.on) && (

                    <FrameStage data={this.props.data} 
                                isStandAlone={true} 
                                on={this.props.on}
                                playPreviewNow={this.props.playPreviewNow} 
                    />

				)} 

				{/* If NOT standalone */}
				{ !this.props.isStandAlone && (
					<FrameFeeder endpoint = {this.endpoint} 
								 render={dataDict => <FrameStage data={dataDict.data}
								 						         children_li={dataDict.children_li} />} />
				)}
				
				{!this.props.isStandAlone && 
					<div className="frame_window_decorations">
						<div className="player_instruction" 
							 style={{opacity: (this.state.onIntro ? 1 : 0) }}>
							<span>Use keyboard to navigate</span>
							<span>
								<span className="bigtext-2 far fa-caret-square-left"></span>
								<span className="bigtext-2 far fa-caret-square-right"></span>
							</span>
						</div>
					</div>
				}

				{/*<div className={"standby_cover " + (this.state.onStandby ? "active" : "")}></div>*/}
				
			</div>
		)
	}

}




// ███████╗███████╗████████╗ ██████╗██╗  ██╗███████╗██████╗ 
// ██╔════╝██╔════╝╚══██╔══╝██╔════╝██║  ██║██╔════╝██╔══██╗
// █████╗  █████╗     ██║   ██║     ███████║█████╗  ██████╔╝
// ██╔══╝  ██╔══╝     ██║   ██║     ██╔══██║██╔══╝  ██╔══██╗
// ██║     ███████╗   ██║   ╚██████╗██║  ██║███████╗██║  ██║
// ╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
                                                         
class ScrubberTooltip extends PureComponent{
	constructor(props){
		super(props);
		//prop ref
		// this.props.position = [left, top]
		
		this.topMargin = 30; //px
	}

	render(){
		const pos = this.props.position;
		// console.log("[tooltip] " + pos);
		let content = this.props.content;
		if (!content || content === undefined){
			content=null;
		} else{
			content = content.split("-");

		}


		return (
			<span className={"scrubber_tooltip " + 
							 (this.props.active ? "active":"")}
				  style={{top: pos[1]+this.topMargin, left: pos[0]}}>
				
				{!content ? (
					<span>???</span>
				) : (
					<span>
						<span className="dimmed fas fa-video"></span>
						{content[0]} - 
						<span className="dimmed fas fa-film"></span>
						{content[1]}</span>
				)}

			</span>
		)
		
	}
}




// ███████╗ ██████╗██████╗ ██╗   ██╗██████╗ ██████╗ ███████╗██████╗ 
// ██╔════╝██╔════╝██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔════╝██╔══██╗
// ███████╗██║     ██████╔╝██║   ██║██████╔╝██████╔╝█████╗  ██████╔╝
// ╚════██║██║     ██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔══╝  ██╔══██╗
// ███████║╚██████╗██║  ██║╚██████╔╝██████╔╝██████╔╝███████╗██║  ██║
// ╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
                                                                 
class Scrubber extends PureComponent{
	constructor(props){
		super(props);

		// These states are unknown until FrameStage is mounted
		this.state={
			data: null, // TODO: passed from FrameStage. I know. It's bad.

			numFrames: 0,
			currFrame: -1,

			numStrips: 0,
			currStrip: -1,

			numLoadedScene: 0,

			tooltipActive: false,
			tooltipContent: null,
			tooltipPos: [0,0],

		}

		this.callTooltip = this.callTooltip.bind(this);
		this.outTooltip = this.outTooltip.bind(this);

		//static function
		_setState_Scrubber = _setState_Scrubber.bind(this);
	}


	callTooltip(e){
		const el = e.target;
		// console.log(`Cell pos?: x: ${el.offsetTop}, y: ${el.offsetLeft}`);
		this.setState({ tooltipActive: true,
						tooltipContent: el.getAttribute("stamp"),
						tooltipPos: [el.offsetLeft, el.offsetTop] });

	}

	outTooltip(e){
		this.setState({tooltipActive: false});
	}

	render(){
		let data = null;
		if(!Array.isArray(this.state.data)){
			console.error("[Scrubber] Scrubber can only accept Array data");
		} else {
			//console.warn("[Scrubber] data accepted: " + JSON.stringify(this.state.data) );
			data = this.state.data; 
			// data.map((el_scene)=>{
			// 	console.warn("Scene: " + el_scene['strips'].length);
			// });
		}

		
		
		// get number of loaded strip
		let loadedStripCount = 0;
		const el_scene = document.querySelectorAll('.scene');
		if(el_scene && el_scene.length){
			for(let i=0; i<this.state.numLoadedScene;i++){
				loadedStripCount += el_scene[i].querySelectorAll('.strip').length;
			}
		}
		
		const cellStep = this.state.numStrips > 0 ? 100/this.state.numStrips : 0;
		const frameStep = this.state.numFrames > 0 ? (this.state.currFrame+1)/this.state.numFrames : 0;

		return(
			
			<div className="frame_scrubber">
				
		    	<div className="scrubber">

		    		<div className="cell_fill loaded"
			    		 style={{
			    		 	width: (loadedStripCount)*(100/this.state.numStrips) + "%"
			    		 }}
			    	/>

		    		<div className="cell_fill"
			    		 style={{
			    		 	width: ( (this.state.currStrip)*cellStep + cellStep*frameStep ) + "%"
			    		 }}
			    	/>

			    	{/* Method 2: map it directly */}
			    	<div className="cell_container">
			    		
			    		{/* Mapping over an array generated on the fly */}
			    		{/*Array.apply(null, Array(this.state.numStrips)).map((n,index) => (
                            <div className="cell"/>
                        ))*/}


			    		{data ? (
			    			data.map((el_scene, ind_sc)=>{
								return el_scene['strips'].map((el,ind_st)=>{
									return (
			    						<div className="cell"
						    				 onMouseEnter={this.callTooltip}
						    				 onMouseOut={this.outTooltip}
						    				 stamp={`${ind_sc+1}-${ind_st+1}`}
						    				 key={{cell: `${ind_sc}-${ind_st}`}}>
						    			</div>
			    					)
								})
			    			})
			    		) : (
			    			<div className="cell">
						    </div>
			    		)} 



			    	</div>
		    	</div>

		    	{/* Method 1: clone children prop*/}
		    	<Timer numFrames={this.state.numFrames} 
		    		   currFrame={this.state.currFrame}>
		    		<span className="frame_icon"/>
		    	</Timer>

		    	<ScrubberTooltip position={this.state.tooltipPos}
		    				     content={this.state.tooltipContent}
		    					 active={this.state.tooltipActive}/>

		    	

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









// ███╗   ███╗ █████╗ ██╗███╗   ██╗
// ████╗ ████║██╔══██╗██║████╗  ██║
// ██╔████╔██║███████║██║██╔██╗ ██║
// ██║╚██╔╝██║██╔══██║██║██║╚██╗██║
// ██║ ╚═╝ ██║██║  ██║██║██║ ╚████║
// ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
                                
// ██████╗ ██╗      █████╗ ██╗   ██╗███████╗██████╗ 
// ██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝██╔════╝██╔══██╗
// ██████╔╝██║     ███████║ ╚████╔╝ █████╗  ██████╔╝
// ██╔═══╝ ██║     ██╔══██║  ╚██╔╝  ██╔══╝  ██╔══██╗
// ██║     ███████╗██║  ██║   ██║   ███████╗██║  ██║
// ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
                                                 


class FlipbookPlayer extends Component{

	constructor(props){
		super(props);
		

		this.state = {
			// introActive: true, -> changed to 'onIntro' and moved into FrameWindow
			frameLoaded: false,
		}

		//static function
		_setState_FlipbookPlayer = _setState_FlipbookPlayer.bind(this);
		
	}

	render (){
		return (
			<div className="flipbook_player">
				
				{/* Scrubber, to hint which strip you are on */}
				<Scrubber/>
				{/* Through FrameWindow, you only see one frame at a time */}
				<FrameWindow 
					startSceneId={this.props.startSceneId}
					chapterId={this.props.chapterId}/>

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
const chapterId = wrapper ? refNode.getAttribute("chapterId") : null;
wrapper ? ReactDOM.render(<FlipbookPlayer startSceneId={sceneId} chapterId={chapterId}/>, wrapper) : null;



// Can I also export...?
export {
    FrameStage,
    FrameWindow,
    flipbook_publicFunctions
};
