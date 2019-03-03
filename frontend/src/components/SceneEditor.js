import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// import FrameFeeder from './FrameFeeder';
import SceneCreateForm from './crud/Form';
import { SceneCardList } from './crud/SceneList';
import { FrameModal } from './crud/FrameModal';

import { LightBox, lightBox_publicFunctions as lb } from './LightBox';

import XhrHandler from './crud/XHRHandler';
import Helper from './Helper';
import Logr from './tools/Logr';
import Constants from './Constants';

// DEMOONLY
import { DemoGuideBtn } from './demo/Demo';

const logr = new Logr('SceneEditor');
const h = new Helper();
const axh = new XhrHandler(); // axios helper
const constants = new Constants();

logr.info('---- v0.6.3-21');

// http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=FrameStage

// ███████╗██████╗ ██╗████████╗ ██████╗ ██████╗
// ██╔════╝██╔══██╗██║╚══██╔══╝██╔═══██╗██╔══██╗
// █████╗  ██║  ██║██║   ██║   ██║   ██║██████╔╝
// ██╔══╝  ██║  ██║██║   ██║   ██║   ██║██╔══██╗
// ███████╗██████╔╝██║   ██║   ╚██████╔╝██║  ██║
// ╚══════╝╚═════╝ ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝

class SceneEditor extends Component {
  constructor(props) {
    super(props);

    this.sceneId = document.querySelector('#ref-content').getAttribute('sceneId');
    this.$node = React.createRef();
    // TODO: BAD. $lb is also referenced by each StripCards!
    // this.$lb = document.querySelector("#lightbox_bg"); //lightbox
    this.state = {
      mounted: false,

      toSceneCardList: null,
      spotlightedAll: false, // lightbox is off by default
    };

    this.setParentState = this.setParentState.bind(this);
    this.handle_dragAndDrop = this.handle_dragAndDrop.bind(this);
    this.handle_lambdaPie = this.handle_lambdaPie.bind(this);

    this.setSpotlightAll = this.setSpotlightAll.bind(this);
    this.addTo_LightBoxOnClick = this.addTo_LightBoxOnClick.bind(this);
  }

  componentDidMount() {
    // Bind entire body to prevent misfires from opening the file on the browser tab

    document.querySelector('body').ondragover = e => {
      e.preventDefault();
      // Note: it seems I need ondragover in order to preventDefault on ondrop.

      // const $body = document.querySelector('body');
      // if (!$body.className.includes("dark_justcolor")){
      // 	document.querySelector('body').className += " " + "dark_justcolor";
      // }
    };

    document.querySelector('body').ondrop = e => {
      e.preventDefault();
      logr.info('DragAndDrop Misfire: do nothing');
    };

    // temp solution for rendering a condensed version of strip-create button
    // that is outside of React component area (currently on the left sidebar)
    const condSc = document.querySelector('#condensed_strip_create');
    const formParent = document.querySelector('#condensed_sc');
    formParent.appendChild(condSc);

    // Attempt at solving issue where sibling-comp's function is set
    // as a prop before it bind(this)
    this.setState({ mounted: true });
  }

  // Function to be used by its children to communicate to parent (this)
  setParentState(newState) {
    this.setState(newState);
  }

  setSpotlightAll(on) {
    // Set ALL StripCards on spotlight.
    // For individual spotlight, see each StripCard's 'selfSpotlighted'.
    // Currently, this function is not used. Setting ALL StripCard added
    // needless complications turning spotligh on and off.

    if (on) {
      this.setState({ spotlightedAll: true });
      // this.$lb.classList.add('active');
      lb.setState_LightBox({ active: true });
    } else {
      this.setState({ spotlightedAll: false });
      // this.$lb.classList.remove('active');
      lb.setState_LightBox({ active: false });
    }
  }

  handle_dragAndDrop(on) {
    // Might get rid of this...
    if (on) {
      this.setSpotlightAll(true);
    } else {
      this.setSpotlightAll(false);
    }
  }

