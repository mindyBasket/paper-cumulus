import React, { Component } from "react";
import axios from 'axios'
import PropTypes from "prop-types";

//helpers?
import Helper from "./../Helper"
const h = new Helper();



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

      console.log("formData: " + JSON.stringify(formData));

      //take information from form, and submit ajaxly
      // axios({
      //   method: 'post',
      //   url: `/api/scene/${formData.scene}/strip/create/`,
      //   data: formData,
      //   headers: {"X-CSRFToken": formData.csrfmiddlewaretoken},
      // })
      // .then(response => {
      //   console.log("SceneCreate successful: " + JSON.stringify(response));
      // })
      // .catch(error => {
      //   console.log(error);
      // })

      // Package this and sent this to SceneCard
      // because of the way this gets sent to SceneCard, it be different from prev data.  
      // The only thing making this data unique is "id", and I am wary of 
      // relying on it. I may implement custom id later. 

      // So I add extra random string. It just needs to be different from the previous.
      const newStrip = {id:74,scene:1,order:0,description:"",children_li:"",frames:[]};

      newStrip['key'] = h.getRandomStr(7);
      this.props.setParentState({toSceneCardList: {newStrip: newStrip } });
          
    }

    render() {
    	const { name, email, message } = this.state;
    	return (

          <div className="fauxForm">
            {/*<form onSubmit={this.handleSubmit}>
            </form>*/}
            {this.state.error == false && 
              <span className="msg">FauxForm ready</span>
            }
            {this.state.error &&
              <span className="error">SOMETHING WENT WRONG</span>
            }

            <button className="btn btn-primary btn-lg" onClick={this.handle_SceneCreate}>
              REAL Add Strip
            </button>
            
          </div>

    );
  }
}

export default SceneCreateForm;