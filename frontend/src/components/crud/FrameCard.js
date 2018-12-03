import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import { Sortable } from '@shopify/draggable';
import Spinner from "./../Spinner";
import { MenuButton } from "./../UI";

import { FrameWindow } from "./../FlipbookPlayer";
import { pub_handle_fetchScene } from "./Cards";
import { pub_FrameModal_openModal } from "./FrameModal";
import FrameFeeder from "./../FrameFeeder";
import { FrameStage } from "./../FlipbookPlayer";


// Custom helpers
import Helper from "./../Helper"
const h = new Helper();
import XhrHandler from "./XHRHandler"
const axh = new XhrHandler(); //axios helper







// http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=popup%0Amenu

// ██████╗  ██████╗ ██████╗ ██╗   ██╗██████╗ 
// ██╔══██╗██╔═══██╗██╔══██╗██║   ██║██╔══██╗
// ██████╔╝██║   ██║██████╔╝██║   ██║██████╔╝
// ██╔═══╝ ██║   ██║██╔═══╝ ██║   ██║██╔═══╝ 
// ██║     ╚██████╔╝██║     ╚██████╔╝██║     
// ╚═╝      ╚═════╝ ╚═╝      ╚═════╝ ╚═╝     
                                          
// ███╗   ███╗███████╗███╗   ██╗██╗   ██╗    
// ████╗ ████║██╔════╝████╗  ██║██║   ██║    
// ██╔████╔██║█████╗  ██╔██╗ ██║██║   ██║    
// ██║╚██╔╝██║██╔══╝  ██║╚██╗██║██║   ██║    
// ██║ ╚═╝ ██║███████╗██║ ╚████║╚██████╔╝    
// ╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝     
                                          

class FrameMenu extends Component {
   	// TODO: this is extremely similar to StripMenu...
   	//		 Everything is the same except the render

    constructor(props){
        super(props);
        this.r = React.createRef();

        this.ignoreBlur = false;
        this.refocus = this.refocus.bind(this);
        this.blurAndAction = this.blurAndAction.bind(this);
    }

    componentDidMount(){ 
        this.r.current.onblur = (e) => {
            if(this.props.on){
                if (this.ignoreBlur){
                    this.ignoreBlur = false; 
                    this.r.current.focus();
                    //blur will potentially not be ignored the next click
                } else {
                    this.props.off();
                }
            }
        };
    }
    componentDidUpdate(prevProps, prevState, snapshot){
        if (this.props.on){ this.r.current.focus() } //focus on
    }
    
    // if any element inside the menu is clicked focus on
    refocus(e){
        // any focuses immediately blurred out. See .focus() line in r.current.onblur
            //this.r.current.focus(); 
        this.ignoreBlur = true; // will briefly protect from being blurred
    }

    //blur out to close the menu, and then execute whatever action 
    blurAndAction(e,actionFunc){
        e.stopPropagation();
        this.r.current.blur();
        actionFunc();
    }

    render (){
        return (
            <div className={"popup_menu " + (this.props.on ? "active" : "")}>
                <input className="untouchable" type="text" 
                       ref={this.r} 
                       readOnly  />
                <ul onMouseDown={this.refocus}>
                    <li><span className="bigtext-3 fas fa-sticky-note"></span> Detail</li>
                    <li onClick={(e)=>{this.blurAndAction(e,this.props.actionDelete)}}>Delete</li>
                </ul>
            </div>
        )
    }
}







// ███████╗██████╗  █████╗ ███╗   ███╗███████╗██████╗ ██████╗ ██╗   ██╗██╗███████╗██╗    ██╗
// ██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝██╔══██╗██╔══██╗██║   ██║██║██╔════╝██║    ██║
// █████╗  ██████╔╝███████║██╔████╔██║█████╗  ██████╔╝██████╔╝██║   ██║██║█████╗  ██║ █╗ ██║
// ██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝  ██╔═══╝ ██╔══██╗╚██╗ ██╔╝██║██╔══╝  ██║███╗██║
// ██║     ██║  ██║██║  ██║██║ ╚═╝ ██║███████╗██║     ██║  ██║ ╚████╔╝ ██║███████╗╚███╔███╔╝
// ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝ ╚══╝╚══╝ 
                                                                                         

class FramePreviewCard extends Component{

    constructor(props){
        super(props);

        this.errorMessage = "Strip could not be initialized.";

        // TODO: isError is currently being used like a regular property.
        //       Does it have to be a state??
        this.state={
            isError: false
        }

        this.showError = this.showError.bind(this);
    }

    // componentDidUpdate(prevProps, prevState, snapshot){
    //     console.warn("[FRAME PREVIEW UPDATE]");
    // }

    showError(msg){
        // Note: Not a robust error msg function. Do not use outside of render().
        this.state.isError = true; //NO RERENDER
        this.errorMessage = msg;

    }