  handle_lambdaPie() {
    const sceneId = this.sceneId;
    logr.warn('Make Lambda Pie');

    // ////////////////////////////////////////
    // 1. Fetch scene
    //    Gather info to ship off to lambda as well as build playback info
    // ////////////////////////////////////////
    axh.fetchScene(sceneId).then(scRes => {
      if (scRes && scRes.data) {
        console.log(scRes.data);
        const sc = scRes.data;

        const orderedFrameArr = [];
        const scenePlayback = {
          movie_filename: '',
          strips: [],
        };

        // 1. sort Strip
        const stripMap = {};
        sc.strips.forEach(st => { stripMap[`strip${st.id}`] = st; }); // build map

        h.string2List(sc.children_li).forEach(stripId => {
          const targetStripKey = `strip${stripId}`;
          if (stripMap.hasOwnProperty(targetStripKey)) {
            const st = stripMap[targetStripKey];
            let visibleFrameCount = 0;
   
            // 2. sort Frame
            const frameMap = {};
            st.frames.forEach(fr => { frameMap[`frame${fr.id}`] = fr; }); // build map

            h.string2List(st.children_li).forEach(frameId => {
              const targetFrameKey = `frame${frameId}`;
              if (frameMap.hasOwnProperty(targetFrameKey)) {
                if (frameMap[targetFrameKey].ignored === false) {
                  orderedFrameArr.push(frameMap[targetFrameKey]);
                  visibleFrameCount += 1;
                }
              }
            });

            // Cases to think about;
            // 1. Empty strip -> ignored
            // 2. NON-empty strip but ALL frames are hidden -> should be ignored

            // Build playback data
            if (visibleFrameCount > 0) {
              scenePlayback.strips.push({
                frame_duration: st.frame_duration, // ms
                frame_count: visibleFrameCount,
              });
            }
          }
        });

        // Get all frame image path to ship off to Lambda
        const orderedFramePathArr = [];
        orderedFrameArr.forEach(frameObj => {
          // Note: Lambda expects frame information in this format:
          //       [ 's20/st92-0__444021504f/st92-0__444021504f.png`, ... ]
          let imgPath = frameObj.frame_image;
          if (imgPath !== '') {
            imgPath = imgPath.split(constants.MEDIA_IMAGES_URL)[1];
            orderedFramePathArr.push(imgPath);
          } else {
            orderedFramePathArr.push('');
          }
        });


        // ////////////////////////////////////////
        // 2. Send frames to Lambda to build video file!
        // ////////////////////////////////////////
        axh.makeLambdaPie(sceneId, orderedFramePathArr).then(lambdaRes => {
          if (lambdaRes && lambdaRes.data) {
            logr.info("Lambda response recieved!");
            logr.info('Response: ' + JSON.stringify(lambdaRes.data));

            // logr.info(`New video url: ${lambdaRes.data.scene_out_path}`);

            // const csrfToken = axh.getCSRFToken();
            // const movieOutputPath = lambdaRes.data.scene_out_path; // if this exists, that means video output was successful
            // // ////////////////////////////////////////
            // // 3-a. PATCH the url into movie_url field - sends out orderedFramePathArr
            // // ////////////////////////////////////////
            // axh.updateSceneMovieURL(sceneId, movieOutputPath, csrfToken).then(sceneRes => {
            //   if (sceneRes) {
            //     logr.info(JSON.stringify(sceneRes.data));
            //     logr.info(`Scene id ${sceneRes.data.scene_id} movie is updated to ${sceneRes.data.new_url}`);
            //   }
            // });

            // // ////////////////////////////////////////
            // // 3-b. Update Playback - sends out scenePlayback
            // // ////////////////////////////////////////
            // const movieFilename = movieOutputPath.split['/'].pop();
            // console.warn("Movie file name check: " + movieFilename);
            // scenePlayback.movie_filename = movieFilename; 
            // axh.addToScenePlayback(sceneId, scenePlayback, axh.getCSRFToken()).then(res => {
            //   if (res) {
            //     console.log(res.data);
            //     if (res.data.playback_status === 0) {
            //       logr.warn(`Playback for scene id=${sceneId} was malformed, so it was not updated!`);
            //     } else if (res.data.playback_status === 1) {
            //       logr.info(`Playback for scene id=${sceneId} updated successfully!`);
            //     } else {
            //       logr.warn(`Invalid response for playback returned for scene id=${sceneId}. No change was made.`);
            //     }
            //   }
            // });

          }
        });
      }
    });

    
  }


  // _______ ______  ______   _____  __   _
  // |_____| |     \ |     \ |     | | \  |
  // |     | |_____/ |_____/ |_____| |  \_|

  // _______ _     _ __   _ _______ _______ _____  _____  __   _ _______
  // |______ |     | | \  | |          |      |   |     | | \  | |______
  // |       |_____| |  \_| |_____     |    __|__ |_____| |  \_| ______|

  addTo_LightBoxOnClick() {
    // This function contain snippet of behavior that is to be
    // ADDED to default onClick event when LightBox is clicked.
    this.setSpotlightAll(false);
  }

  render() {
    return (
      <div className="scene_editor" ref={this.$node}>

        {/* list of strips */}
        <SceneCardList
          sceneId={this.sceneId}
          spotlightedAll={this.state.spotlightedAll}
          dataInbox={this.state.toSceneCardList}
          setState_LightBox={this.state.mounted ? lb.setState_LightBox : null}
        />

        <SceneCreateForm
          endpoint={`/api/scene/${this.state.sceneId}/strip/create/`}
          setParentState={this.setParentState}
        />

        {/* temp solution to put a condensed button on the left sidebar */}
        <SceneCreateForm
          endpoint={`/api/scene/${this.state.sceneId}/strip/create/`}
          setParentState={this.setParentState}
          condensed
        />

        {/* portal */}
        <FramePiePortal>
          <a
            id="proxy_make_scene"
            className="button flat"
            onClick={this.handle_lambdaPie}
          >
            Save scene
          </a>
        </FramePiePortal>

        {/* invisible */}
        <LightBox
          addToOnClick={this.addTo_LightBoxOnClick}
          handle_dragAndDrop={this.handle_dragAndDrop}
          setParentState={this.setParentState}
        />

        {/* A bit unsure where is the best place to put this */}
        <FrameModal />

        {/* DEMOONLY */}
        <DemoGuideBtn
          onAtMount
          num={3}
          proxyId="#proxy_demoguide"
        />
      </div>
    );
  }
}

class FramePiePortal extends Component {
  render() {
    // React does *not* create a new div. It renders the children into `domNode`.
    // `domNode` is any valid DOM node, regardless of its location in the DOM.
    const portal = document.querySelector('#portal_frame_pie');
    return ReactDOM.createPortal(
      this.props.children,
      portal,
    );
  }
}

// render flipbook
const wrapper = document.getElementById('scene_editor_wrapper');

// const refNode = wrapper ? document.getElementById("ref").querySelector("#ref-content") : null;
// const sceneId = wrapper ? refNode.getAttribute("sceneId") : null;
wrapper ? ReactDOM.render(<SceneEditor/>, wrapper) : null;

export {

};
