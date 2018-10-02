import React, { Component } from "react";
import axios from 'axios'
import PropTypes from "prop-types";


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



    handle_SceneCreate(){
      e.preventDefault();

      // this is a fuax Scene Create. Submit the REAL form on html
      const $form = this.form.$node;

      //take information from form, and submit ajaxly
      const { name, email, message } = this.state;
      const lead = { name, email, message };
      const conf = {
          method: "post",
          body: JSON.stringify(lead),
          headers: new Headers({ "Content-Type": "application/json" })
      };
    
      fetch(this.props.endpoint, conf).then(response => console.log(response));

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

            <button class="btn btn-primary btn-lg" onClick={this.handle_SceneCreate}>
              REAL Add Strip
            </button>
            
          </div>

    );
  }
}
export default SceneCreateForm;