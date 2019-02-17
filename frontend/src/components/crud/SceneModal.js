import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { LightBox, lightBox_publicFunctions as lb } from '../LightBox';

// Custom helpers
import Helper from '../Helper';
import XhrHandler from './XHRHandler';

const h = new Helper();
const axh = new XhrHandler(); // axios helper


class SceneCreateModal extends PureComponent {
  constructor(props) {
    super(props);

    this.r_form = React.createRef();
    this.chapterId = document.querySelector('#ref-content').getAttribute('chapterId');
    // this.$node = React.createRef();

    this.state = {
      valid: false,

      isWorking: false,
      isError: false,
    }

    this.handle_nameChange = this.handle_nameChange.bind(this);
    this.handle_createScene = this.handle_createScene.bind(this);

    this.reset = this.reset.bind(this);
  }

  componentDidUpdate(prevProps, prevStates) {

    // check if this card was rendered to be active,
    // then control lightbox
    if (prevProps.on === false && this.props.on === true) {
      // clear any previous text
      const textFields = this.r_form.current.querySelectorAll('input[type="text"]');
      textFields.forEach((t) => {
        t.value = '';
      });

      lb.pub_LightBox_on();

    } else if (prevProps.on === true && this.props.on === false) {
      this.reset();
      lb.pub_LightBox_off();
    }
  }

  handle_nameChange() {
    const nameField = this.r_form.current.querySelector('#scene_name');

    if (nameField && nameField.value !== '') {
      this.setState({ valid: true });
    } else {
      this.setState({ valid: false });
    }
  }

  handle_createScene() {
    const chapter = this.props.chapterObj;
    const formData = h.makeFormData(h.serializeForm(this.r_form.current));
    formData.append('chapter', chapter.id);

    axh.createScene(chapter.id, formData, axh.getCSRFToken()).then(res => {
      // take the user to newly screated scene.
      // To avoid hardcoding urls, using DJang's reverse match to get the url.
      if (!res || !res.data) {
        console.error('Nothing valid returned for scene create');
        return false;
      }

      console.log(`Scene create successfull: ${JSON.stringify(res.data)}`);
      console.log(res.data.id64);

      axh.django_getSceneUrl('flipbooks:scene-edit', { pk: res.data.id64 }).then((res) => {
        if (res && res.data && res.data.hasOwnProperty('url') && res.data.url) {
          window.location.href = res.data.url;
        } else {
          this.setState({ isError: true });
          console.error('Cannot find the new Scene. Something went wrong while creating a new scene.');
        }

      });
    });
  }


  reset() {
    // resets component as if it was reinitialized
    this.setState({
      valid: false,
      isWorking: false,
      isError: false,
    });
  }

  render() {
    const chapter = this.props.chapterObj;
    return (
      <div
        id="light_box_modal"
        className={this.props.on ? 'active' : ''}
        object="scene"
      >

        <div className="header">
          <span className="bigtext-2">
            <span className="fas fa-video" />New scene</span>
          <span className="divider bigtext-3">|</span>
          <span>for {chapter.title}</span>
        </div>

        <div className="scene_form_content" ref={this.r_form}>
          <span>
            Name:
              <input id="scene_name" name="name" type="text" onChange={this.handle_nameChange} />
          </span>

          {this.state.isError ? (
            <div className="color red cb5959">
              <span className="bigtext-1 far fa-frown-open" />
              <span>
                Something went wrong. Try again later?
              </span>
            </div>
          ) : (
            <span className="align_right">
              {this.state.isWorking ? (
                <span className="bigtext-3">Working...</span>
              ) : (
                <button
                  type="button"
                  className={this.state.valid ? '' : 'disabled'}
                  onClick={(e) => {
                    this.setState({ isWorking: true });
                    this.handle_createScene();
                  }}
                >
                  Create
                </button>
              )}
            </span>
          )}
        </div>
      </div>
    )
  }
}

SceneCreateModal.propTypes = {
  on: PropTypes.bool.isRequired,
  chapterObj: PropTypes.object.isRequired,
};

export {SceneCreateModal}