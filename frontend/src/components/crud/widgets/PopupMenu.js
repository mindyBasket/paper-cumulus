import React, { Component } from 'react';

import Logr from '../../tools/Logr';

const logr = new Logr('PopupMenu');

// http://patorjk.com/software/taag/#p=display&f=Cyberlarge&t=PopupMenu
// ---------------------------------------------------------------------------
//  _____   _____   _____  _     _  _____  _______ _______ __   _ _     _
// |_____] |     | |_____] |     | |_____] |  |  | |______ | \  | |     |
// |       |_____| |       |_____| |       |  |  | |______ |  \_| |_____|

// ---------------------------------------------------------------------------

class PopupMenuItem extends Component {
  constructor(props) {
    super(props);

    this.r = React.createRef();
    this.blurAndAction = this.blurAndAction.bind(this);
  }

  componentDidMount() {
    this.r.current.onblur = () => {
      this.props.onBlur();
    };
  }
 
  // blur out to close the menu, and then execute whatever action
  blurAndAction(actionFunc) {
    // this.r.current.blur(); // this doesn't fire in firefox for some reason :(
    // this.handle_onBlur();

    // Forcefully remove focus
    this.props.onBlur();
    actionFunc();
  }

  render() {
    const action = this.props.action;
    if (action === undefined || action === null) {
      return (
        <li
          className="disabled wip"
        >
          <a
            href="#"
            onMouseDown={(e) => {
              e.preventDefault(); e.stopPropagation();
            }}
            onClick={(e) => {
              this.preventBlur(); this.r.current.focus();
            }}
            ref={this.r}
          >
            {this.props.children}
          </a>
        </li>
      );
    }

    return (
      <li>
        <a
          href="#"
          onMouseDown={(e) => {
            e.preventDefault(); e.stopPropagation();
          }}
          onClick={(e) => {
            this.blurAndAction(this.props.action);
          }}
          ref={this.r}
        >
          {this.props.children}
        </a>
      </li>
    );
  }
}

class PopupMenu extends Component {
  constructor(props) {
    super(props);
    this.r = React.createRef();

    this.ignoreBlur = false;

    this.preventBlur = this.preventBlur.bind(this);
    this.handle_onBlur = this.handle_onBlur.bind(this);
  }

  componentDidMount() {
    this.r.current.onblur = this.handle_onBlur;
  }

  componentDidUpdate() {
    if (this.props.on) {
      this.r.current.focus();
    }
  }

  preventBlur() {
    this.ignoreBlur = true;
  }

  handle_onBlur() {
    // logr.warn('onBlur');
    if (this.props.on) {
      if (this.ignoreBlur) {
        // logr.warn(`IGNORED BLUR, with ignoreBlur = ${this.ignoreBlur} -> False`);
        this.ignoreBlur = false; // assume next blur is not ignored
        this.r.current.focus();
      } else {
        logr.info('BLUR!');
        this.props.off();
      }
    } 
  }

  keepFocusAlive(e) {
    // Note: clicking on children of <ul> is considered of blur. Interstingly,
    //       having preventDefault() in <li> has no effect. What's with that?

    // this.ignoreBlur = true; //DON'T DO THIS
    e.preventDefault(); // You need this
  }

  render() {
    return (
      <div className={'popup_menu ' + (this.props.on ? 'active' : '')}>
        <input
          className="untouchable"
          type="text"
          ref={this.r}
          readOnly
        />
        <ul onMouseDown={this.keepFocusAlive}>
          {React.Children.map(this.props.children, child => (
            React.cloneElement(child, { 
              onBlur: this.handle_onBlur,
              preventBlur: this.preventBlur
            })
          ))}

          {/*
            <li onClick={() => { this.blurAndAction(this.props.actionOpenUpload); }}>Add Frames</li>
            <li className="disabled wip">Batch Frame Edit</li>
            <li className="disabled wip">Copy</li>
            <li className="disabled wip">Properties</li>
            <li onClick={() => { this.blurAndAction(this.props.actionDelete); }}>Delete</li>
          */}
        </ul>
      </div>
    );
  }
}

class StripMenu extends PopupMenu {
  // Currently has nothing to extend, but may in the future
}

class FramepMenu extends PopupMenu {
  // Currently has nothing to extend, but may in the future
}


export {
  PopupMenu,
  PopupMenuItem,
  StripMenu,
  FramepMenu,
}
