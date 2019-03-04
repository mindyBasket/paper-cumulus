import React, { Component, PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import VideoFeeder from './VideoFeeder';
import { movieStage_publicFunctions as mStage, FlipbookMovieStage } from './player/FlipbookMovieStage';
import Spinner from './Spinner';
import { LightBox } from './LightBox';
import { MenuButton } from './UI';

import key from 'weak-key';

import Logr from './tools/Logr';
import Helper from './Helper';
import Constants from './Constants';

const logr = new Logr('Flipbook(pie)Player');
const h = new Helper();
const cnst = new Constants();

// DEMOONLY
import { DemoModal,DemoGuideBtn } from './demo/Demo';


// Global param
const T_STEP = 400; // ms
const STANDBY_OPACITY = 0.7;
const TEMP_WIDTH = 800;
const LAZYLOAD_THRESHOLD = 3;

// Static functions
// These are used to make components communicate with each other

function _setState_Scrubber(newState) {
  try {
    this.setState(newState);
  } catch (err) {
    // console.warn("Scrubber not found.");
  }

}

function _setState_FlipbookPlayer(newState) {
  try {
    this.setState(newState);
  } catch (err) {
    // console.warn("Flipbook Player not found.");
  }
}

const flipbook_publicFunctions = {

  // TODO: move the setState functions in here...

  // Bind to FrameWindow
  pub_setStandy: function (on) {
    this.setState({ onStandby: on });
  },

  pub_setIntroCover: function (on) {
    this.setState({ onIntro: on })
  },

  // Bind to FrameWindow
  pub_recalcDimension: function ($strip) {
    let width = this.state.windowWidth;
    let height = this.state.windowHeight;

    if (!$strip) {
      console.error("[Recalc Dimension] Strip DOM element is null!");
      return false;
    }
    const frameImages = $strip.querySelectorAll('img');
    if (!frameImages || !frameImages.length) {
      console.warn("[Recalc Dimension] Cannot find <img>s in strip object");
      return false;
    }

    let di = null;
    for (let i = 0; i < frameImages.length; i++) {
      di = frameImages[i].getAttribute("dimension");
      if (di) { break }
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
    this.setState({ windowHeight: newHeight });
  }
}

// alias
const flpb = flipbook_publicFunctions;


// http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=FrameStage

// ██████╗ ██╗      █████╗ ██╗   ██╗███████╗██████╗
// ██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝██╔════╝██╔══██╗
// ██████╔╝██║     ███████║ ╚████╔╝ █████╗  ██████╔╝
// ██╔═══╝ ██║     ██╔══██║  ╚██╔╝  ██╔══╝  ██╔══██╗
// ██║     ███████╗██║  ██║   ██║   ███████╗██║  ██║
// ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝

/**
 * This component, previously a "FrameWindow", will now act as a player component
 * that wrap the staging area, scrubber and timer altogether
 */
class FlipbookPlayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currSceneIndex: -1, // index for orderedChildrenIds
      currStripIndex: 0,
      currFrameIndex: 0,
      orderedChildrenIds: null,
      playbackDict: null,

      isPaused: true,
    };

    this.frameState = {
      isStripHead: true,
      isPlaying: false,
    };

    this.setTimeOutArr = []; 


    this.gotoPrev = this.gotoPrev.bind(this);
    this.rewind = this.rewind.bind(this);
    this.gotoNextAndPlay = this.gotoNextAndPlay.bind(this);
    this.playFrame = this.playFrame.bind(this);
    // this.killSetTimeOut = this.killSetTimeOut.bind(this);

    this.setPlayerData = this.setPlayerData.bind(this);
  }

  componentDidMount() {
    // bind keyboard
    document.addEventListener('keydown', (event) => {
      if (this.state.playbackDict && this.state.orderedChildrenIds) {
        if (event.keyCode === 37) { // GO TO PREVIOUS
          this.setState({isPaused: true });
          // this.killSetTimeOut();

          if (this.frameState.isStripHead) {
            this.gotoPrev(); // go to previous strip
          } else {
            this.rewind(); // rewind to beginning of strip
          }
          // doing either action places you at the head of a strip
          this.frameState.isStripHead = true;
          
        } else if (event.keyCode === 39) { // GO TO NEXT
          this.setState({isPaused: false });
          this.gotoNextAndPlay();
          // this.lazyLoad();
          this.frameState.isStripHead = false;
        }
      }
    });

    // TODO: uncomment when implemented
    // // initialize the Scrubber.
    // logr.info('Init scrubber');
    // _setState_Scrubber({
    //   data: this.props.data,
    //   numStrips: h.getTotalStripCount(this.props.data),
    //   numLoadedScene: 1
    // });

    // initialize lazySceneCount
    // this.setState({lazySceneCount: 1});

    // TODO: uncomment when implemented
    // Tell parent the frame has been loaded
    // setState_FlipbookPlayer({ frameLoaded: true });
  }

  gotoPrev() {
    logr.info('Go to previous');

    const currSceneIndex = this.state.currSceneIndex;
    let prevSceneIndex = null;
    const currStripIndex = this.state.currStripIndex;
    let prevStripindex = null;
    const orderedId = this.state.orderedChildrenIds;
    let currScenePlayback = null; // object with key 'strips', which contain array

    // 1. Determine if previous segment is available ----------------------------------------------
    if (currStripIndex === 0) {
      // no more previous strip
      if (currSceneIndex <= 0) {
        // Go back to "cover"
        prevSceneIndex = -1;
        prevStripindex = 0; // reset
      } else {
        // go to last strip of previous scene
        currScenePlayback = this.state.playbackDict[`scene_${orderedId[currSceneIndex - 1]}`];
        prevStripindex = currScenePlayback.strips.length - 1;
        prevSceneIndex = currSceneIndex - 1;
      }
    } else {
      // go back on strip on the same scene
      prevSceneIndex = currSceneIndex;
      prevStripindex = currStripIndex - 1;
    }

    // This will trigger update to the stage
    if (prevSceneIndex !== null && prevStripindex !== null) {
      this.setState({
        currSceneIndex: prevSceneIndex,
        currStripIndex: prevStripindex,
      });
    } else {
      logr.error(`Either scene index or strip index is null: scene:strip = ${prevSceneIndex}:${prevStripindex}`);
    }


    // TODO: uncomment when implemented
    // if (prevStrip != null) {
    //   // scroll
    //   this.currStrip = prevStrip;
    //   this.currStrip.scrollIntoView(true);

    //   // set frame_window to the right aspect ratio
    //   flpb.pub_recalcDimension(this.currStrip);


    //   _setState_Scrubber({
    //     numFrames: Number(this.currStrip.getAttribute("count")),
    //     currStrip: Number(this.currStrip.getAttribute("index"))
    //   });
    // }
  }


  /**
   * Only executed if "back" arrow key is pressed while a strip is playing
   * It simply rewinds the strip back to its head.
   */
  rewind() {
    logr.info('Reset current strip');
    mStage.mStage_gotoStrip(); // pass nothing to reset to current strip.
    // Clear timer
    // _setState_Scrubber({currFrame: -1});
    // flpb.pub_setStandy(true);
  }

  gotoNextAndPlay() {
    const currSceneIndex = this.state.currSceneIndex;
    let nextSceneIndex = null;
    const currStripIndex = this.state.currStripIndex;
    let nextStripindex = null;
    const orderedId = this.state.orderedChildrenIds;
    let currScenePlayback = null; // object with key 'strips', which contain array

    // 1. Determine what to play next ----------------------------------------------
    if (currSceneIndex === -1) { // currently on "cover"
      // TODO: actually remove cover
      logr.info('Remove cover');
      nextSceneIndex = 0;
      nextStripindex = 0;
    } else { // Not "cover". In the middle of the book
      if (this.frameState.isStripHead) {
        // no need to determine next strip. Just play current one.
        mStage.mStage_playFrame();
        return;
      }

      try {
        currScenePlayback = this.state.playbackDict[`scene_${orderedId[currSceneIndex]}`];
      } catch (err) {
        logr.warn(`ERROR:. Playback info not found for scene = ${currSceneIndex}.`);
        return false;
      }
      // Check if OOB for Strip
      if (currStripIndex >= currScenePlayback.strips.length - 1) {
        // Out of strip. Go to next scene
        // Check if OOB for Scene
        if (currSceneIndex >= orderedId.length - 1) {
          logr.warn(`'Reached the end of all video stack! scene ${currSceneIndex}/${orderedId.length}`);
          // TODO: implement better end-of-chapter indication
          return false;
        }
        logr.warn(`Go to next scene = ${orderedId[currSceneIndex]} (reset strip index)`);
        nextSceneIndex = currSceneIndex + 1;
        nextStripindex = 0; // reset because new Scene
      } else {
        nextSceneIndex = currSceneIndex; // is same
        nextStripindex = currStripIndex + 1;
        logr.info(`Next strip. Index = ${nextStripindex + 1}/${currScenePlayback.strips.length}`);
        this.setState({
          currStripIndex: nextStripindex,
        });
      }
    }

    // 2. Actually play ----------------------------------------------
    // Update and Extract playback info
    currScenePlayback = this.state.playbackDict[`scene_${orderedId[nextSceneIndex]}`];

    if (!currScenePlayback || currScenePlayback.strips.length === 0) {
      logr.warn('There are more scenes, but playback is not available!');
      return false;
    }

    logr.info("Current scene's playback");
    console.log(currScenePlayback); // this is stack for the WHOLE chapter though

    // This will trigger update to the stage and PLAY
    if (nextSceneIndex !== null && nextStripindex !== null) {
      this.setState({
        currSceneIndex: nextSceneIndex,
        currStripIndex: nextStripindex,
      }, mStage.mStage_playFrame);
    } else {
      logr.error(`Either scene index or strip index is null: scene:strip = ${nextSceneIndex}:${nextStripindex}`);
    }

  }

  // NOT USED. Moved inside Stage component
  playFrame(index) {
    // the actual animation is done inside stage. Only update its prop.
    // PROBLEM: doing it this way causes frame skip. I am guessing it is because
    //          the component could be busy updating other states!
    this.setState({
      currFrameIndex: index,
    });

    // TODO: update timer
    // _setState_Scrubber({ currFrame: index });
  }

  // Communication with stage
  setPlayerData(children_li, playbackDict) {
    logr.info('Children order and playback information for player received from VideoFeeder');
    console.log(playbackDict);
    console.log(children_li);

    // waits for <VideoFeeder> to fetch playback stack and updates it
    this.setState({
      playbackDict: playbackDict,
      orderedChildrenIds: children_li,
    });
  }

  render() {
    const wOv = this.props.widthOverride;
    const hOv = this.props.heightOverride;


    return (
      <div className="flipbook_player">

        {/* Scrubber's data is set by publish function. See inside VideoFeeder */}
        {/* <Scrubber 
          currStripIndex={}
          currFrameIndex={}
        /> */}
        {/* TRYING OUT PORTAL! */}
        <div id="portal_scrubber" />


        <VideoFeeder
          chapterId={this.props.chapterId}
          player_setPlayerData={this.setPlayerData}

          render={renderData => (
            <FlipbookMovieStage
              videoUrls={renderData.videoUrls}
              videoSceneIds={renderData.videoSceneIds}
              videoPlaybackDict={renderData.videoPlaybacks}
              children_li={renderData.children_li}

              currVideoIndex={this.state.currSceneIndex}
              currStripIndex={this.state.currStripIndex}

              isPaused={(this.state.isPaused && this.state.currSceneIndex >= 0)}
            />
          )}
        />

        {/*
        <div className="frame_window_decorations">
          <div
            className="player_instruction"
            style={{ opacity: (this.state.onIntro ? 1 : 0) }}
          >
            <span>Use keyboard to navigate</span>
            <span>
              <span className="bigtext-2 far fa-caret-square-left" />
              <span className="bigtext-2 far fa-caret-square-right" />
            </span>
          </div>
        </div>
        */}
        {/* <div className={"standby_cover " + (this.state.onStandby ? "active" : "")}></div> */}

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

// ██╗      █████╗ ██╗   ██╗ ██████╗ ██╗   ██╗████████╗
// ██║     ██╔══██╗╚██╗ ██╔╝██╔═══██╗██║   ██║╚══██╔══╝
// ██║     ███████║ ╚████╔╝ ██║   ██║██║   ██║   ██║   
// ██║     ██╔══██║  ╚██╔╝  ██║   ██║██║   ██║   ██║   
// ███████╗██║  ██║   ██║   ╚██████╔╝╚██████╔╝   ██║   
// ╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝  ╚═════╝    ╚═╝   

/**
 * This component is rendered into the HTML
 */
class FlipbookLayout extends Component{
  static propTypes = {
    chapterId: PropTypes.number.isRequired,
    startSceneId: PropTypes.number.isRequired,
  };

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
			<div className="flipbook_layout_wrapper">

				{/* Through FrameWindow, you only see one frame at a time */}
				<FlipbookPlayer
					startSceneId={this.props.startSceneId}
					chapterId={this.props.chapterId}
        />

				{/* Loading spinner. Still looking for a better place to put this*/}
				{/* <Spinner style="light" 
						 float={true} 
						 bgColor="#1d1e1f"
             spinning={this.state.frameLoaded ? false : true}/>
        /*}

				{/* flipbook player controls */}
				<MenuButton iconClass="menu_btn fas fa-share-square" action={()=>{}} 
                            label="Share" tooltipDirection="bottom"
                            proxyId="#proxy_share"
                            comingSoon={true} />

				{/* invisible */}
				<LightBox addToOnClick={this.addTo_LightBoxOnClick}
						  handle_dragAndDrop={this.handle_dragAndDrop}
						  setParentState={this.setParentState}/>


				{/* DEMOONLY */}
				<DemoGuideBtn onAtMount={true}
							  num={2}
						      proxyId={"#proxy_demoguide"}/>


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
wrapper ? ReactDOM.render(<FlipbookLayout startSceneId={sceneId} chapterId={chapterId}/>, wrapper) : null;



// Can I also export...?
// export {
//     FrameStage,
//     FrameWindow,
//     flipbook_publicFunctions
// };
