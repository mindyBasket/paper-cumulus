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
    videoUrls: [],
    videoPlaybacks: [],
    loaded: false,
    children_li: null,

    placeholder: 'Baking video...',
  };

  componentDidMount() {

    logr.info('Fetching video from storage...' + this.props.endpoint);

    // 1. Fetch list of Chapter for scene order
    axh.fetchChapter(this.props.chapterId).then(res => {
      if (res && res.data && res.data.hasOwnProperty('children_li')) {
        logr.info(`Children_li for chapter ${this.props.chapterId} retrieved: ${res.data.children_li}`);
        this.setState({ children_li: res.data.children_li });

        // 2. Retrieve each video with its playbacks
        axh.fetchScenePlaybackList(this.props.chapterId).then(sceneLiRes => {
          if (sceneLiRes && sceneLiRes.data) {
            const scenes = sceneLiRes.data;

            // TODO: you must fill up this.state.data for this to render

            // TODO: reorder scene by children_li
            const v_urls = [];
            const v_playbacks = [];
            scenes.forEach(sc => {
              if (sc.movie_url) {
                v_urls.push(sc.movie_url);
                v_playbacks.push(JSON.parse(sc.playback)); // make sure you parse!
              }
            });
            logr.info(`"Passing stringy urls to convert to storage urls: ${v_urls}`);

            axh.convertToStoreURLs(v_urls, ['mp4']).then(resArr => {
              if (resArr && resArr.length > 0) {
                let convertedUrls = [];
                resArr.forEach(urlData => {
                  logr.info(`Pushing storage url: ${urlData.data.url}`);
                  convertedUrls.push(urlData.data.url);
                });
                logr.info('Set data');
                console.log(convertedUrls);

                // HARD CODED SOLUTION FOR LOCAL TESTING
                convertedUrls = [
                  "https://s3.us-east-2.amazonaws.com/paper-cumulus-s3/media/frame_images/s70/sc-c6c1b12c94.mp4",
                  "https://s3.us-east-2.amazonaws.com/paper-cumulus-s3/media/frame_images/s71/sc-1cbecfec76.mp4",
                ];
                this.setState({
                  videoUrls: convertedUrls,
                  videoPlaybacks: v_playbacks,
                  loaded: true,
                });

                // TODO: Uncomment this when you are on the server
                // this.setState({ data: urls, loaded: true });
              }

            });
          }
        });
      }
    });

  }

  render() {
    const {
      videoUrls,
      videoPlaybacks,
      loaded,
      children_li,
      placeholder,
    } = this.state;

    if (loaded && children_li) {
      return this.props.render({
        videoUrls: videoUrls,
        videoPlaybacks: videoPlaybacks,
        children_li: children_li,
      });
    } else {
      return (<p>{placeholder}</p>);
    }
  }
}

export default VideoFeeder;