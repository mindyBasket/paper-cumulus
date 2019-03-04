import React, { Component } from 'react';
import PropTypes from 'prop-types';

import XhrHandler from './crud/XHRHandler';
import Helper from './Helper';
import Logr from './tools/Logr';

const axh = new XhrHandler(); // axios helper
const h = new Helper();
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
    axh.fetchChapter(this.props.chapterId).then(chapterRes => {
      if (chapterRes && chapterRes.data && chapterRes.data.hasOwnProperty('children_li')) {
        logr.info(`Children_li for chapter ${this.props.chapterId} retrieved: ${chapterRes.data.children_li}`);

        // TODO: does this need to be here?
        // Note: Initially I had it here because I was going to reorder the strips
        //       based on children_li, but playback information is dictionary now. No need to sort.
        // Note: children_li in the response will be STRING, not an array
        //       this is placed into setState() down below
        const orderedChildren = h.string2List(chapterRes.data.children_li);

        // 2. Retrieve each video with its playbacks
        axh.fetchScenePlaybackList(this.props.chapterId).then(sceneLiRes => {
          if (sceneLiRes && sceneLiRes.data) {
            const scenes = sceneLiRes.data;

            // TODO: you must fill up this.state.data for this to render

            // TODO: reorder scene by children_li
            const v_urls = [];
            const v_sceneIds = [];

            const v_playbacks = {}; // key: 'scene_#', value: [] of playback for 1 STRIP
            scenes.forEach(sc => {
              if (sc.movie_url) {
                // TODO: validate selection of playback from the 3-story stack using movie_url
                v_urls.push(sc.movie_url);
                v_sceneIds.push(sc.id); // associate each video to this id
                // Playback stack keeps at least 3 playback history.
                // Simply grab the first one for now.
                v_playbacks[`scene_${sc.id}`] = JSON.parse(sc.playback).playback_stack[0];
              }
            });
            logr.info(`"Passing stringy urls to convert to storage urls: ${v_urls}`);

            axh.convertToStoreURLs(v_urls, ['mp4']).then(resArr => {
              if (resArr && resArr.length > 0) {
                let convertedUrls = [];
                resArr.forEach(urlData => {
                  // Note: Returning url will be '' if file not found in storage
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
                  videoSceneIds: v_sceneIds,
                  videoPlaybacks: v_playbacks,
                  children_li: orderedChildren,
                  loaded: true,
                });

                // Notify the parent (player) with playbacks
                this.props.player_setPlayerData(orderedChildren, v_playbacks);

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
      videoSceneIds,
      videoPlaybacks,
      loaded,
      children_li,
      placeholder,
    } = this.state;

    if (loaded && children_li && videoUrls && videoSceneIds) {
      return this.props.render({
        videoUrls: videoUrls,
        videoSceneIds: videoSceneIds,
        videoPlaybacks: videoPlaybacks,
        children_li: children_li,
      });
    } else {
      return (<p>{placeholder}</p>);
    }
  }
}

export default VideoFeeder;