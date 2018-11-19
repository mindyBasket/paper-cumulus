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
      children_li: null,

      placeholder: "Loading..."
    };

  componentDidMount() {
    console.log("[FrameFeeder] Fetching frames..." + this.props.endpoint);

    const sceneListUrl = this.props.endpoint;
    const chapterUrl = this.props.endpoint.replace("scene/all/", "");

    // 1. Fetch list of Scenes
    fetch(sceneListUrl)
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
      });

    // 2. Fetch chapter information
    fetch(chapterUrl)
      .then(response => {
        if (response.status !== 200) {
          return this.setState({ placeholder: "Something went wrong" });
        }
        return response.json();
      })
      .then(data => {
        if (data && data.hasOwnProperty('children_li')){
          console.log(`[FrameFeeder] Chapter children_li : ${data.children_li}`);
          return this.setState({ children_li: data.children_li });
        } else {
          console.error("[FrameFeeder] fetched chapter is invalid");
        }
      });



  }
  render() {

    const { data, loaded, children_li, placeholder } = this.state;

    if (loaded && children_li){
      return  this.props.render({
        data: data,
        children_li: children_li
      });
    } else {
      return (<p>{placeholder}</p>);
    }

  }
}

export default FrameFeeder;