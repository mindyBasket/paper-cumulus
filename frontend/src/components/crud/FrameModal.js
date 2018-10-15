import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import Spinner from "./../Spinner";
import { ToolButton } from "./../UI";
import { pub_handle_fetchScene } from "./Cards";
import { pub_LightBox_on, 
         pub_LightBox_off,
         pub_LightBox_addToOnClick } from "./../SceneEditor"; // TODO: move LightBox to its own module


// Custom helpers
import Helper from "./../Helper"
const h = new Helper();
import XhrHandler from "./XHRHandler"
const axh = new XhrHandler(); //axios helper


function setst_FrameModal(newState){
    this.setState(newState);
}

function pub_FrameModal_openModal(frameObj, on){
    // Can be used to close modal by passing frameObj = false
    if (!frameObj || Object.keys(frameObj).length === 0){
        on = false;
    } else {
        on = on === undefined ? true : ( on ? true : false )
    }

    try {
        this.setState({
            on: on,
            frameObj: on ? frameObj : null
        });

    } catch(err){
        console.error("Could not find FrameModal to open");
    }   
}




class EditableField extends PureComponent{

    constructor(props){
        super(props);

        this.r_input = React.createRef();

        this.state={
            loading: false,
            editing: false
        }

        this.handle_submit = this.handle_submit.bind(this);
        this.openEditable = this.openEditable.bind(this);

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

    openEditable(){
        this.setState({editing: true})

        // TODO: ref is volatile. it's unmounted constantly.
        // this.r_input.current.focus();
    }

    

    render(){

        return (
            <div className={"editable_field " + (this.props.readOnly ? "read_only" : "")}>
                <span className="field_label">
                    {this.props.fieldDisplayLabel}
                </span>
                <span className={"field_value " + 
                                 (this.state.loading || this.props.readOnly ? "read_only " : "") + 
                                 (this.state.editing ? "editing " : "")}
                      onClick={()=>{
                        if(!this.props.readOnly && !this.state.loading && !this.state.editing) {this.openEditable();} 
                      }}>
                    

                    {/* If editing mode is on*/}
                    <input type="text" defaultValue={this.props.fieldValue} ref={this.r_input}
                           style={ this.state.editing || this.state.loading ? {} : {display: "none"} }/>
                    {/* If not, just display field value */}
                    <span className={ this.props.contentType == "error" ? "color red" : "" }
                          style={ this.state.editing || this.state.loading ? {display: "none"} : {} }>
                        {this.props.fieldValue}
                    </span>


                    {/* render submit button. It is not visible if iti s readOnly */}
                    {!this.props.readOnly && 
                        (this.state.editing ? 
                            <ToolButton iconType="submit"
                                        position="top right" 
                                        action={this.handle_submit}/>
                            :
                            <ToolButton iconType={(this.state.loading ? "loading" : "edit")}
                                        position="top right"/>
                        )
                    }
                    
                </span>
            </div>   
        )
    }
}





// ███╗   ███╗ ██████╗ ██████╗  █████╗ ██╗     
// ████╗ ████║██╔═══██╗██╔══██╗██╔══██╗██║     
// ██╔████╔██║██║   ██║██║  ██║███████║██║     
// ██║╚██╔╝██║██║   ██║██║  ██║██╔══██║██║     
// ██║ ╚═╝ ██║╚██████╔╝██████╔╝██║  ██║███████╗
// ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝


class FrameModal extends Component{

    constructor(props){
        super(props);
        this.hello = "Hello! :D";
        this.state = {
            on: false,
            frameObj: null,

            // Used to reset Fields. Set immediately back to "false" after "true"
            fieldReset: false 
        }

        // this.refreshFrame = this.refreshFrame.bind(this);
        this.updateFrame = this.updateFrame.bind(this);

        setst_FrameModal = setst_FrameModal.bind(this);
        pub_FrameModal_openModal = pub_FrameModal_openModal.bind(this);
    }



    componentDidUpdate(prevProps, prevState, snapshot){
        // check if this modal was rendered to be active, 
        // then control lightbox
        if        (prevState.on == false && this.state.on == true){
            // turn on Lightbox, and bind closeModal when clicking
            pub_LightBox_on();
            pub_LightBox_addToOnClick(()=>{pub_FrameModal_openModal(false)}); 
        } else if (prevState.on == true && this.state.off == false){
            pub_LightBox_off();
        }  
    }



    // ---------------------------------------------------------------------------
    // _______ _    _ _______ __   _ _______                        
    // |______  \  /  |______ | \  |    |                           
    // |______   \/   |______ |  \_|    |                           
                                                              
    // _     _ _______ __   _ ______         _______  ______ _______
    // |_____| |_____| | \  | |     \ |      |______ |_____/ |______
    // |     | |     | |  \_| |_____/ |_____ |______ |    \_ ______|

    // ---------------------------------------------------------------------------

    updateFrame(inputData){

        if (inputData === undefined){
            console.error("inputData need to be provided to updateFrame");
            return false;
        }

        console.log("Input data provided: " + JSON.stringify(inputData));

        const frame = this.state.frameObj;
        const csrfToken = axh.getCSRFToken();
        const formData = h.makeFormData(inputData); 

        axh.editFrame(frame.id, formData, csrfToken).then(res => {
            console.log("Frame Updated!")
            console.warn(JSON.stringify(res.data));

            // refresh data and no longer loading
            setst_FrameModal({frameObj:res.data});

            //refetch scene because frame information has changed
            pub_handle_fetchScene();
        });
    }


    render(){
        const frame = this.state.frameObj;
        console.log("[RE-RENDER] Curr obj: " + JSON.stringify(this.state.frameObj));

        return (
            <div>
            {!this.state.frameObj ? (
                <p>Could not fetch frame information. Please try again.</p>
            ) : (
                <div id="light_box_modal" className={this.state.on ? "active" : ""}>

                    <div id="field_frame_image">
                                <img src={frame.frame_image}/>
                                <ToolButton iconType="edit" 
                                            position="bottom right"
                                            action={()=>{ console.log("Edit Frame Image!")} } />
                    </div>

                    <div className="frame_content">
                        
                        {/* image info */}
                        {frame.dimension != '' ? 
                            <EditableField fieldDisplayLabel="Image" 
                                           fieldValue={this.state.frameObj['dimension']}
                                           readOnly={true}/>
                            : 
                            <EditableField fieldDisplayLabel="Image" 
                                           fieldLabel="" fieldValue="???x??? [Please resubmit to refresh]"
                                           contentType="error"
                                           action={this.updateFrame} actionType="refresh"/>
                        }

                        <EditableField fieldDisplayLabel="Note" 
                                       fieldLabel="note" fieldValue={frame.note}
                                       action={this.updateFrame}/>
                        <EditableField fieldDisplayLabel="Ignored?" 
                                       fieldLabel="ignored" fieldValue={frame.ignored}
                                       action={this.updateFrame}/>
                        
                    </div>

                </div>
            )}
            </div>
        ) // end: return




    }
}



export {
    FrameModal,
    pub_FrameModal_openModal
};