    render(){
        // it expects it in a form of Scene data. So like this 
        // {"strips": [ {stripObj}, {stripObj}, {stripObj} ]}
        let data = {strips: [this.props.stripObj]}; 
            //data = h.reorderFrames(data);

        const strip = this.props.stripObj;
        
        // Calc width and height of frame window based on first frame
        const defaultWidth = 450; //px
        let height = 100; //px default height
        if (!strip.frames || strip.frames.length <= 0){
            this.errorMessage = "No frames to play in this strip. Add some!";
            this.state.isError = true; //NO UPDATE
        } else {
            // this comes out EMPTY because the dimension is not initialized. 
            // TODO: can it request on demand?
            const di_str = this.props.stripObj.frames[0].dimension;
            const di = di_str.split("x");
            // let isError = false;

            if(di_str != '' && di.length >= 2){
                try {
                    height = Math.round( (defaultWidth*di[1])/di[0] );
                    // Note: subtracting 1 for a cheap fix for overshoot issue
                    //console.log(height);
                } catch(err){
                    console.error("Height could not be calculated: " + err);
                    this.state.isError = true; //NO UPDATE
                    this.errorMessage = "Error while calculating dimension. Does first frame have valid dimension?";
                }
            } else { 
                console.log("invalid dimension");
                this.showError("Invalid dimension. Check dimension of the first frame.");
            }     
        }
        

        let frame_window_di = [`${defaultWidth}px`, `${height}px`]; 
        this.state.isError = false; //NO UPDATE

        return (
            <div className={"strip_preview_container" + (this.props.on ? " active " : "") + " flipbook_player"}
                 style={this.props.on ? {height: frame_window_di[1]} : {}}>

                {this.state.isError ? (
                    <div className="msg">
                        <p>
                            <span className="bigtext-1 fas fa-exclamation-circle"/>
                        </p>

                        <p>
                            {this.errorMessage}
                        </p>
                    </div>
                ) : (

                    <FrameWindow data={data}
                                 widthOverride ={frame_window_di[0]} heightOverride ={frame_window_di[1]}
                                 isStandAlone={true}
                                 on={this.props.on}
                                 playPreviewNow={this.props.playPreviewNow}
                                 />

                )}
                
                {/* CLOSE button */}
                <div className="float_btn fas fa-times" onClick={this.props.off}></div>

                {/* Other controls */}
                <div className="frame_window_menu">
                    <MenuButton iconClass="menu_btn fas fa-layer-group" action={()=>{}} 
                                label="+ Layer" comingSoon={true}/>
                    <MenuButton iconClass="menu_btn fas fa-comment" action={()=>{}} 
                                label="+ Speech Bubble" comingSoon={true}/>
                    <MenuButton iconClass="menu_btn fas fa-font" action={()=>{}} 
                                label="+ text" comingSoon={true}/>
                </div>
                


            </div>
        )

    }


}





// ███████╗██████╗  █████╗ ███╗   ███╗███████╗
// ██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝
// █████╗  ██████╔╝███████║██╔████╔██║█████╗  
// ██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝  
// ██║     ██║  ██║██║  ██║██║ ╚═╝ ██║███████╗
// ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
                                           

class FrameCard extends Component{

    constructor(props){
        super(props);
        this.thumbHeight = 80, //px
        // TODO: this should be height based, rather then width.

        this.state = {
            loading: true,
            dying: false,
            visible: (this.props.frameObj && !this.props.frameObj.ignored), // INITIALIZE ONLY
            menuOn: false
        }

        // Props reference
        //this.props.standby 

        this.$node = React.createRef();

        this.handle_deleteFrameConfirm = this.handle_deleteFrameConfirm.bind(this);
        this.openMenu = this.openMenu.bind(this);
        this.toggleVisibility = this.toggleVisibility.bind(this);
        
    }


    componentDidMount(){
        const delay = this.props.delay;
        const $node = this.$node.current

        // Removing animation for now. 
        // var mountAnim = anime.timeline();
        //     mountAnim
        //         .add({
        //             targets: $node,
        //             scale: 0,
        //             duration: 0
        //         }) 
        //         .add({
        //             targets: $node,
        //             scale: 0.5,
        //             delay: delay*80,
        //             duration: 0
        //         }) 
        //         .add({
        //             targets: $node,
        //             scale: 1,
        //             elasticity: 300
        //         });   

        this.setState({loading: false});
        
    }





    handle_deleteFrameConfirm(){
        // Blur out thumb that is about to be DEEESSSTRRRROOYYED
        this.setState({dying:true});

        console.log("[FRAME DELETE] deleteFrame (No Confirm)");
        const frame = this.props.frameObj; 
        console.log("Frame Prep: " + frame);

        const csrfToken = axh.getCSRFToken();
        console.log("CSRF token grabbed for FrameDelete: " + csrfToken);
        axh.destoryFrame(frame.id, csrfToken).then(res=>{
            // Destroy successful. FETCH SCENE
            pub_handle_fetchScene();
        })
    }




    // ---------------------------------------------------------------------------
    // _______  _____  ______  _______                              
    // |  |  | |     | |     \ |_____| |                            
    // |  |  | |_____| |_____/ |     | |_____                       
                                                              
