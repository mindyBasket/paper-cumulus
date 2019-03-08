import React, { Component } from 'react';
import PropTypes from 'prop-types';

import XhrHandler from './crud/XHRHandler';
import Helper from './Helper';
import Logr from './tools/Logr';

const axh = new XhrHandler(); // axios helper
const h = new Helper();
const logr = new Logr('VideoFeeder');


/**
 * This component fetches video information and at the same time
 * rebuild the data so that the player can easily use it.
 * Notably, the scene ids become ordered before being passed into the player.
 */

class VideoFeeder extends Component {
  static propTypes = {
    chapterId: PropTypes.number.isRequired,
    // endpoint: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
  };

  state = {
    videoUrls: [],
    videoSceneIds: [], // ORDERED. Like children_li
    videoPlaybacks: [],
    loaded: false,
    showEmpty: false, 

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
            // const scenes = sceneLiRes.data;
            const orderedScenes = this.orderObj(sceneLiRes.data, orderedChildren);

            // Data to build:
            const v_urls = [];
            const v_sceneIds = [];
            const v_playbacks = {}; // key: 'scene_#', value: [] of playback for 1 STRIP
            const v_stripCumulation = []; // for each scene
            let currCumulation = 0;

            orderedScenes.forEach(sc => {
              if (sc.movie_url) {
                // TODO: validate selection of playback from the 3-story stack using movie_url
                v_urls.push(sc.movie_url);
                v_sceneIds.push(sc.id); // associate each video to this id
                // Playback stack keeps at least 3 playback history.
                // Simply grab the "latest" one for now.
                const latestPlayback = JSON.parse(sc.playback).playback_stack.pop(0);
                v_playbacks[`scene_${sc.id}`] = latestPlayback;
                v_stripCumulation.push(currCumulation);
                currCumulation += latestPlayback.strip_count; // increment for NEXT scene
              }
            });

            // logr.info(`Strip cumulation: `);
            // console.log(v_stripCumulation);

            axh.convertToStoreURLs(v_urls, ['mp4']).then(resArr => {
              if (resArr && resArr.length > 0) {
                let convertedUrls = [];
                resArr.forEach(urlData => {
                  // Note: Returning url will be '' if file not found in storage
                  // logr.info(`Pushing storage url: ${urlData.data.url}`);
                  convertedUrls.push(urlData.data.url);
                });

                // TODO: HARD CODED SOLUTION FOR LOCAL TESTING. REMOVE AFTER DONE
                // convertedUrls = [
                //   'https://s3.us-east-2.amazonaws.com/paper-cumulus-s3/media/frame_images/s70/sc-c6c1b12c94.mp4',
                //   'https://s3.us-east-2.amazonaws.com/paper-cumulus-s3/media/frame_images/s71/sc-1cbecfec76.mp4',
                // ];

                // Double check the list
                let isEmpty = true;
                for (let urlInd = 0; urlInd < convertedUrls.length; urlInd++) {
                  if (convertedUrls[urlInd] && convertedUrls[urlInd] !== '' && convertedUrls[urlInd] !== null) {
                    isEmpty = false;
                    break;
                  }
                }

                if (isEmpty) {
                  this.setState({
                    showEmpty: true,
                  });
                  return;
                }

                this.setState({
                  videoUrls: convertedUrls, // ORDERED, should be
                  videoSceneIds: v_sceneIds, // ORDERED
                  videoPlaybacks: v_playbacks, // is dictionary
                  videoStripLocation: v_stripCumulation, // ORDERED
                  // children_li: orderedChildren, // ORDERED, TODO: wait, same as videoSceneIds?
                  loaded: true,
                });

                // Notify the parent (player) with playbacks
                this.props.player_setPlayerData(orderedChildren, v_playbacks);
              } else {
                // Nothing came back. NOTE: I have not been able to trigger this part.
                logr.error('No urls converted.');
                this.setState({
                  showEmpty: true,
                });
              }
            }).catch((err) => {
              // The promise was rejected. Probably empty urls
              logr.error('Urls convertion request was rejected.');
              this.setState({
                showEmpty: true,
              });
            });
          }
        });
      }
    });
  }

  orderObj(objArr, orderedIds) {
    // convert into dictionary, hash alternative
    const objDict = {};
    objArr.forEach(obj => {
      objDict[`obj_${obj.id}`] = obj;
    });

    const orderedObjArr = [];
    orderedIds.forEach(refId => {
      // only order it if it exists in the dictionary
      if (`obj_${refId}` in objDict) {
        orderedObjArr.push(objDict[`obj_${refId}`]);
      }
    });

    return orderedObjArr;
  }

  render() {
    const {
      videoUrls,
      videoSceneIds,
      videoPlaybacks,
      videoStripLocation,

      showEmpty,
      loaded,
      placeholder,
    } = this.state;

    if (loaded && videoUrls && videoSceneIds) {
      return this.props.render({
        videoUrls: videoUrls,
        videoSceneIds: videoSceneIds,
        videoPlaybacks: videoPlaybacks,
        videoStripLocation: videoStripLocation,
      });
    }

    if (showEmpty) {
      return this.props.render({
        hasError: true,
        errorMessage: 'Missing flipbook content. Make sure you saved your scene(s), or try re-saving the rerender your flipbook.',
      });
    }

    // Data not fetched yet
    return (<p>{placeholder}</p>);
  }
}

export default VideoFeeder;
