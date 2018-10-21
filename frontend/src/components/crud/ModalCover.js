import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";

import Spinner from "./../Spinner";

// Custom helpers
import Helper from "./../Helper"
const h = new Helper();
import XhrHandler from "./XHRHandler";
const axh = new XhrHandler(); //axios helper

class FrameImageCover extends PureComponent {

    constructor(props){
        super(props);
        this.r_input = React.createRef();


        // prop reference
        // this.props.action // handlers passed from FrameModal

        this.click_fileInput = this.click_fileInput.bind(this);
        this.handle_submitImage = this.handle_submitImage.bind(this);
        this.handle_dropImage = this.handle_dropImage.bind(this);
        // public
    }

    // componentDidUpdate(prevProps, prevState, snapshot){

    // }


    click_fileInput(){
    	this.r_input.current.click();
    }
    
    handle_submitImage(){

    	// set FrameModal's loading state
    	// make self disappear
    	this.props.setState_FrameModal({imageLoading: true});
    	
    	// prep data
    	const $fileInput = this.r_input.current;
    	// note: this.r_input.current.value returns just string input. not the file. 

    	const file = $fileInput.files[0]; // taking only one image at this time.

    	console.log('>> file[' + 0 + '].name = ' + file.name + " : type = " + file.type);

    	const allowedImageTypes = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'];
        if (!allowedImageTypes.includes(file.type)){
            // exit abruptly. This causes this component to remain in dragAndDrop state
            console.error("Wrong file type");
            return false;
        }

        let inputData = {}
            inputData[this.props.fieldLabel] = file;

        // Before shipping it off, reset and clear
        this.props.off();
        $fileInput.value = '';

        // use action function passed from FrameModal is updateFrame().
    	// Make sure you pass data. 
    	this.props.action(inputData);



    }



    handle_dropImage(){

    }

    render(){

        return (
            <div className={"cover light" + 
                            (this.props.on ? " active" : "") }
                 onDrop={(e)=>{e.preventDefault()}}
                 ref={this.r_cover}>
      			<div className="cover_message">
      				<span><button className="action"
      							  onClick={this.click_fileInput}>
      					<span className="bigtext-3 far fa-file"></span>
      					Choose new file
      				</button></span>
      				<input type="file" name="name" 
                    	   onChange={this.handle_submitImage}
                    	   style={{display:"none"}}
                    	   ref={this.r_input}/>
      				{/*<span className="bigtext-3">Or, drop image here</span>*/} 

      				<span style={{opacity:0}}>
      					<button/>
      				</span>
                    <span>
                    	<button onClick={this.props.off}>Cancel</button>
                    </span>
      			</div>
                    
            </div>
        )
    }
}



export {
    FrameImageCover
};