    // _______ _  _  _ _____ _______ _______ _     _ _______ _______
    // |______ |  |  |   |      |    |       |_____| |______ |______
    // ______| |__|__| __|__    |    |_____  |     | |______ ______|

    // ---------------------------------------------------------------------------
                                                              
    openMenu(){
        this.setState({menuOn: true});
        // Note: because Strip Menu is nested inside this container
        //       it appear behind the next Strip container. 
        //       By toggling the z-index, it is propped up to the top.
        this.$node.current.setAttribute('style', 'z-index:1000;');
        this.$node.current.setAttribute('style', '');
    }

    // Generic function for hiding any modal or callouts
    // Use this function to end spotlighted sessions like 'cardCoverOn' or 'dragAndDropOn'
    endModalState(stateName, spotlighted){
        if (stateName){
            console.log("Hiding component by state: " + stateName);
            this.setState(()=>{
                let s={};
                s[stateName] = false; 
                return s;
            });

            if (spotlighted){
                //remove spotlight
                this.setSpotlight(false);
            }
        }
        return;
    }

    toggleVisibility(){
        const visibility = !this.state.visible;
        this.setState({visible: !this.state.visible});

        const frame = this.props.frameObj; 
        const csrfToken = axh.getCSRFToken();
        const formData = h.makeFormData({"ignored" : !visibility}); 

        // patch update to frame
        axh.editFrame(frame.id, formData, csrfToken).then(res => {
            // FETCH SCENE (will refresh the FramePreview)
            pub_handle_fetchScene();
        });

    }








    // ---------------------------------------------------------------------------
    //  ______ _______ __   _ ______  _______  ______
    // |_____/ |______ | \  | |     \ |______ |_____/
    // |    \_ |______ |  \_| |_____/ |______ |    \_

    // ---------------------------------------------------------------------------
                                               
    render(){
        const frame = this.props.frameObj; 
        const thumbHeight = this.thumbHeight;


        // check if it has valid frames
        if (this.props.standby){
            // this is used when new Frames are created and it is waiting for API response
            return (
                <div className="tile standby"
                     ref={this.$node}>
                     
                     <Spinner style="light" 
                         float={false}
                         bgColor={"#f7f7f7"}
                         playgroundStyle={`width: 100%; height: ${thumbHeight}px; min-height: initial;`}
                         spinnerStyle={`width: 30px; height: 30px;`}
                         spinning={true}/>
                </div>
            )


        } else {

            // Physical Content is what determines the physical width and height of the thumb.
            // If you want the container or the thumb to be of certain dimension, control it here!
            let frame_physicalContent = false;
            let thumbPath = null;
            if (frame && frame.hasOwnProperty("frame_image_thumbs") 
                      && frame.frame_image_thumbs != null 
                      && Object.keys(frame.frame_image_thumbs) != 0){
                // get valid path
                thumbPath = frame.frame_image_thumbs.hasOwnProperty("thumb") ? 
                                frame.frame_image_thumbs.thumb 
                                :
                                frame.frame_image_thumbs[Object.keys(frame.frame_image_thumbs)[0]]

                frame_physicalContent = <div className="frame_image stretch">
                                            {/* opacity 0. Used ONLY TO STRETCH out the thumbnail box*/}
                                            <img src={thumbPath} height={thumbHeight+'px'}/>
                                        </div>
            } else {
                frame_physicalContent = <div style={{minWidth: "110px", minHeight: `${thumbHeight}px`}}>
                                            <span>Missing Thumbnail</span>
                                        </div>
            }

            return (
                <div className={"thumb" + 
                                (this.state.loading ?  " loading" : "") +
                                (!this.state.visible ? " ignore" : "" ) + 
                                (this.state.dying ?    " dying" : "")} 
                     frameid={frame.id}
                     onClick={(e)=>{pub_FrameModal_openModal(e, frame);}}
                     ref={this.$node}>
      
                    {/* this is what determines the dimension */}
                    {frame_physicalContent}
                    
                    <div className="frame_image" 
                         style={{backgroundImage: `url(${thumbPath})` }}>
                        {/* this is what is actually visible to the user */}
                        
                        <span className="overlay_box" frameid={frame.id} onClick={(e)=>{e.stopPropagation()}}>
                            {/*<a>[ {frame.id} ]</a>*/}
                            <a className={"far " + (this.state.visible ? "fa-eye" : "fa-eye-slash")}
                               onClick={this.toggleVisibility}></a>
                            <a className="fas fa-ellipsis-h"
                               onClick={this.openMenu}></a>
                        </span>
                        
                    </div>

                    <div className="slashes">
                    </div>

                    <FrameMenu on={this.state.menuOn} off={()=>{this.endModalState("menuOn");}}
                       actionDelete={this.handle_deleteFrameConfirm}/>
                    

                </div> 
            )
            
        } // end: standby
        
    }
}


export {
    FrameCard,
    FramePreviewCard
};