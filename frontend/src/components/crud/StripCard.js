import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Sortable } from '@shopify/draggable';
import axios from 'axios';

import { StripMenu, PopupMenuItem } from './widgets/PopupMenu';
import { FrameCard, FramePreviewCard } from './FrameCard';
import { CardCover } from './CardCover';

import { lightBox_publicFunctions as lb } from '../LightBox';
import { EditableTextField } from '../UI';
import Spinner from '../Spinner';

// Custom helpers
import Logr from '../tools/Logr';
import Helper from '../Helper';
import XhrHandler from './XHRHandler';

const logr = new Logr('StripCard');
const h = new Helper();
const axh = new XhrHandler(); // axios helper

// http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=CallOuts

//  ██████╗ █████╗ ██╗     ██╗      ██████╗ ██╗   ██╗████████╗███████╗
// ██╔════╝██╔══██╗██║     ██║     ██╔═══██╗██║   ██║╚══██╔══╝██╔════╝
// ██║     ███████║██║     ██║     ██║   ██║██║   ██║   ██║   ███████╗
// ██║     ██╔══██║██║     ██║     ██║   ██║██║   ██║   ██║   ╚════██║
// ╚██████╗██║  ██║███████╗███████╗╚██████╔╝╚██████╔╝   ██║   ███████║
//  ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝

class MenuButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
    };

    this.handle_hover = this.handle_hover.bind(this);
  }

  handle_hover() {
    if (this.props.comingSoon) {
      this.setState({ hover: true });
    }
  }

  render() {
    const hasFrames = this.props.hasFrames;
    return (
      <span
        className={this.props.iconClass + " " +
                   (hasFrames == null ? "" : (!hasFrames ? "disabled" : ""))}
        onClick={hasFrames != null && !hasFrames ? () => { } : this.props.action}
      >
        {this.props.comingSoon && (
          <span
            className={'mtooltip' + ' ' +
                       (this.state.hover ? 'active' : '')}
          >
            Coming soon
          </span>
        )}
      </span>
    )
  }
}



// ███████╗ ██████╗ ██████╗ ████████╗ █████╗ ██████╗ ██╗     ███████╗
// ██╔════╝██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗██╔══██╗██║     ██╔════╝
// ███████╗██║   ██║██████╔╝   ██║   ███████║██████╔╝██║     █████╗  
// ╚════██║██║   ██║██╔══██╗   ██║   ██╔══██║██╔══██╗██║     ██╔══╝  
// ███████║╚██████╔╝██║  ██║   ██║   ██║  ██║██████╔╝███████╗███████╗
// ╚══════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝

function initializeSortable($container, name, callback) {
  if ($container == null) { return false; }

  const frameSortable = new Sortable($container, {
    draggable: '.thumb',
    delay: 200,
    mirror: {
      appendTo: document.querySelector('body'),
      // appendTo: $container.getAttribute("class"),
      constrainDimensions: true,
    },
    scrollable: {
      speed: 0,
      sensitivity: 0,
    },
  });

  frameSortable.on('sortable:start', () => {
    // tilt the chosen
    const pickedUp = document.querySelector('.thumb.draggable-mirror');
  });

  frameSortable.on('sortable:stop', () => {
    // get new order
    const thOrder = [];
    $container.querySelectorAll('.thumb').forEach(th => {
      const thclass = th.getAttribute('class');
      const id = th.getAttribute('frameid');

      if (!thclass.includes('draggable')) {
        thOrder.push(id);
      } else if (thclass.includes('draggable-source')) {
        thOrder.push(id);
      }
    });

    logr.log(thOrder.join(','));
    callback(thOrder);

  });
}


// ███████╗████████╗██████╗ ██╗██████╗  ██████╗ █████╗ ██████╗ ██████╗
// ██╔════╝╚══██╔══╝██╔══██╗██║██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔══██╗
// ███████╗   ██║   ██████╔╝██║██████╔╝██║     ███████║██████╔╝██║  ██║
// ╚════██║   ██║   ██╔══██╗██║██╔═══╝ ██║     ██╔══██║██╔══██╗██║  ██║
// ███████║   ██║   ██║  ██║██║██║     ╚██████╗██║  ██║██║  ██║██████╔╝
// ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝      ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝

