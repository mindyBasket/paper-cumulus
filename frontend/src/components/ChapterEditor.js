import React, { Component, PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { SceneCreateModal } from './crud/SceneModal';
import { LightBox, lightBox_publicFunctions as lb } from './LightBox';
import Spinner from './Spinner';

// Custom helpers
import Helper from './Helper';
import XhrHandler from './crud/XHRHandler';

// DEMOONLY
import { DemoModal,DemoGuideBtn } from './demo/Demo';

const h = new Helper();
const axh = new XhrHandler(); // axios helper

// Note: Chapter editor is kept extremely minimal due to time constraint.
// 		   It only renders a single button that creates new scene. That's it.

// http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=FrameStage

// ███████╗██████╗ ██╗████████╗ ██████╗ ██████╗ 
// ██╔════╝██╔══██╗██║╚══██╔══╝██╔═══██╗██╔══██╗
// █████╗  ██║  ██║██║   ██║   ██║   ██║██████╔╝
// ██╔══╝  ██║  ██║██║   ██║   ██║   ██║██╔══██╗
// ███████╗██████╔╝██║   ██║   ╚██████╔╝██║  ██║
// ╚══════╝╚═════╝ ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝

class ChapterEditor extends Component {

  constructor(props) {
    super(props);

    this.chapter = {
      id: document.querySelector('#ref-content').getAttribute('chapterId'),
      title: document.querySelector('#ref-content').getAttribute('chapterTitle'),
    }

    // this.$node = React.createRef();

    this.state = {
      sceneCreateOn: false,
    }

    this.handle_openSceneCreateModal = this.handle_openSceneCreateModal.bind(this);

  }

  handle_openSceneCreateModal() {
    lb.pub_LightBox_addToOnClick(() => {
      this.setState({
        sceneCreateOn: false,
      });
    });

    this.setState({ sceneCreateOn: true });
  }

  render() {
    return (
      <div>
        <button 
          onClick={this.handle_openSceneCreateModal}
        >
          + <span className="fas fa-video" />
        </button>

        {/* DEMOONLY */}
        <br />
        Demo sample images:
				<br />
        <span style={{ display: 'inline-block', padding: '10px 0 0 0' }}>
          <a 
            className="a_button"
            href="https://www.dropbox.com/s/v4akkt9olj05a52/sampleImages.zip?dl=0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="bigtext-3 fas fa-file-archive" />
            <span style={{ fontSize: '0.6em' }}>Download</span>
          </a>
        </span>

        {/* DEMOONLY */}
        <DemoGuideBtn
          onAtMount={true}
          num={1}
          proxyId={"#proxy_demoguide_float"} 
        />

        {/* invisible */}
        <LightBox
          addToOnClick={this.addTo_LightBoxOnClick}
          handle_dragAndDrop={this.handle_dragAndDrop}
          setParentState={this.setParentState}
        />

        <SceneCreateModal
          on={this.state.sceneCreateOn}
          chapterObj={this.chapter}
        />

      </div>
    )
  }
}


// render flipbook
const wrapper = document.getElementById('chapter_editor_wrapper');


// const refNode = wrapper ? document.getElementById("ref").querySelector("#ref-content") : null;
// const sceneId = wrapper ? refNode.getAttribute("sceneId") : null;
wrapper ? ReactDOM.render(<ChapterEditor/>, wrapper) : null;