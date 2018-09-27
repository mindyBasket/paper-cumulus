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
    fetch(this.props.endpoint)
      .then(response => {
        if (response.status !== 200) {
          return this.setState({ placeholder: "Something went wrong" });
        }
        return response.json();
      })
      .then(data => {
        console.log("Data fetched successfully");
        console.warn(data);
        return this.setState({ data: data, loaded: true });

      }

      );
  }
  render() {
    const { data, loaded, placeholder } = this.state;
    return loaded ? this.props.render(data) : <p>{placeholder}</p>;
  }
}

export default FrameFeeder;