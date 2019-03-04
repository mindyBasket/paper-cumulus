import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Logr from '../tools/Logr';
import Helper from '../Helper';
import Constants from '../Constants';

const logr = new Logr('MovieStage');
const h = new Helper();
const cnst = new Constants();

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
  };

  static defaultProps = {
  }

  constructor(props) {
    super(props);
    this.state = {};

    // NOT a state
    this.currStripTime = 0; // sec
    this.setTimeOutArr = [];

    this.gotoStrip = this.gotoStrip.bind(this);
    this.killSetTimeOut = this.killSetTimeOut.bind(this);

  }

  componentDidUpdate(prevProps) {
    // Switch to current scene video
    const scIds = this.props.videoSceneIds;
    const currIndex = this.props.currVideoIndex;
    const currStripIndex = this.props.currStripIndex;
    const currSceneId = scIds[currIndex];
    const currVideo = document.querySelector(`.movie_stack #sc_${currSceneId}`);

    if (currVideo) {
      currVideo.scrollIntoView(true);
    } else {
      logr.error(`Video for scene id=${currSceneId} not found.`);
    }

    // Switch to current strip (section of video)
    // TODO: This seem horribly inefficient...You are doing this every key press.
    //       It would be better if "frameCounts" were already gathered by the api
    if (prevProps.currStripIndex !== currStripIndex) {
      this.gotoStrip(currVideo, currSceneId, currStripIndex);

      // Make timeline
      // Playing SHOULD happen here, and utilize killSetTimeout.
      const currScenePlayback = this.props.videoPlaybackDict[`scene_${currSceneId}`];
      const frameCount = Number(currScenePlayback.strips[currStripIndex].frame_count);
      let frameDuration = Number(currScenePlayback.strips[currStripIndex].frame_duration);
      frameDuration = frameDuration || T_STEP;

      for (let i = 1; i < frameCount; i++) {
        // Add reference to stop it later
        this.setTimeOutArr.push(
          setTimeout(this.gotoFrame.bind(this, currVideo, i), i * frameDuration)
        );
      }
    } 
  }

  gotoStrip(currVideo, currSceneId, currStripIndex) {
    this.killSetTimeOut();

    if (currVideo) {
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
        currVideo.currentTime = frameCountPassed + 0.5; // 0.5 makes sure it's inside the frame
      } catch (err) {
        logr.error('Error while calculating strip time location');
      }
    }
  }

  gotoFrame(currVideo, currFrameIndex) {
    // animate frame (if warrents it)
    // It simply adds to currStripTime.
    // If currFrameIndex=0, that's same as head of strip
    // Note: frame and strip would never update {together.
    if (currVideo) {
      currVideo.currentTime = this.currStripTime + currFrameIndex + 0.5;
      console.log("Frame timestamp: " + this.currStripTime + " + " + currFrameIndex);
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

      </div>
    );
  }
}


export {
  FlipbookMovieStage
};