import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import Spinner from "./../Spinner";
import { ToolButton } from "./../UI";
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
            frameObj: frameObj
        });

    } catch(err){
        console.error("Could not find FrameModal to open");
    }   
}




class EditableField extends Component{

    constructor(props){
        super(props);
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

    }

    handle_submit(){
        // no longer editing. Enter waiting state
        this.setState({editing: false, loading: true});
        this.props.action();
    }

    openEditable(){
        this.setState({editing: true})
    }

    

    render(){

        if (this.state.editing) {
            return (
                <div className="editable_field">
                    <span className="field_label">{this.props.fieldLabel}</span>
                        <div className="field_input">
                            <input type="text" value={this.props.fieldValue}/>
                            {/* submit acion */}
                            <ToolButton iconType="submit"
                                        position="top right" 
                                        action={this.handle_submit}/>
                        </div>
                </div>
            )
        } else {
            return (
                <div className={"editable_field " + (this.props.readOnly ? "read_only" : "")}>
                    <span className="field_label">{this.props.fieldLabel}</span>
                    <span className={"field_value " + ( (this.state.loading || this.props.readOnly ) ? "read_only" : "")}
                          onClick={()=>{
                            if(!this.props.readOnly && !this.state.loading) {this.openEditable();} 
                          }}>
                        
                        <span class={ this.props.contentType == "error" ? "color red" : "" }>
                            {this.props.fieldValue}
                        </span>

                        {!this.props.readOnly && 
                            <ToolButton iconType={(this.state.loading ? "loading" : "edit")}
                                        position="top right"/>}
                        
                    </span>

                </div>   
            )
        }
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

        this.refreshFrame = this.refreshFrame.bind(this);

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

    handle_submit(){

        const frame = this.state.frameObj;

        // var $frameForm = $(this);
        // var editNoteResp = window.flipbookLib.submitFormAjaxly(
        //     $(this), 
        //     '/api/frame/'+frameId+'/update/', 
        //     {'method': 'PATCH'},
        //     function(){console.log("Attempt ajax edit note");});
        // editNoteResp.success(function(data){
        //     $frameForm.find('#field_note').children('.field_value').text(data['note']);
        // });

        // make formData
        let fd = new FormData();
            fd.append("strip", this.props.stripObj.id);

        // need to get csrfToken again

        axh.editFrame(frame.id, fd, csrfToken).then(res=>{
            res.data 
        });
    }


    handle_editField(){
        
    }



    refreshFrame(){
        const frame = this.state.frameObj;
        const csrfToken = axh.getCSRFToken();
        const formData = h.makeFormData({}); // Just refreshing. No new data.

        axh.editFrame(frame.id, formData, csrfToken).then(res => {
            console.log("Frame Refreshed!")
            console.warn(JSON.stringify(res.data));

            // refresh data 
            this.setState({frameObj:res.data});

        });
    }


    render(){
        const frame = this.state.frameObj;
        console.log("[RE-RENDER] Curr obj: " + JSON.stringify(this.state.frameObj));

        return (
            <div>
            {this.state.frameObj == null ? (
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
                            <EditableField fieldLabel="Image" fieldValue={this.state.frameObj['dimension']}
                                           readOnly={true}/>
                            : 
                            <EditableField fieldLabel="Image" fieldValue="???x??? [Please resubmit to refresh]"
                                           contentType="error"
                                           action={this.refreshFrame}/>
                        }

                        <EditableField fieldLabel="Note" fieldValue={frame.note}/>
                        <EditableField fieldLabel="Ignore" fieldValue={frame.ignore}/>
                        
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