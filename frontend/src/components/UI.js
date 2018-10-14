import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";




class ToolButton extends Component{
	// Similar purpose to MenuButton, but these are standalone

    constructor(props){
        super(props);
        this.icon = null;
        this.position = this.makePositionStyle(this.props.position);
    }

    makePositionStyle(positionStr){
    	const pos = positionStr.split(" ");
    	let styleDict = {}

    	switch(pos[0]){
    		case "top": 
    			styleDict.top = 0;
    			break;
    		case "bottom": 
    			styleDict.bottom = 0;

    	}

    	switch(pos[1]){
    		case "left": styleDict.left = 0;
    			break;
    		case "right": styleDict.right = 0;
    	}

    	console.log(JSON.stringify(styleDict));
    	return styleDict;
    }

    render(){
    	switch(this.props.iconType){
    		case "edit": 
    			this.iconClassName = "fas fa-pen";
    			break;
    		case "submit":
    			this.iconClassName = "fas fa-check";
    	}

    	return (
    		<div className={"tool_btn " + this.iconClassName} 
    			 onClick={this.props.action ? this.props.action : undefined}
    			 style={this.position}></div>
    	)
    }

}


export {
    ToolButton
};