class StripCard extends PureComponent {
  constructor(props) {
    super(props);

    this.$node = React.createRef();
    this.$frameForm = document.querySelector('#frame_create_form');
    this.$lb = document.querySelector('#lightbox_bg'); // lightbox

    // Props note:
    // this.props.stripObj
    // this.props.index
    // this.setSceneDataState
    // this.props.handle_fetchScene

    this.state = {
      loadingFrames: false,

      cardCoverOn: false,
      menuOn: false,
      dragAndDropOn: false,
      previewOn: false,

      cardCover_messageType: 'default',
    }

    // List of state name that is related to modal.
    // This roster used when turning all of them off
    this.modalStateKeys = ['cardCoverOn', 'menuOn', 'dragAndDropOn'];

    this.selfSpotlighted = false; // as opposed to this.props.spotlightedAll

    this.handle_openUploadCover = this.handle_openUploadCover.bind(this);
    this.handle_deleteSceneConfirm = this.handle_deleteSceneConfirm.bind(this);
    this.handle_createFrame = this.handle_createFrame.bind(this);
    this.handle_deleteScene = this.handle_deleteScene.bind(this);
    this.handle_updateStrip = this.handle_updateStrip.bind(this);
    this.handle_frameSort = this.handle_frameSort.bind(this);
    this.handle_dragMessageToggle = this.handle_dragMessageToggle.bind(this);
    this.handle_dragAndDrop = this.handle_dragAndDrop.bind(this);

    this.handle_lambdaPie = this.handle_lambdaPie.bind(this);

    this.openMenu = this.openMenu.bind(this);
    this.openDurationField = this.openDurationField.bind(this);
    this.openPreview = this.openPreview.bind(this);

    this.endModalState = this.endModalState.bind(this); // more generic version of 'removeCardCover'
    this.setStripState = this.setStripState.bind(this); // for communication
    this.setSpotlight = this.setSpotlight.bind(this);
  }

  componentDidMount() {
    const delay = this.props.delay;
    const $node = this.$node.current;

    if (delay !== -1) { 
      // Note: decided to remove animation when it first mounts.

      const mountAnim = anime.timeline();
      mountAnim
        .add({
          targets: $node, scale: 0, duration: 0,
        })
        .add({
          targets: $node, scale: 0.5, duration: 0,
          delay: delay * 80,
        })
        .add({
          targets: $node, scale: 1, duration: 600,
          elasticity: 200,
        });
    }

    // Sortable magic
    initializeSortable(this.$node.current.querySelector('.strip_flex_container'),
      this.props.index,
      this.handle_frameSort);
  }


  // componentDidUpdate(prevProps, prevState, snapshot){
  // }


  // returns list of frame objects in order referencing children_li
  // TODO: this function doesn't consider "ignored" field of each Frame. 
  //       Updated version of function of same name [BAD. Don't leave it this way]
  //       in FlipbookPlayer.js
  reorderFrames(strip) {
    const frameIdList = strip.children_li.split(",");
    if (frameIdList == null || frameIdList === '') { return null; }

    let frameOrderedArr = Array.apply(null, Array(frameIdList.length));
    let frameLeftOver = [];

    strip.frames.forEach((f) => {
      const insertAt = frameIdList.indexOf(String(f.id));
      if (insertAt >= 0 && insertAt < frameOrderedArr.length) {
        frameOrderedArr[insertAt] = f;
      } else if (insertAt == -1) {
        // children not ref'd in children_li is just placed at the end
        frameLeftOver.push(f);
      }

    });

    if (frameLeftOver.length > 0) {
      frameOrderedArr.push(...frameLeftOver);
    }

    return frameOrderedArr;
  }


  setStripState(newState) {
    this.setState(newState);
  }


  handle_createFrame(inputData) {
    this.setState({ loadingFrames: true });

    const csrfToken = axh.getCSRFToken();
    if (!csrfToken) { return false; }

    let fd = h.makeFormData(inputData);
    fd.set("strip", this.props.stripObj.id);

    // quick validation
    if (!fd.has("frame_image")) { return false; }

    axh.createFrame(this.props.stripObj.id, fd, csrfToken).then(res => {
      if (res && res.data) {
        this.setState({ loadingFrames: false });
        this.props.handle_fetchScene();
      } else {
        console.error("Frame Create Failed");
      }

    }).catch(error => {
      console.log(error);
      // Well that didn't work!
      console.log("Something went wrong processing the response");
      this.setState({ cardCover_messageType: "frameCreateError" });
    });
  }


