import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import { pub_handle_fetchScene } from "./Cards";
import { FrameImageCover } from "./ModalCover";

import { lightBox_publicFunctions as lb } from "./../LightBox";
import Spinner from "./../Spinner";
import { ToolButton } from "./../UI";


// Custom helpers
import Helper from "./../Helper"
const h = new Helper();
import XhrHandler from "./XHRHandler"
const axh = new XhrHandler(); //axios helper


function setst_FrameModal(newState){
    this.setState(newState);
}

function pub_FrameModal_openModal(e, frameObj, on){
    if (e){ e.stopPropagation(); }
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







//http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=Fields

// ███████╗██╗███████╗██╗     ██████╗ ███████╗
// ██╔════╝██║██╔════╝██║     ██╔══██╗██╔════╝
// █████╗  ██║█████╗  ██║     ██║  ██║███████╗
// ██╔══╝  ██║██╔══╝  ██║     ██║  ██║╚════██║
// ██║     ██║███████╗███████╗██████╔╝███████║
// ╚═╝     ╚═╝╚══════╝╚══════╝╚═════╝ ╚══════╝
                                           



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
            imageLoading: false,
            on: false,
            frameObj: null,

            frameImageCoverOn: false,

            // Used to reset Fields. Set immediately back to "false" after "true"
            fieldReset: false 
        }

        this.modalStateKeys = ['frameImageCoverOn'];

        this.setState_FrameModal = this.setState_FrameModal.bind(this);
        // this.refreshFrame = this.refreshFrame.bind(this);
        this.updateFrame = this.updateFrame.bind(this);
        this.openFrameImageCover = this.openFrameImageCover.bind(this);
        this.endModalState = this.endModalState.bind(this);

        // for testing
        this.thumbnailTest = this.thumbnailTest.bind(this);

        setst_FrameModal = setst_FrameModal.bind(this);
        pub_FrameModal_openModal = pub_FrameModal_openModal.bind(this);
    }



    componentDidUpdate(prevProps, prevState, snapshot){
        // check if this modal was rendered to be active, 
        // then control lightbox
        if        (prevState.on == false && this.state.on == true){
            // turn on Lightbox, and bind closeModal when clicking
            lb.pub_LightBox_on();
            lb.pub_LightBox_addToOnClick(()=>{pub_FrameModal_openModal(null, false)}); 
        } else if (prevState.on == true && this.state.on == false){
            //lb.pub_LightBox_off();
            this.endModalState("All"); // close anything else 
        }  
    }


    setState_FrameModal(newState){
        this.setState(newState);
    }


    // http://patorjk.com/software/taag/#p=display&f=Cyberlarge&t=Render
    // ---------------------------------------------------------------------------
    // _______ _    _ _______ __   _ _______                        
    // |______  \  /  |______ | \  |    |                           
    // |______   \/   |______ |  \_|    |                           
                                                              
    // _     _ _______ __   _ ______         _______  ______ _______
    // |_____| |_____| | \  | |     \ |      |______ |_____/ |______
    // |     | |     | |  \_| |_____/ |_____ |______ |    \_ ______|

    // ---------------------------------------------------------------------------

    updateFrame(inputData){
        // inputData : just regular ol' JSON object. Will be converted into formData

        if (inputData === undefined){
            console.error("inputData need to be provided to updateFrame");
            return false;
        }

        const frame = this.state.frameObj;
        const csrfToken = axh.getCSRFToken();
        const formData = h.makeFormData(inputData); 

        axh.editFrame(frame.id, formData, csrfToken).then(res => {

            //turn off loading state, if applicable
            if (this.state.imageLoading) {this.setState({imageLoading: false});}

            if (res && res.data){
                console.log("Frame Updated!")
                // refresh data and no longer loading
                setst_FrameModal({frameObj:res.data});

                //refetch scene because frame information has changed
                pub_handle_fetchScene();

            } else {
                console.error("[updateFrame] No valid response came back");
            }
            
        });
    }

    openFrameImageCover(){
        this.setState({frameImageCoverOn: true});
    }


    thumbnailTest(){
        // Since this is more of Django test, make API call
        const frame = this.state.frameObj;

        axh.makeXHR('get', null, `/flipbooks/rh/test_thumbnail/${frame.id}/`, null).then(res=>{
            console.log("You came back!: " + JSON.stringify(res.data));
        });

    }






    // Slightly striped down version of "endModalState" in StripCard
    endModalState(stateName){
        if (stateName === undefined || typeof stateName != "string" ){
            console.error("[endCoverState()] No valid stateName provided");
            return false;
        }

        if (stateName != "All" && !this.modalStateKeys.includes(stateName)){
            console.warn(`[endCoverState()] '${stateName}' is not found in modalStateKeys, but will try to close it anyway`);
        }

        this.setState(()=>{
            let s={};
            // TODO: WARNING, endModalState(All) is needed in setSpotlight
            //       but...this function calls setSpotlight()...infinite loop.

            if (stateName === "All") { // --- Set EVERYTHING to false
                const keys = this.modalStateKeys;
                for (var i=0; i<keys.length; i++) {
                    if (this.state.hasOwnProperty(keys[i])) {
                        s[keys[i]] = false;
                    }
                }
            } else { // --------------------- Set just specified state to false
                s[stateName] = false; 
            }
            // remove selfSpotlight
            s.selfSpotlighted = false;
            return s;
        });

        // Note: do not setSpotlight(false) here. 
        // It should taken care of, by the component's componentDidUpdate.
        
  
    }






    // ---------------------------------------------------------------------------
    //  ______ _______ __   _ ______  _______  ______
    // |_____/ |______ | \  | |     \ |______ |_____/
    // |    \_ |______ |  \_| |_____/ |______ |    \_
    //
    // ---------------------------------------------------------------------------                                   


    render(){
        const frame = this.state.frameObj;
        // console.log("[FRAME MODAL RE-RENDER] Curr obj: " + JSON.stringify(this.state.frameObj));

        return (
            <div>
            {!this.state.frameObj ? (
                <div id="light_box_modal" className={this.state.on ? "active" : ""}>
                    <p>Could not fetch frame information. Please try again.</p>
                </div>
            ) : (
                <div id="light_box_modal" className={this.state.on ? "active" : ""}>

                    <div id="field_frame_image">

                        <img src={frame.frame_image}/>

                        <span className="float_btn fas fa-times">
                        </span>

                        <ToolButton iconType="edit" 
                                    position="bottom right"
                                    action={this.openFrameImageCover} />

                        {this.state.imageLoading && 
                            <Spinner style="dark" 
                                 bgColor={"#ffffffa8"}
                                 spinnerStyle={`width: 50px; height: 50px;`}
                                 />
                        }
                        


                        <FrameImageCover on={this.state.frameImageCoverOn}
                                         off={()=>{this.endModalState("frameImageCoverOn")}}
                                         setState_FrameModal={this.setState_FrameModal}
                                         fieldLabel="frame_image"
                                         action={this.updateFrame}/>

                    </div>

                    <div className="frame_content">
                        <span>
                            <span className="bigtext-3 fas fa-sticky-note"></span>
                            Frame [{frame.id}]
                        </span>

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

                        {/*<EditableField fieldDisplayLabel="Ignored?" 
                                       fieldLabel="ignored" fieldValue={frame.ignored}
                                       action={this.updateFrame}/>*/}

                        {/*<button onClick={this.thumbnailTest}>Do that thumbnail thing</button>*/}
                        
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