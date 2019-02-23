import React, { Component } from 'react';
import PropTypes from 'prop-types';

import XhrHandler from './crud/XHRHandler';
import Logr from './tools/Logr';

const axh = new XhrHandler(); // axios helper
const logr = new Logr('VideoFeeder');

class VideoFeeder extends Component {
  static propTypes = {
    chapterId: PropTypes.number.isRequired,
    // endpoint: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
  };


  state = {
    data: [],
    loaded: false,
    children_li: null,

    placeholder: 'Video pie is baking...',
  };

  componentDidMount() {

    logr.info('Fetching video from storage...' + this.props.endpoint);

    

    // 1. Fetch list of Chapter for scene order
    axh.fetchChapter(this.props.chapterId).then(res => {
      if (res && res.data && res.data.hasOwnProperty('children_li')) {
        logr.info(`Children_li for chapter ${this.props.chapterId} retrieved: ${res.data.children_li}`);
        this.setState({children_li: res.data.children_li });

        // 2. Retrieve each video
        axh.fetchSceneList(this.props.chapterId).then(sceneLiRes => {
          if (sceneLiRes && sceneLiRes.data) {
            const scenes = sceneLiRes.data;
            // TODO: you must fill up this.state.data for this to render

            // test on ONE video
            // axh.getVideoFromStore();
          }
        });
      }
    });

    // fetch(chapterUrl)
    //   .then(response => {
    //     if (response.status !== 200) {
    //       return this.setState({ placeholder: "Something went wrong" });
    //     }
    //     return response.json();
    //   })
    //   .then(data => {
    //     if (data && data.hasOwnProperty('children_li')) {
    //       console.log(`[FrameFeeder] Chapter children_li : ${data.children_li}`);
    //       return this.setState({ children_li: data.children_li });
    //     } else {
    //       console.error("[FrameFeeder] fetched chapter is invalid");
    //     }
    //   });


    // fetch(sceneListUrl)
    //   .then(response => {
    //     if (response.status !== 200) {
    //       return this.setState({ placeholder: "Something went wrong" });
    //     }
    //     return response.json();
    //   })
    //   .then(data => {
    //     if (data) {
    //       console.log(`[FrameFeeder] Data fetched successfully.`);
    //       return this.setState({ data: data, loaded: true });
    //     } else {
    //       console.error("[FrameFeeder] fetched data is invalid");
    //     }
    //   });


  }

  render() {
    const { data, loaded, children_li, placeholder } = this.state;

    if (loaded && children_li) {
      return this.props.render({
        data: data,
        children_li: children_li,
      });
    } else {
      return (<p>{placeholder}</p>);
    }
  }
}

export default VideoFeeder;