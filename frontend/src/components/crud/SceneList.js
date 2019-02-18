import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Sortable } from '@shopify/draggable';
import axios from 'axios';

import { StripCard } from './StripCard';

import { lightBox_publicFunctions as lb } from '../LightBox';
import { EditableTextField } from '../UI';

// Custom helpers
import Helper from '../Helper';
import XhrHandler from './XHRHandler';

const h = new Helper();
const axh = new XhrHandler(); // axios helper

function pub_handle_fetchScene() {
  // bind to SceneCardList
  this.handle_fetchScene();
}

// ███████╗ ██████╗ ██████╗ ████████╗ █████╗ ██████╗ ██╗     ███████╗
// ██╔════╝██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗██╔══██╗██║     ██╔════╝
// ███████╗██║   ██║██████╔╝   ██║   ███████║██████╔╝██║     █████╗
// ╚════██║██║   ██║██╔══██╗   ██║   ██╔══██║██╔══██╗██║     ██╔══╝
// ███████║╚██████╔╝██║  ██║   ██║   ██║  ██║██████╔╝███████╗███████╗
// ╚══════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝

function initializeSortable_Scene($container, name, callback) {
  if ($container == null) { return false; }

  console.log('initialize sortable for StripCards');

  const targetName = '.strip_card';
  const StripSortable = new Sortable($container, {
    draggable: targetName,
    delay: 300,
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

  // because this takes much longer delay, add animated indicator
  // $container.querySelectorAll(targetName).forEach((stripCard)=>{

  // });

  StripSortable.on('sortable:start', (e) => {
    //tilt the chosen
    // const pickedUp = document.querySelector(targetName+'.draggable-mirror');
    const childBeingDragged = e.startContainer.querySelector(".draggable-source--is-dragging");
    if (childBeingDragged) {
      e.cancel();
    }
  });
  StripSortable.on('sortable:stop', () => {
    //get new order
    let thOrder = [];
    $container.querySelectorAll(targetName).forEach(th => {
      let thclass = th.getAttribute("class");
      let id = th.getAttribute("stripid");

      if (!thclass.includes("draggable")) {
        thOrder.push(id);
      } else if (thclass.includes("draggable-source")) {
        thOrder.push(id);
      }
    });

    console.log(thOrder.join(","));
    callback(thOrder);

  });
}


// ███████╗ ██████╗███████╗███╗   ██╗███████╗██╗     ██╗███████╗████████╗
// ██╔════╝██╔════╝██╔════╝████╗  ██║██╔════╝██║     ██║██╔════╝╚══██╔══╝
// ███████╗██║     █████╗  ██╔██╗ ██║█████╗  ██║     ██║███████╗   ██║
// ╚════██║██║     ██╔══╝  ██║╚██╗██║██╔══╝  ██║     ██║╚════██║   ██║
// ███████║╚██████╗███████╗██║ ╚████║███████╗███████╗██║███████║   ██║
// ╚══════╝ ╚═════╝╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝╚══════╝   ╚═╝

class SceneCardList extends Component {

  constructor(props) {
    super(props);
    this.r_cardContainer = React.createRef();
    this.stripCount = Number(document.querySelector('#ref-content').getAttribute('stripSetCount'));

    this.state = {
      data: null,
    };

    this.firstLoad = true;
    this.sortablified = false;

    this.handle_fetchScene = this.handle_fetchScene.bind(this);
    this.handle_stripSort = this.handle_stripSort.bind(this);

    pub_handle_fetchScene = pub_handle_fetchScene.bind(this);

    // incoming
    // this.props.toSceneCardList

  }

  componentDidMount() {
    this.handle_fetchScene();
  }

  componentDidUpdate(prevProps) {
    // Check inbox
    if (JSON.stringify(prevProps.dataInbox) != JSON.stringify(this.props.dataInbox)) {
      console.log('MAIL TIME [SceneCardList]');
      // Mail time!
      const newData = this.appendData(this.state.data, this.props.dataInbox)
      this.setState({ data: newData });
    }

    if (this.r_cardContainer.current && !this.sortablified) {
      // WEIRD: here, this.firstLoad is actually 'true'. 
      //        which is counter intuitive because this.firstLoad is set to false
      //        immediately after data is set to the state. (see handle_fetchScene())
      console.log("StripCard count: " + this.r_cardContainer.current.querySelectorAll('.strip_card').length);
      console.log(this.firstLoad);

      // Sortable magic
      initializeSortable_Scene(this.r_cardContainer.current,
        null,
        this.handle_stripSort);
      this.sortablified = true;
    }
  }

  handle_fetchScene() {
    axh.fetchScene(this.props.sceneId).then(res => {
      this.setState({ data: res.data });
      this.firstLoad = false;
    });
  }


  handle_stripSort(idArr) {
    // TODO: this function is very similar to handle_frameSort. BAD!

    const sceneId = this.props.sceneId;
    const sortableData = { strip_ids: idArr.join(',') }
    console.log('ready to send: ' + JSON.stringify(sortableData));

    axios({
      method: 'get',
      params: sortableData,
      url: `/flipbooks/ajax/scene/${sceneId}/sort-children/`

    })
      .then(response => {
        console.log('sucessfully came back: ' + response.data['strip_ids']);
      })
      .catch(err => {
        console.error(JSON.stringify(err));
        console.error(err.data);
        console.log(err.data.status);
      })
  }


  // takes only one key from newData. Rest will be ignored for now.
  static appendData(data, newData) {
    console.log('New Data looks like this: ' + JSON.stringify(newData.newStrip));

    if (newData == null || Object.keys(newData).length === 0) {
      // newData is invalid. return same data.
      return data;
    }

    switch (Object.keys(newData)[0]) {
      case 'newStrip':
        // add it to list of strips
        if (data.hasOwnProperty('strips')) { data.strips.push(newData.newStrip); }
        break;

      default:
        return data;
    }
    return data;
  }

  // returns list of frame objects in order referencing children_li

  static reorderedStrips(scene) {
    if (scene && scene.hasOwnProperty('strips') && scene.strips.length > 0) {

      const stripIdList = scene.children_li.split(',');
      if (stripIdList == null || stripIdList === '') {
        // children_li could be empty even if it has valid children
        return scene.strips;
      }

      const stripOrderedArr = Array.apply(null, Array(stripIdList.length));
      const stripLeftOver = [];

      scene.strips.forEach((st) => {
        const insertAt = stripIdList.indexOf(String(st.id));
        if (insertAt >= 0 && insertAt < stripOrderedArr.length) {
          stripOrderedArr[insertAt] = st;
        } else if (insertAt == -1) {
          // children not ref'd in children_li is just placed at the end
          stripLeftOver.push(st);
        }

      });

      if (stripLeftOver.length > 0) {
        stripOrderedArr.push(...stripLeftOver);
      }

      return stripOrderedArr;
    }

    return [];
  }


  render() {
    const reorderedStrips = this.reorderedStrips(this.state.data);

    return (
      <div>
        {this.state.data == null ? (
          <ul className="loading_strips">
            {Array.apply(null, Array(this.stripCount > 4 ? 4 : this.stripCount)).map((el, index) => {
              return <li key={index}/>;
            })}
          </ul>
        ) : (
          <ul
            className="list_strips"
            ref={this.r_cardContainer}
          >
            {reorderedStrips.map((strip, index) => {
              if (strip) {
                return (
                  <StripCard
                    stripObj={strip}
                    delay={this.firstLoad ? -1 : 1}
                    index={index + 1}
                    spotlightedAll={this.props.spotlightedAll}

                    handle_fetchScene={this.handle_fetchScene}
                    setState_LightBox={this.props.setState_LightBox}

                    key={'strip' + strip.id}
                  />
                );
              }

              return null;
            })}
          </ul>
        )}
      </div>
    ) // end: return
  } // end: render()
}


export {
  SceneCardList,
  pub_handle_fetchScene,
};