  // ---------------------------------------------------------------------------
  // _______ _    _ _______ __   _ _______
  // |______  \  /  |______ | \  |    |
  // |______   \/   |______ |  \_|    |

  // _     _ _______ __   _ ______         _______  ______ _______
  // |_____| |_____| | \  | |     \ |      |______ |_____/ |______
  // |     | |     | |  \_| |_____/ |_____ |______ |    \_ ______|

  // ---------------------------------------------------------------------------


  handle_deleteSceneConfirm() {
    logr.info('handle_deleteSceneCONFIRM');

    // turn on cover
    this.setState({
      cardCoverOn: true,
      cardCover_messageType: 'deleteConfirm',
      // this is a shared state between 2 CardCovers. Might be bad idea.
      // Update: unified into just ONE CardCover.
      // Note: lightBox and spotlighting is controlled inside the CardCover
    });
  }


  handle_deleteScene() {
    // DANGER ZONE!
    const strip = this.props.stripObj;

    console.log("handle_deleteScene for Strip id: " + this.props.stripObj.id);
    const csrfToken = axh.getCSRFToken();
    axh.destroyStrip(strip.id, csrfToken).then(res => {
      // Destroy successful. Re-fetch.
      console.log('[Strip destory] response came back');
      // FETCH SCENE
      this.props.handle_fetchScene();
    });
  }

  handle_updateStrip(data) {
    const strip = this.props.stripObj;
    const fd = h.makeFormData(data);
    const csrfToken = axh.getCSRFToken();

    return axh.updateStrip(strip.id, fd, csrfToken).then(res => {
      // TODO: update the field based on what comes back.
      //       For example, sending 1000000 for frame_duration will
      //       return 9999.

      if (res && res.data) {
        // FETCH SCENE
        this.props.handle_fetchScene();
      }
    });
  }


  handle_openUploadCover() {
    // turn on cover
    this.setState({
      cardCoverOn: true,
      cardCover_messageType: 'upload',
    });
  }

  handle_frameSort(idArr) {
    const strip = this.props.stripObj;
    const sortableData = { frame_ids: idArr.join(',') };
    logr.log('ready to send: ' + JSON.stringify(sortableData));

    axios({
      method: 'get',
      params: sortableData,
      url: `/flipbooks/ajax/strips/${strip.id}/sort-children/`,

    }).then(res => {
      if (res && res.data) {
        logr.log('sucessfully came back: ' + res.data.frame_ids);
        // FETCH SCENE
        this.props.handle_fetchScene();
      }
    }).catch(err => {
      logr.warn(JSON.stringify(err));
      logr.warn(err.data);
      logr.warn(err.data.status);
    })
  }

  handle_lambdaPie() {
    const strip = this.props.stripObj;
    const sceneId = strip.scene;
    logr.warn('Make Lambda Pie');
    logr.info(JSON.stringify(strip));

    // TODO: hard coding this for now, but this should be sceneid
    const testId = 70;
    
    axh.makeLambdaPie(testId).then(res => {
      // Lambda responded
      if (res) {
        logr.info('Reponse: ' + JSON.stringify(res));
      }
    });
  }

  handle_dragMessageToggle(e, on) {
    // probably already true'd by setSpotlightALL, but just in case
    e.stopPropagation();

    if (on) {
      this.setState({
        selfSpotlighted: true,
        cardCoverOn: true,
        cardCover_messageType: 'dragAndDrop',
      });
    } else {
      this.setState({
        selfSpotlighted: false, // selfSpotlightAll should keep it on
        cardCoverOn: false,
      });
    }
  }

  removeDragData(e) {
    logr.info('Drag data clean up');
    if (e.dataTransfer.items) {
      // Use DataTransferItemList interface to remove the drag data
      e.dataTransfer.items.clear();
    } else {
      // Use DataTransfer interface to remove the drag data
      e.dataTransfer.clearData();
    }
  }

