import React, { Component } from 'react';


// ████████╗██╗███╗   ███╗███████╗██████╗ 
// ╚══██╔══╝██║████╗ ████║██╔════╝██╔══██╗
//    ██║   ██║██╔████╔██║█████╗  ██████╔╝
//    ██║   ██║██║╚██╔╝██║██╔══╝  ██╔══██╗
//    ██║   ██║██║ ╚═╝ ██║███████╗██║  ██║
//    ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝

class Timer extends Component {
  constructor(props) {
    super(props);
    this.renderChildren = this.renderChildren.bind(this);
  }

  renderChildren() {
    return (
      Array.apply(null, Array(this.props.numFrames)).map((n, index) => {
        return React.cloneElement(this.props.children, {
          index: index,
          className: "frame_icon" + (index <= this.props.currFrame ? " on" : ""),
          key: { tickmark: "tickmark" + index }
        });
      })

    ); // end: return
  }

  render() {
    return (
      <div className="timer">
        {this.renderChildren()}
      </div>
    )
  }
}

export default Timer;
