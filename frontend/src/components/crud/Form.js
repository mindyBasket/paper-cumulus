import React, { Component } from "react";
import PropTypes from "prop-types";


class SceneCreateForm extends Component {

	// TODO: does this belong outside like this?
	// https://stackoverflow.com/questions/40514574/react-why-static-proptypes
 	static propTypes = {
		endpoint: PropTypes.string.isRequired
  	};

  	constructor(){
  		state = {
		    name: "",
		    email: "",
		    message: ""
		};
  	}
    
  	handleChange = e => {
    	this.setState({ [e.target.name]: e.target.value });
  	};

  	handleSubmit = e => {
    	e.preventDefault();
    	const { name, email, message } = this.state;
    	const lead = { name, email, message };
    	const conf = {
      method: "post",
      body: JSON.stringify(lead),
      headers: new Headers({ "Content-Type": "application/json" })
    };
    fetch(this.props.endpoint, conf).then(response => console.log(response));
  };

    render() {
    	const { name, email, message } = this.state;
    	return (

	        <form onSubmit={this.handleSubmit}>
	          
	          <div className="field">
	            <label className="label">Email</label>
	            <div className="control">
	              <input
	                className="input"
	                type="email"
	                name="email"
	                onChange={this.handleChange}
	                value={email}
	                required
	              />
	            </div>
	          </div>
	          <div className="field">
	            <label className="label">Message</label>
	            <div className="control">
	              <textarea
	                className="textarea"
	                type="text"
	                name="message"
	                onChange={this.handleChange}
	                value={message}
	                required
	              />
	            </div>
	          </div>
	          <div className="control">
	            <button type="submit" className="button is-info">
	              Send message
	            </button>
	          </div>
	        </form>

    );
  }
}
export default SceneCreateForm;