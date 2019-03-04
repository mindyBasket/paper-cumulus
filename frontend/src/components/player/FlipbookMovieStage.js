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
    videoPlaybacks: PropTypes.array.isRequired,
    children_li: PropTypes.array.isRequired,
    // handle_fetchScene: PropTypes.func.isRequired,
    // setState_LightBox: PropTypes.func.isRequired,
    currScene: PropTypes.number
  };

  static defaultProps = {
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    // logr.warn(JSON.stringify(this.props.videoUrls));

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
          {this.props.videoUrls.map(v => {
            // if (cnst.BROWSER.isFirefox) {
            const v_webm = h.changeExtension(v, 'webm');
            return (
              <video
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