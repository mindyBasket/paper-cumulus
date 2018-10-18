import React, { Component } from "react";
import axios from 'axios'
import PropTypes from "prop-types";

//helpers?
import Helper from "./../Helper"
const h = new Helper();
import XhrHandler from "./XHRHandler"
const axh = new XhrHandler(); //axios helper


class SceneCreateForm extends Component {

	// TODO: does this belong outside like this?
	// https://stackoverflow.com/questions/40514574/react-why-static-proptypes
 	static propTypes = {
		endpoint: PropTypes.string.isRequired
  	};

  constructor(props){
  	super(props);

    this.displayMsg = {ready: "component ready"}
  	this.state = {
		  field: "",
      error: false
		};

    //connect to form
    // TODO: I know this is a bad idea
    this.form = {
      $node: null,
      id: "#strip_create_form",
      $submitBtn: null
    };  

    this.handle_SceneCreate = this.handle_SceneCreate.bind(this);

  }

  componentDidMount(){
    // This component trusts a django form is properly rendered.
    this.form.$node = document.querySelector(this.form.id);
    if (this.form.$node != null){
      //grab button
      this.form.$submitBtn = this.form.$node.querySelector("button");

    } else {
      this.state.error = true;
    }

  }
    
  	handleChange(e) {
    	this.setState({ [e.target.name]: e.target.value });
  	}

    serializeForm($form){
      //make sure it's a form
      if ($form.nodeName != 'FORM'){return false}

      // iterate through each element
      // inputArray
      const ia = $form.querySelectorAll('input, select, textarea, file');
      var formData = {};

      for (var i=0;i<ia.length;i++){
        formData[ia[i].getAttribute('name')] = ia[i].value;
      }
      return formData;
    }



    handle_SceneCreate(e){
      e.preventDefault();

      // this is a fuax Scene Create. Submit the REAL form on html
      const $form = this.form.$node;
      var formData = this.serializeForm($form);

      axh.createStrip(formData.scene, formData, formData.csrfmiddlewaretoken).then(res =>{
        // Package this and sent this to SceneCard
        this.props.setParentState({toSceneCardList: {newStrip: res.data } });  
      });
   
    }

    render() {
    	const { name, email, message } = this.state;
    	return (

          <div className="fauxForm">
            {this.state.error ? (
                <span className="error">New Strip cannot be created at this time.</span>
              ) : (
                <button onClick={this.handle_SceneCreate}>
                  + Add a new Strip
                </button>
            )} 
          </div>

    );
  }
}

export default SceneCreateForm;