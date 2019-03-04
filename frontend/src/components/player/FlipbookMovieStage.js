import React, { Component } from 'react';
import PropTypes from 'prop-types';

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

class FlipbookMovieStage extends Component {
  static propTypes = {
    videoUrls: PropTypes.array.isRequired,
    videoSceneIds: PropTypes.array.isRequired,
    videoPlaybackDict: PropTypes.array.isRequired,
    children_li: PropTypes.array.isRequired,
    // handle_fetchScene: PropTypes.func.isRequired,
    // setState_LightBox: PropTypes.func.isRequired,
    currVideoIndex: PropTypes.number,
    currStripIndex: PropTypes.number,
    currFrameIndex: PropTypes.number,

    isPaused: PropTypes.bool,
  };

  static defaultProps = {
  }

  constructor(props) {
    super(props);
    this.state = {};

    // NOT a state
    this.currStripTime = 0; // sec
    this.setTimeOutArr = [];
    this.currVideo = null;

    this.getCurrSceneId = this.getCurrSceneId.bind(this);
    this.gotoStrip = this.gotoStrip.bind(this);
    this.playFrame = this.playFrame.bind(this);
    this.gotoFrame = this.gotoFrame.bind(this);
    this.killSetTimeOut = this.killSetTimeOut.bind(this);

    // pub bind
    mStage.mStage_playFrame = mStage.mStage_playFrame.bind(this);
    mStage.mStage_gotoStrip = mStage.mStage_gotoStrip.bind(this);
  }

  componentDidUpdate(prevProps) {
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
      this.currVideo.scrollIntoView(true);
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


  getCurrSceneId() {
    const scIds = this.props.videoSceneIds;
    const currIndex = this.props.currVideoIndex;
    return scIds[currIndex];
  }

  gotoStrip(newStripIndex) {

    const currSceneId = this.getCurrSceneId();
    const currStripIndex = newStripIndex || this.props.currStripIndex;
    
    this.killSetTimeOut();

    if (this.currVideo) {
      try {
        // make array of frame nums
        const frameCounts = [];
        this.props.videoPlaybackDict[`scene_${currSceneId}`].strips.forEach((st) => {
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
    // Make timeline
    // Playing SHOULD happen here, and utilize killSetTimeout.
    const scIds = this.props.videoSceneIds;
    const currIndex = this.props.currVideoIndex;
    const currStripIndex = this.props.currStripIndex;
    const currSceneId = scIds[currIndex];
    const currScenePlayback = this.props.videoPlaybackDict[`scene_${currSceneId}`];

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
    // logr.warn(JSON.stringify(this.props.videoUrls));
    const v_sceneIds = this.props.videoSceneIds;
    // calc window dimension
    const width = `${100}%`;
    const height = `${100}%`;

    return (
      <div
        className="movie_stage_window"
        width={width}
        height={height}
      >
        {/* <div>Children_li: {this.props.children_li}</div> */}

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
                controls
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
          {this.props.isPaused && <PausedStageCover />}
          
        </div>

      </div>
    );
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
      <div className="flipbook_player_paused">
        <span>Paused</span>
      </div>
    );
  }
}

export {
  FlipbookMovieStage,
  movieStage_publicFunctions,
};