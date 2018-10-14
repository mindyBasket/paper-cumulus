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
            editing: false
        }

        this.openEditable = this.openEditable.bind(this);

    }

    openEditable(){
        this.setState({editing: true})
    }

    render(){
        return (
            <div className="editable_field">
                <span className="field_label">{this.props.fieldLabel}</span>

                {this.state.editing ? (
                    <div className="field_input">
                        <input type="text" defaultValue={this.props.fieldValue}/>
                        <span>Editing...</span>
                        <ToolButton iconType="submit" position="top right" 
                                    action={this.props.action}}/>
                    </div>
                    
                ) : (
                    <span className="field_value" onClick={this.openEditable}>
                        {this.props.fieldValue}
                        <ToolButton iconType="edit" position="top right"/>
                    </span>
                )}
                
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
            frameObj: null
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
        console.log("Refreshing frame...");
        const frame = this.state.frameObj;
        const csrfToken = axh.getCSRFToken();
        const formData = h.makeFormData({});

        axh.editFrame(frame.id, formData, csrfToken).then(res => {
            console.log("Frame Refreshed!")
            console.warn(JSON.stringify(res.data));

            // refresh data 
            this.setState({frameObj:res.data});
        });
    }


    render(){
        const frame = this.state.frameObj;
        return (
            this.state.frameObj ? (
                <div id="light_box_modal" className={this.state.on ? "active" : ""}>

                    <div id="field_frame_image">
                                <img src={frame.frame_image}/>
                                <ToolButton iconType="edit" 
                                            position="bottom right"
                                            action={()=>{ console.log("Edit Frame Image!")} } />
                    </div>

                    <div className="frame_content">
                        
                        {/* image info */}
                        {frame.dimension ? 
                            <EditableField fieldLabel="Image" fieldValue={frame.dimension}/>
                            : 
                            <EditableField fieldLabel="Image" fieldValue="???x???"
                                           action={this.refreshFrame}/>
                        }
     
                        


                        <EditableField fieldLabel="Note" fieldValue={frame.note}/>
                        <EditableField fieldLabel="Ignore" fieldValue={frame.ignore}/>
                        
                    </div>

                </div>
            ) : (
                false
            )
        ) // end: return




    }
}



export {
    FrameModal,
    pub_FrameModal_openModal
};