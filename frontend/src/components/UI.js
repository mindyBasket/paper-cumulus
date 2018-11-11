import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";




// ████████╗ ██████╗  ██████╗ ██╗     ██████╗ ████████╗███╗   ██╗
// ╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔══██╗╚══██╔══╝████╗  ██║
//    ██║   ██║   ██║██║   ██║██║     ██████╔╝   ██║   ██╔██╗ ██║
//    ██║   ██║   ██║██║   ██║██║     ██╔══██╗   ██║   ██║╚██╗██║
//    ██║   ╚██████╔╝╚██████╔╝███████╗██████╔╝   ██║   ██║ ╚████║
//    ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚═════╝    ╚═╝   ╚═╝  ╚═══╝
                                                              


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

        if (pos[0] == "inline"){
            styleDict.display = "inline-block";
        } else {
            styleDict.position = "absolute";
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
    			break;
    		case "loading":
    			this.iconClassName = "fas fa-spinner loading";
    	}

    	return (
    		<div className={"tool_btn " + this.iconClassName} 
    			 onClick={this.props.action ? this.props.action : undefined}
    			 style={this.position}></div>
    	)
    }

}






// ████████╗███████╗██╗  ██╗████████╗███████╗██╗███████╗██╗     ██████╗ 
// ╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝██╔════╝██║██╔════╝██║     ██╔══██╗
//    ██║   █████╗   ╚███╔╝    ██║   █████╗  ██║█████╗  ██║     ██║  ██║
//    ██║   ██╔══╝   ██╔██╗    ██║   ██╔══╝  ██║██╔══╝  ██║     ██║  ██║
//    ██║   ███████╗██╔╝ ██╗   ██║   ██║     ██║███████╗███████╗██████╔╝
//    ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝╚══════╝╚══════╝╚═════╝ 
                                                                     

class EditableTextField extends PureComponent{

    constructor(props){
        super(props);

        this.r_input = React.createRef();

        this.state={
            loading: false,
            editing: false
        }

        this.handle_submit = this.handle_submit.bind(this);

        this.startEditing = this.startEditing.bind(this);
        this.stopEditing = this.stopEditing.bind(this);

    }

    componentDidUpdate(prevProps, prevState, snapshot){
        // Check if field value changed
        if (prevProps.fieldValue != this.props.fieldValue){
            this.setState({editing: false, loading: false});
        }

        if (this.state.editing == false){
            console.log("Editing turned OFF for field : " + this.props.fieldLabel + " and fieldValue? : " + this.state.loading);
        } else if (this.state.editing == true ) {
            console.log("Editing turned ON for field : " + this.props.fieldLabel);
        }
    }


    handle_submit(){
        // no longer editing. Enter waiting state
        this.setState({editing: false, loading: true});

        // prep data
        let inputData = {}
        if (this.props.actionType !="refresh"){
            inputData[this.props.fieldLabel] = this.r_input.current.value;
        }

        // FrameModal's updateFrame()
        this.props.action(inputData);

    }


    startEditing(){
        this.setState({editing: true})
        console.log("Start Editing");
    }

    stopEditing(){
        this.setState({editing: false})
        console.log("You clicked on the field!");
    }
    

    render(){

        return (
            <div className={"editable_text " + (this.props.readOnly ? "read_only" : "")}>

                {this.props.fieldDisplayLabel && 
                    <span className="field_label">
                        {this.props.fieldDisplayLabel}
                    </span>
                }
                
                <input type="text" 
                       className={"field_value " + 
                                 (this.state.loading || this.props.readOnly ? "read_only " : "") + 
                                 (this.state.editing ? "editing " : "")}
                       size={this.props.widthSize}
                       defaultValue={this.props.fieldValue}
                       ref={this.r_input}
                       onFocus={this.startEditing}
                       onBlur={this.stopEditing}
                />

                {this.props.fieldUnit &&
                    <span>{this.props.fieldUnit}</span>}


                {/* render submit button. It is not visible if it is readOnly */}
                {!this.props.readOnly && 
                    (this.state.editing ? 
                        <ToolButton iconType="submit"
                                    position="inline"
                                    action={this.handle_submit}/>
                        :
                        <ToolButton iconType={(this.state.loading ? "loading" : "edit")}
                                    position="inline"/>
                    )
                }
                    
      
            </div>   
        )
    }
}






// ███████╗██╗██╗     ███████╗██████╗ ████████╗███╗   ██╗
// ██╔════╝██║██║     ██╔════╝██╔══██╗╚══██╔══╝████╗  ██║
// █████╗  ██║██║     █████╗  ██████╔╝   ██║   ██╔██╗ ██║
// ██╔══╝  ██║██║     ██╔══╝  ██╔══██╗   ██║   ██║╚██╗██║
// ██║     ██║███████╗███████╗██████╔╝   ██║   ██║ ╚████║
// ╚═╝     ╚═╝╚══════╝╚══════╝╚═════╝    ╚═╝   ╚═╝  ╚═══╝
                                                      

class FileInputButton extends Component {
     constructor(props){
        super(props);
        this.r_input = React.createRef();

        this.click_fileInput = this.click_fileInput.bind(this);
        this.handle_submitImage = this.handle_submitImage.bind(this);
    }

    click_fileInput(){
        // this.props.onClickAction may be passed. This function should
        // be called onClick
        if (this.props.onClickAction){
            this.props.onClickAction();
        }

        this.r_input.current.click();
    }

    handle_submitImage(){

        // set FrameModal's loading state
        // make self disappear
        // this.props.setState_FrameModal({imageLoading: true});
        
        // prep data
        const $fileInput = this.r_input.current;
        // note: this.r_input.current.value returns just string input. not the file. 

        const file = $fileInput.files[0]; // taking only one image at this time.
        console.log('>> file[' + 0 + '].name = ' + file.name + " : type = " + file.type);
        const allowedImageTypes = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'];
        if (!allowedImageTypes.includes(file.type)){
            console.error("Wrong file type");
            return false;
        }

        let inputData = {}
            inputData[this.props.fieldLabel] = file;

        // Before shipping it off, reset and clear
        if (this.props.off){ this.props.off(); }
        $fileInput.value = '';

        // use action function passed from FrameModal is updateFrame().
        // Make sure you pass data. 
        // TODO: make sure thsi works for either createFrame() or updateFrame()
        this.props.action(inputData);

    }




    render(){
        return (
            <div>
                <button className="action"
                        onClick={this.click_fileInput}>
                    <span className="bigtext-3 far fa-file"></span>
                    {this.props.message ? (
                        <span>{this.props.message}</span>
                        
                    ) : (
                        <span>Choose new file</span>
                    )}
                </button>
                {/* hidden input */}
                <input type="file" name="name" 
                       onChange={this.handle_submitImage}
                       style={{display:"none"}}
                       ref={this.r_input}/>
            </div>

        )
    }

}




export {
    ToolButton,
    EditableTextField,
    FileInputButton
};