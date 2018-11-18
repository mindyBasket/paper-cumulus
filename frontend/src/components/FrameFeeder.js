import React, { Component } from "react";
import PropTypes from "prop-types";

class FrameFeeder extends Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired
  };

  state = {
      data: [],
      loaded: false,
      placeholder: "Loading..."
    };

  componentDidMount() {
    console.log("[FrameFeeder] Fetching frames..." + this.props.endpoint);

    fetch(this.props.endpoint)
      .then(response => {
        if (response.status !== 200) {
          return this.setState({ placeholder: "Something went wrong" });
        }
        return response.json();
      })
      .then(data => {
        if (data){
          console.log(`[FrameFeeder] Data fetched successfully.`);
          return this.setState({ data: data, loaded: true });
        } else {
          console.error("[FrameFeeder] fetched data is invalid");
        }
        
      }

      );
  }
  render() {

    const { data, loaded, placeholder } = this.state;
    return loaded ? this.props.render(data) : <p>{placeholder}</p>;
  }
}

export default FrameFeeder;