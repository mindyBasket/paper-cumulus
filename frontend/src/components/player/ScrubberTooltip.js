import React, { PureComponent } from 'react';

class ScrubberTooltip extends PureComponent {
  constructor(props) {
    super(props);
    // prop ref
    // this.props.position = [left, top]

    this.topMargin = 30; //px
  }

  render() {
    const pos = this.props.position;
    // console.log("[tooltip] " + pos);
    let content = this.props.content;
    if (!content || content === undefined) {
      content = null;
    } else {
      content = content.split('-');
    }

    return (
      <span
        className={"scrubber_tooltip " + (this.props.active ? "active" : "")}
        style={{ top: pos[1] + this.topMargin, left: pos[0] }}
      >
        {!content ? (
          <span>???</span>
        ) : (
          <span>
            <span className="dimmed fas fa-video" />
            {content[0]} -
            <span className="dimmed fas fa-film" />
            {content[1]}
          </span>
        )}
      </span>
    );
  }
}

export default ScrubberTooltip;
