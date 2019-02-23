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
        this.setState({ children_li: res.data.children_li });

        // 2. Retrieve each video
        axh.fetchSceneList(this.props.chapterId).then(sceneLiRes => {
          if (sceneLiRes && sceneLiRes.data) {
            const scenes = sceneLiRes.data;

            // TODO: you must fill up this.state.data for this to render

            // TODO: reorder scene by children_li
            const v_urls = [];
            scenes.forEach(sc => {
              if (sc.movie_url) {
                v_urls.push(sc.movie_url);
              }
            });
            logr.info(`"Passing urls: ${v_urls}`);
            axh.convertToStoreURLs(v_urls, ['mp4']).then(resArr => {

              if (resArr && resArr.length > 0) {
                const urls = [];
                resArr.forEach(urlData => {
                  logr.info(`Pushing url ${urlData.data.url}`);
                  urls.push(urlData.data.url);
                });
                logr.warn('Setting list of url into data');
                this.setState({ data: urls, loaded: true });
              }

            });
          }
        });
      }
    });

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