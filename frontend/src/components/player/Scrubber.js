import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Timer from './Timer';
import ScrubberTooltip from './ScrubberTooltip';

import Logr from '../tools/Logr';
import Helper from '../Helper';
import Constants from '../Constants';

const logr = new Logr('Scrubber');
const h = new Helper();
const cnst = new Constants();

const scrubber_publicFunctions = {

  // Bind to MovieStage
  scrubber_setFrameIndex: function (currFrameIndex) {
    this.setData(data);
  },

}

// alias
const scbr = scrubber_publicFunctions;

// ███████╗ ██████╗██████╗ ██╗   ██╗██████╗ ██████╗ ███████╗██████╗
// ██╔════╝██╔════╝██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔════╝██╔══██╗
// ███████╗██║     ██████╔╝██║   ██║██████╔╝██████╔╝█████╗  ██████╔╝
// ╚════██║██║     ██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔══╝  ██╔══██╗
// ███████║╚██████╗██║  ██║╚██████╔╝██████╔╝██████╔╝███████╗██║  ██║
// ╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝

class Scrubber extends PureComponent {
  constructor(props) {
    super(props);

    // These states are unknown until FrameStage is mounted
    this.state = {
      data: null, // TODO: passed from FrameStage. I know. It's bad.

      numFrames: 0,
      currFrame: -1,

      numStrips: 0,
      // currStrip: -1,

      numLoadedScene: 0,

      tooltipActive: false,
      tooltipContent: null,
      tooltipPos: [0, 0],

    }

    this.numTotalStrips = 0;

    this.callTooltip = this.callTooltip.bind(this);
    this.outTooltip = this.outTooltip.bind(this);
  }

  callTooltip(e) {
    const el = e.target;
    // console.log(`Cell pos?: x: ${el.offsetTop}, y: ${el.offsetLeft}`);
    this.setState({
      tooltipActive: true,
      tooltipContent: el.getAttribute('stamp'),
      tooltipPos: [el.offsetLeft, el.offsetTop],
    });
  }

  outTooltip(e) {
    this.setState({ tooltipActive: false });
  }

  render() {
    // get number of loaded strip
    // let loadedStripCount = 0;
    // // const el_scene = document.querySelectorAll('.scene');
    // if (this.props.numLoadedScene) {
    //   for (let i = 0; i < this.props.numLoadedScene; i++) {
    //     loadedStripCount += el_scene[i].querySelectorAll('.strip').length;
    //   }
    // }

    // HARD CODE FOR NOW
    const loadedStripCount = 2;

    const playbackDict = this.props.videoPlaybackDict;

    // NOTE: things that needs to be ordered for scrubber:
    //       [o] Scenes, [o] Strips, [x] Frames

    const cellStep = this.props.numTotalStrips > 0 ? (100 / this.props.numTotalStrips) : 0;
    const frameLocation = this.props.numFramesInCurrStrip > 0 ? (this.props.currFrame + 1) / this.props.numFramesInCurrStrip : 0;

    // logr.warn("Curr frame index: " + this.props.currFrame);

    return (
      <div className="frame_scrubber">
        <div className="scrubber">
          {/*
          <div
            className="cell_fill loaded"
            style={{
              width: (loadedStripCount) * (100 / this.state.numStrips) + "%"
            }}
          />
          */}

          {/* Fill cells up to your current "timestamp" */}
          <div
            className="cell_fill"
            style={{
              width: `${((this.props.currStrip) * cellStep + cellStep * frameLocation)}%`,
            }}
          />

          {/* Method 2: map it directly */}
          <div className="cell_container">

            {/* Mapping over an array generated on the fly */}
            {/* Array.apply(null, Array(this.state.numStrips)).map((n,index) => (
              <div className="cell"/>
            )) */}

            {playbackDict ? (
              this.props.orderedSceneIds.map((scId, ind_sc) => {
                const scKey = `scene_${scId}`;
                if (scKey in playbackDict) {
                  return playbackDict[scKey].strips.map((st, ind_st) => (
                    <div
                      className="cell"
                      onMouseEnter={this.callTooltip}
                      onMouseOut={this.outTooltip}
                      stamp={`${ind_sc + 1}-${ind_st + 1}`}
                      key={{ cell: `${ind_sc}-${ind_st}` }}
                    />
                  ));
                }
                // scene not found in playback. Skip entirely.
                return false;
              })
            ) : (
              <div className="cell" />
            )}
          </div>
        </div>

        {/* Method 1: clone children prop */}
        <Timer
          numFrames={this.props.numFramesInCurrStrip}
          currFrame={this.props.currFrame}
        >
          <span className="frame_icon" />
        </Timer>

        <ScrubberTooltip
          position={this.state.tooltipPos}
          content={this.state.tooltipContent}
          active={this.state.tooltipActive}
        />

      </div>
    ); // end: return
  }
}

export {
  scrubber_publicFunctions,
  Scrubber,
};
