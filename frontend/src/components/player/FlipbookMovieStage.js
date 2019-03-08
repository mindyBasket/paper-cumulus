import React, { Component, PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { scrubber_publicFunctions as scbr, Scrubber } from './Scrubber';

import Logr from '../tools/Logr';
import Helper from '../Helper';
import Constants from '../Constants';

const logr = new Logr('MovieStage');
const h = new Helper();
const cnst = new Constants();

const movieStage_publicFunctions = {

  // Bind to MovieStage
  mStage_playFrame: function () {
    this.playFrame();
  },

  mStage_gotoStrip: function (newStripIndex) {
    this.gotoStrip(newStripIndex);
  }
  
}

// alias
const mStage = movieStage_publicFunctions;

// http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=Stage

// ███████╗████████╗ █████╗  ██████╗ ███████╗
// ██╔════╝╚══██╔══╝██╔══██╗██╔════╝ ██╔════╝
// ███████╗   ██║   ███████║██║  ███╗█████╗
// ╚════██║   ██║   ██╔══██║██║   ██║██╔══╝
// ███████║   ██║   ██║  ██║╚██████╔╝███████╗
// ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝

class FlipbookMovieStage extends PureComponent {
  static propTypes = {
    videoUrls: PropTypes.array.isRequired,
    videoSceneIds: PropTypes.array.isRequired,
    videoPlaybackDict: PropTypes.array.isRequired,
    videoStripLocation: PropTypes.array.isRequired,
    // handle_fetchScene: PropTypes.func.isRequired,
    // setState_LightBox: PropTypes.func.isRequired,
    currVideoIndex: PropTypes.number,
    currStripIndex: PropTypes.number,
    // currFrameIndex: PropTypes.number, // NOT USED. MovieStage figures it out.

    isPaused: PropTypes.bool,
  };

  static defaultProps = {
  }

  constructor(props) {
    super(props);

    // NOT a state
    this.currStripTime = 0; // sec
    this.setTimeOutArr = [];
    
    this.TARGET_STAGE_WIDTH = 900; // TODO: this shoudn't be hardcoded, but better solution later
    
    // DOM ref
    this.currVideo = null;
    this.dom_movieStage = null;
    this.dom_windowDec = null;

    this.state = {
      numTotalStrips: this.getTotalNumStrips(), // for scrubber only so far
      currFrameIndex: 0, // for scrubber only so far

      stageDimension: [`${this.TARGET_STAGE_WIDTH}px`, '0px'],
      hasError: false,
    };

    this.recalcDimension = this.recalcDimension.bind(this);
    this.getTotalNumStrips = this.getTotalNumStrips.bind(this);
    this.getCurrSceneId = this.getCurrSceneId.bind(this);
    this.getCurrScenePlayback = this.getCurrScenePlayback.bind(this);
    this.getCurrStripPlayback = this.getCurrStripPlayback.bind(this);

    this.gotoStrip = this.gotoStrip.bind(this);
    this.playFrame = this.playFrame.bind(this);
    this.gotoFrame = this.gotoFrame.bind(this);
    this.killSetTimeOut = this.killSetTimeOut.bind(this);

    // pub bind
    mStage.mStage_playFrame = mStage.mStage_playFrame.bind(this);
    mStage.mStage_gotoStrip = mStage.mStage_gotoStrip.bind(this);
  }

  componentDidMount() {
    // Check for error on mount
    const errMsg = this.props.errorMessage;
    if (errMsg && errMsg !== '' && errMsg !== null) {
      this.setState({
        hasError: true,
      });
      return;
    }


    this.dom_movieStage = document.querySelector('.movie_stage_window');
    this.dom_windowDec = document.querySelector('.movie_window_decorations');

    // Calc the first dimension
    const currWidth = this.TARGET_STAGE_WIDTH;

    // Get first scene's dimension
    const sceneDimension = this.getCurrScenePlayback(this.props.videoSceneIds[0]).dimension;
    if (!sceneDimension) {
      logr.error(`Could not retrieve dimension information. (sceneId=${this.props.videoSceneIds[0]})`);
    }

    const newHeight = (Number(sceneDimension[1]) * currWidth) / Number(sceneDimension[0]);
    this.setState({
      stageDimension: [`${currWidth}px`, `${newHeight}px`],
    });

    // TODO:
    // Future plan is to let movieStage render at 100% to extract exact measure of width.
    // And then use that to calc the height.
    // window.requestAnimationFrame(this.recalcDimension);
  }

  componentDidUpdate(prevProps) {
    if (this.props.hasError) { return; }

    // Switch to current scene video
    const scIds = this.props.videoSceneIds;
    const currIndex = this.props.currVideoIndex;
    const currStripIndex = this.props.currStripIndex;
    const currSceneId = scIds[currIndex];
    this.currVideo = document.querySelector(`.movie_stack #sc_${currSceneId}`);

    if (currIndex < 0) {
      // Not a valid index of video/scene
      return;
    }

    if (this.currVideo) {
      this.currVideo.scrollIntoView(true); // get video to view
      // get window decoration to view
      this.dom_windowDec.style.top = `${this.currVideo.offsetTop}px`;


    } else {
      logr.warn(`Video for scene id=${currSceneId} not found.`);
    }

    // Switch to current strip (section of video)
    // TODO: This seem horribly inefficient...You are doing this every key press.
    //       It would be better if "frameCounts" were already gathered by the api
    if (prevProps.currStripIndex !== currStripIndex) {
      this.gotoStrip();
      // Called externally
      // this.playFrame();
    }
  }

  recalcDimension() {
    // recalc dimension based on current stage of the canvas
    const currWidth = this.TARGET_STAGE_WIDTH;

    // Get first scene's dimension
    const sceneDimension = this.getCurrScenePlayback().dimension;
    if (!sceneDimension) {
      logr.error(`Could not retrieve dimension information. (sceneId=${this.props.currVideoIndex})`);
    }

    const newHeight = (Number(sceneDimension[1]) * currWidth) / Number(sceneDimension[0]);

    return [`${currWidth}px`, `${newHeight}px`];

    // TODO: use this in the future to determime if you should go 100% or smaller width...
    // this.dom_movieStage.offsetWidt

    // TODO: also, increase of calculating dimension only for scene, it should also do for strips
  }

  getTotalNumStrips() {
    // goes through videoPlaybackDict and get number of strips
    const pbDict = this.props.videoPlaybackDict;
    if (!pbDict || pbDict.keys().length === 0) { return 0; }

    let stripCount = 0;
    Object.keys(pbDict).forEach((scKey) => {
      if ('strips' in pbDict[scKey]) {
        stripCount += pbDict[scKey].strips.length;
      } else {
        logr.error(`'Strips' property not found in playback for ${scKey}.`);
      }
    });

    // logr.info('Total number of strips in this chapter: ' + stripCount);
    return stripCount;
  }

  getCurrSceneId() {
    const scIds = this.props.videoSceneIds;
    if (!scIds) { return -1; }

    const currIndex = this.props.currVideoIndex;
    return scIds[currIndex];
  }

  getCurrScenePlayback(scId) {
    // If you pass sceneId, this function will act like getScenePlayback
    const currSceneId = scId || this.getCurrSceneId();
    return this.props.videoPlaybackDict[`scene_${currSceneId}`];
  }

  getCurrStripPlayback() {
    const currSceneId = this.getCurrSceneId();
    const sceneKey = `scene_${currSceneId}`;
    if (sceneKey in this.props.videoPlaybackDict) {
      const stripPlaybackArr = this.props.videoPlaybackDict[`scene_${currSceneId}`].strips;
      return stripPlaybackArr[this.props.currStripIndex];
    }
    return null;
  }

  gotoStrip(newStripIndex) {
    const currScenePlayback = this.getCurrScenePlayback();
    const currStripIndex = newStripIndex || this.props.currStripIndex;

    // Reset some information:
    this.killSetTimeOut(); // any change in strip will reset setTimeout array
    this.setState({ currFrameIndex: 0 }); // Reset frame index!

    if (this.currVideo) {
      try {
        // set dimenion of window
        // Note: the very first strip's dimension is set at componentDidMount()
        this.setState({
          stageDimension: this.recalcDimension(),
        });


        // make array of frame nums
        const frameCounts = [];
        currScenePlayback.strips.forEach((st) => {
          frameCounts.push(st.frame_count);
        });

        let frameCountPassed = 0;
        for (let stInd = 0; stInd < currStripIndex; stInd++) {
          frameCountPassed += frameCounts[stInd];
        }

        this.currStripTime = frameCountPassed;
        this.currVideo.currentTime = frameCountPassed + 0.2; // makes sure it's inside the frame
      } catch (err) {
        logr.error('Error while calculating strip time location');
      }
    }
  }

  playFrame() {
    this.killSetTimeOut(); // just in case

    // Make timeline
    const currStripIndex = this.props.currStripIndex;
    const currScenePlayback = this.getCurrScenePlayback();

    const frameCount = Number(currScenePlayback.strips[currStripIndex].frame_count);
    let frameDuration = Number(currScenePlayback.strips[currStripIndex].frame_duration);
    frameDuration = frameDuration || cnst.T_STEP;

    for (let i = 1; i < frameCount; i++) {
      // Add reference to stop it later
      this.setTimeOutArr.push(
        setTimeout(this.gotoFrame.bind(this, this.currVideo, i), i * frameDuration)
      );
    }
  }

  gotoFrame(currVideo, currFrameIndex) {
    // animate frame (if warrents it)
    // It simply adds to currStripTime.
    // If currFrameIndex=0, that's same as head of strip
    if (currVideo) {
      currVideo.currentTime = this.currStripTime + currFrameIndex + 0.2;
      logr.info('Frame timestamp: ' + this.currStripTime + ' + ' + currFrameIndex);

      this.setState({
        currFrameIndex: currFrameIndex,
      }, ()=>{console.log(`setState frameInd = ${currFrameIndex}`)});
    }
  }

  killSetTimeOut() {
    for (let i = 0; i < this.setTimeOutArr.length; i++) {
      clearTimeout(this.setTimeOutArr[i]);
    }
    // Dump array
    // the array only gets new entry in playNext()
    this.setTimeOutArr = [];
  }

  render() {
    // check if has error
    if (this.props.hasError) {
      return (
        <div
          className="movie_stage_window"
          style={{ width: '60%', height: '400px' }}
        >
          <div
            className="movie_window_decorations"
            onClick={e => { e.stopPropagation(); }}
          >
            <ErrorMessageCover
              isActive
              errorMessage={this.props.errorMessage}
            />
          </div>
        </div>
      );
    }


    // logr.warn(JSON.stringify(this.props.videoUrls));
    const v_sceneIds = this.props.videoSceneIds;

    // calc window dimension
    const stageWidth = this.state.stageDimension[0];
    const stageHeight = this.state.stageDimension[1];

    const currStripPlayback = this.getCurrStripPlayback();

    return (
      <div
        className="movie_stage_window"
        style={{ width: stageWidth, height: stageHeight }}
      >
        <ScrubberPortal>
          <Scrubber
            numTotalStrips={this.state.numTotalStrips}
            numFramesInCurrStrip={currStripPlayback ? currStripPlayback.frame_count : 0}

            currScene={this.props.currVideoIndex}
            currStrip={this.props.videoStripLocation[this.props.currVideoIndex] + this.props.currStripIndex}
            currFrame={this.state.currFrameIndex}

            orderedSceneIds={this.props.videoSceneIds}
            videoPlaybackDict={this.props.videoPlaybackDict}
          />
        </ScrubberPortal>

        <div className="movie_stack">
          {/* Make movie stack! */}
          {this.props.videoUrls.map((v, i) => {
            // if (cnst.BROWSER.isFirefox) {
            const v_webm = h.changeExtension(v, 'webm');
            return (
              <video
                id={`sc_${v_sceneIds[i]}`}
                width="100%"
                height="100%"
              >
                <source src={v} type="video/mp4" />
                <source src={v_webm} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            );
          })}

        </div>

        {/* cover for the stage window. Also acts like a "shield" to prevent
            interaction with the video element */}
        <div
          className="movie_window_decorations"
          onClick={e => { e.stopPropagation(); }}
        >
          {this.props.currVideoIndex < 0 && <InstructionStageCover />}
          <PausedStageCover isActive={this.props.isPaused} />
          <ErrorMessageCover
            isActive={this.props.hasError}
            message={this.props.errorMessage}
          />
        </div>

      </div>
    );
  }
}


class ScrubberPortal extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    const targetNode = document.querySelector('#portal_scrubber');
    if (targetNode) {
      return ReactDOM.createPortal(
        this.props.children,
        targetNode,
      );
    }

    return (null);
  }
}

class InstructionStageCover extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return (
      <div className="flipbook_player_instruction">
        <span>Use keyboard to navigate</span>
        <span>
          <span className="bigtext-2 far fa-caret-square-left" />
          <span className="bigtext-2 far fa-caret-square-right" />
        </span>
      </div>
    );
  }
}

class PausedStageCover extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return (
      <div className={'flipbook_player_paused '
                      + (this.props.isActive ? 'active' : '')}
      >
        <span className="pause_label">Rewind</span>
      </div>
    );
  }
}

function ErrorMessageCover(props) {
  console.log(props);
  return (
    <div className={'flipbook_player_error '
                    + (props.hasError ? 'active' : '')}
    >
      <span className="error_message">
        <p>
          <span className="bigtext-1 fas fa-exclamation-triangle" />
        </p>
        {props.errorMessage ? (
          <p>{props.errorMessage}</p>
        ) : (
          <p>
            Oh yikes. An error we were NOT prepared to has occurred!
          </p>
        )}
      </span>
    </div>
  );
}

export {
  FlipbookMovieStage,
  movieStage_publicFunctions,
};