  handle_dragAndDrop(e) {
    e.preventDefault();
    this.setState({ loadingFrames: true });

    if (e.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file.
      if (e.dataTransfer.items.length === 1 && e.dataTransfer.items[0].kind === 'file') { 

        const file = e.dataTransfer.items[0].getAsFile();
        logr.info(`File check: file[0].name = ${file.name}: type = ${file.type}`);

        /////// CHECKPOINT 1: image only
        const allowedImageTypes = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'];
        if (!allowedImageTypes.includes(file.type)) {
          // exit abruptly. This causes this component to remain in dragAndDrop state
          this.setState({ cardCover_messageType: 'wrongFileType' });
          return false;
        }

        const csrfToken = axh.getCSRFToken();

        /////// CHECKPOINT 2: valid CSRF token
        if (!csrfToken) {
          // exit abruptly. This causes this component to remain in dragAndDrop state.
          this.setState({ cardCover_messageType: 'invalidForm' });
          return false;
        }

        /////// Build formData and ship it off
        const fd = new FormData();
        fd.append('strip', this.props.stripObj.id);
        fd.append('frame_image', file);


        axh.createFrame(this.props.stripObj.id, fd, csrfToken).then(res => {
          if (res && res.data) {
            // stop loading state and Re-fetch scene
            this.setState({ loadingFrames: false });
            this.props.handle_fetchScene();
          } else {
            logr.warn('Invalid response for FrameCreate');
          }
        }).catch(error => {
          logr.warn(error);
          // Well that didn't work!
          logr.warn('Error while creating frame');
          this.setState({ cardCover_messageType: 'frameCreateError' });
        });

      } else if (e.dataTransfer.items.length > 1) {
        const fd_arr = [];
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          const fd = new FormData();
          fd.append('strip', this.props.stripObj.id);

          const file = e.dataTransfer.items[i].getAsFile();
          // console.log('>> file[' + i + '].name = ' + file.name + " : type = " + file.type);

          // Add only if it is a valid image file
          const allowedImageTypes = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'];
          if (allowedImageTypes.includes(file.type)) {
            fd.append('frame_image', file);
            fd_arr.push(fd);
          }
        }

        const csrfToken = axh.getCSRFToken();
        if (!csrfToken) {
          // exit abruptly. This causes this component to remain in dragAndDrop state.
          this.setState({ cardCover_messageType: 'invalidForm' });
          return false;
        }

        // recursively chain the requests
        const reqconf = [this.props.stripObj.id, csrfToken];

        const recur = frameData_arr => {
          if (frameData_arr.length === 1) { // tail
            return axh.createFrame(reqconf[0], frameData_arr[0], reqconf[1])
          }

          const curr_fd = frameData_arr.pop();
          return recur(frameData_arr).then(() => {
            this.props.handle_fetchScene();
            return axh.createFrame(reqconf[0], curr_fd, reqconf[1]);
          });

        }

        // recursion starter
        recur(fd_arr).then((res) => {
          // ALL DONE
          if (res) {
            this.props.handle_fetchScene(); // fetch one more time just in case
            this.setState({ loadingFrames: false });
          }
        }).catch(error => {
          console.log(error);
          // Well that didn't work!
          // console.log("Something went wrong processing the response");
          // this.setState({cardCover_messageType: "frameCreateError"});
        });
      }

    } else {
      // Use DataTransfer interface to access the file(s)
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        console.log('... file[' + i + '].name = ' + e.dataTransfer.files[i].name);
      }
    }

    // Pass event to removeDragData for cleanup
    this.removeDragData(e);

    // If you reached this point, then you avoided all errors from user side.

    // Close

    // [Outdated Note. setSpotlightAll is removed]
    // DragAndDrop is a bit unique in a sense that it can be initated by SceneEditor, the parent.
    // But it can still be triggered by individual StripCard.

    this.setSpotlight(false); // This doesn't turn off setSpotlightAll
    lb.pub_LightBox_off();
  }

  // ---------------------------------------------------------------------------
  // _______ _______ __   _ _     _    /  _____  _______ __   _ _______
  // |  |  | |______ | \  | |     |   /  |_____] |_____| | \  | |______ |
  // |  |  | |______ |  \_| |_____|  /   |       |     | |  \_| |______ |_____
  //                                /
  // _______ _  _  _ _____ _______ _______ _     _ _______ _______
  // |______ |  |  |   |      |    |       |_____| |______ |______
  // ______| |__|__| __|__    |    |_____  |     | |______ ______|

  // ---------------------------------------------------------------------------

  openMenu() {
    this.setState({ menuOn: true });
    // Note: because Strip Menu is nested inside this container
    //       it appear behind the next Strip container.
    //       By toggling the z-index, it is propped up to the top.
    this.$node.current.setAttribute('style', 'z-index:1000;');
    this.$node.current.setAttribute('style', '');
  }

  openDurationField() {
    logr.info('change duration');
  }

  openPreview() {
    // Play if preview already opened
    if (this.state.previewOn) {
      // Anti-pattern? Using increments to cause it to refresh every setState
      logr.info('Curr playPreviewNow count: ' + this.state.playPreviewNow);
      this.setState({ playPreviewNow: this.state.playPreviewNow ? this.state.playPreviewNow + 1 : 1 });
    } else {
      this.setState({ previewOn: true });
      // FrameStage component is set to autoplay upon mount, only when standlone
    }

  }

  setSpotlight(on) {
    // Set this component in spotlight against lightbox.
    // Due to the nature of this container, only .strip_card can do this

    // modify click event to the LightBox!
    this.props.setState_LightBox({ addToOnClick: () => { this.setSpotlight(false); } })


    if (on) {
      // console.log("setSpotlight " + on);
      this.props.setState_LightBox({ active: true });
      this.setState({ selfSpotlighted: true });
    } else {
      // console.log("setSpotlight " + on);
      this.props.setState_LightBox({ active: false });
      // might be safer to CLICK on the lightbox actually...but I don't have access to that. 

      // remove ALL modals or any callouts
      // TODO: isn't this similar to endModalState()?

      this.setState(() => {
        let st = {};
        const keys = this.modalStateKeys;
        for (let i = 0; i < keys.length; i++) {
          if (this.state.hasOwnProperty(keys[i])) {
            st[keys[i]] = false;
          }
        }
        // also remove selfSpotlight
        st.selfSpotlighted = false;
        console.warn('Ready to set state?: ' + JSON.stringify(st));

        return st;
      });
    }

    // Reset DragAndDrop CardCover's state
    // this.setState({cardCover_messageType: "default"});
  }


  // Generic function for hiding any modal or callouts
  // Use this function to end spotlighted sessions like 'cardCoverOn' or 'dragAndDropOn'

  // TODO: this function's purpose is getting reduced to just setting spotlight off and on. 
  //       CardCover and Menus are being built to take care of visibility on its own. 
  //       Well, it's not as simple. They can both be closed by external source. That's 
  //       What's causing the complexity.

  endModalState(stateName, spotlighted) {
    if (stateName === undefined || typeof stateName !== 'string') {
      console.error('[endModalState()] No valid stateName provided');
      return false;
    }

    console.log('Hiding component by state: ' + stateName);
    if (stateName !== 'All' && !this.modalStateKeys.includes(stateName)) {
      console.warn(`'${stateName}' is not found in modalStateKeys, but will try to close it anyway`);
    }

    this.setState(() => {
      const s = {};
      // TODO: WARNING, endModalState(All) is needed in setSpotlight
      //       but...this function calls setSpotlight()...infinite loop.

      if (stateName === 'All') { // --- Set EVERYTHING to false

        const keys = this.modalStateKeys;
        for (let i = 0; i < keys.length; i++) {
          if (this.state.hasOwnProperty(keys[i])) {
            s[keys[i]] = false;
          }
        }
      } else { // --------------------- Set just specified state to false
        s[stateName] = false;
      }
      // remove selfSpotlight
      s.selfSpotlighted = false;
      return s;
    });

    // Note: do not setSpotlight(false) here.
    // It should taken care of, by the component's componentDidUpdate.
  }


  // ---------------------------------------------------------------------------
  //  ______ _______ __   _ ______  _______  ______
  // |_____/ |______ | \  | |     \ |______ |_____/
  // |    \_ |______ |  \_| |_____/ |______ |    \_

  // ---------------------------------------------------------------------------

  render() {
    const strip = this.props.stripObj;
    const index = this.props.index;
    const reorderedFrames = this.reorderFrames(strip);

    const noFrames = (strip.frames == null || strip.frames.length === 0 || Object.keys(strip.frames).length === 0);

    return (

      <li
        className={'strip_card ' +
                   (this.props.spotlightedAll || this.state.selfSpotlighted ? 'spotlighted' : '')}
        stripid={strip.id}
        onDragOver={(e) => (this.handle_dragMessageToggle(e, true))}
        onDragLeave={(e) => (this.handle_dragMessageToggle(e, false))}
        onDrop={this.handle_dragAndDrop}

        ref={this.$node}
      >
        {/* Keep strip_card position:relative to allow being "highlightable"
                      as well as allowing popups and callouts to appear around it */}

        <div className="strip_flex_toolbar">
          <div className="info">
            <span className="bigtext-3">
              <span className="fas fa-film" />
              {index}
            </span>
            <span className="divider">|</span>
            <span>
              <span className="far fa-clock" />
              <EditableTextField
                fieldLabel="frame_duration"
                fieldValue={strip.frame_duration}
                fieldUnit="ms"
                widthSize="2"
                visualStyle="compact"
                action={this.handle_updateStrip}
              />
            </span>
          </div>

          <div className="tools">
            <MenuButton iconClass="menu_btn fas fa-play-circle" action={this.openPreview} hasFrames={!noFrames} />
            <MenuButton iconClass="menu_btn fas fa-plus-square" action={this.handle_openUploadCover} />
            <MenuButton iconClass="menu_btn fas fa-pen" action={() => { }} hasFrames={false} comingSoon />
            <MenuButton iconClass="menu_btn fas fa-trash" action={this.handle_deleteSceneConfirm} />
            <MenuButton iconClass="menu_btn fas fa-ellipsis-h" action={this.openMenu} />
          </div>
        </div>

        {/* List of frames in this strip */}
        <div className="strip_content">

          {/* panel for frame animation preview */}
          <FramePreviewCard
            on={this.state.previewOn}
            off={() => {
              this.endModalState('previewOn', true);
            }}
            stripObj={strip}
            playPreviewNow={this.state.playPreviewNow}
          />

          {noFrames ? (
            <div
              className="strip_flex_container"
              stripid={strip.id}
            >
              {this.state.loadingFrames ? (
                <FrameCard standby />
              ) : (
                <div className="tile empty-strip ui-state-disabled">
                  <span>No frames in this strip. Upload some!</span>
                </div>
              )}
            </div>
          ) : (
            <div
              className="strip_flex_container"
              stripid={strip.id}
            >
              {reorderedFrames.map((frame, frIndex) => (
                <FrameCard
                  frameObj={frame}
                  delay={frIndex + this.props.delay}
                  key={'frame' + frame.id}
                />
              ))}

              {this.state.loadingFrames && <FrameCard standby />}
            </div>
          )}
        </div>

        {/* Message or modals */}
        {/* <CardCover on={this.state.cardCoverOn} off={()=>{this.endModalState("cardCoverOn", true)}}
                              messageType="deleteConfirm"
                              setParentSpotlight={this.setSpotlight}
                              name="deleteConfirm"/> */}

        <CardCover
          on={this.state.dragAndDropOn || this.state.cardCoverOn}
          off={() => { this.endModalState('cardCoverOn', true) }}
          name="dragAndDrop"
          messageType={this.state.cardCover_messageType}

          setParentSpotlight={this.setSpotlight}
          handle_deleteScene={this.handle_deleteScene}
          handle_createFrame={this.handle_createFrame}
        />

        <StripMenu
          on={this.state.menuOn}
          off={() => { this.endModalState('menuOn'); }}
        >
          <PopupMenuItem action={this.handle_openUploadCover}>Add Frames</PopupMenuItem>
          <PopupMenuItem>Batch Frame Edit</PopupMenuItem>
          <PopupMenuItem action={this.handle_lambdaPie}>Lambda Test</PopupMenuItem>
          <PopupMenuItem>Copy</PopupMenuItem>
          <PopupMenuItem>Settings</PopupMenuItem>
          <PopupMenuItem action={this.handle_deleteSceneConfirm}>Delete</PopupMenuItem>
        </StripMenu>

      </li>
    )
  }
}

StripCard.propTypes = {
  stripObj: PropTypes.object.isRequired,
  delay: PropTypes.number,
  index: PropTypes.number.isRequired,
  spotlightedAll: PropTypes.func.isRequired,

  handle_fetchScene: PropTypes.func.isRequired,
  setState_LightBox: PropTypes.func.isRequired,
};

export { StripCard }