import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import { Sortable } from '@shopify/draggable';
import Spinner from "./../Spinner";

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
    blurAndAction(actionFunc){
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
                    <li>Detail Edit</li>
                    <li onClick={()=>{this.blurAndAction(this.props.actionDelete)}}>Delete</li>
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
    }

    // componentDidUpdate(prevProps, prevState, snapshot){

    // }


    render(){
        // it expects it in a form of Scene data. So like this 
        // {"strips": [ {stripObj}, {stripObj}, {stripObj} ]}
        let data = {strips: [this.props.stripObj]}; 
        const strip = this.props.stripObj;
        
        // Calc width and height of frame window based on first frame
        const defaultWidth = 450; //px
        if (!strip.frames || strip.frames.length == 0){return false;}

        // this comes out EMPTY because the dimension is not initialized. 
        // TODO: can it request on demand?
        const di_str = this.props.stripObj.frames[0].dimension;
        const di = di_str.split("x");
        let h;

        if(di_str != '' && di.length >= 2){
            try {
                h = Math.round( (defaultWidth*di[1])/di[0] );
                // Note: subtracting 1 for a cheap fix for overshoot issue
            } catch(err){
                console.error("Height could not be calculated: " + err);
                return false;
            }
        } else { return false; } 

        let frame_window_di = [`${defaultWidth}px`, `${h}px`]; 
        return (
            <div className={"strip_preview_container" + (this.props.on ? " active " : "") + " flipbook_player"}
                 style={this.props.on ? {height: frame_window_di[1]} : {}}>

                <div className="frame_window"
                     style={{
                                width: frame_window_di[0],
                                height: frame_window_di[1]
                             }}>

                    {/*This doesn't work right now. it was built to deal with Scene data, not Strips!*/}
                    {this.props.on && (
                        <FrameStage data={data} 
                                    standAlone={true} 
                                    on={this.props.on}
                        />
                    )}
                </div>
                <div className="float_btn fas fa-times" onClick={this.props.off}></div>
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
        this.thumbWidth = 180, //px
        // TODO: this should be height based, rather then width.

        this.state = {
            loading: true,
            visible: true,
            menuOn: false
        }

        // Props reference
        //this.props.standby 

        this.$node = React.createRef();

        this.openMenu = this.openMenu.bind(this);
        this.toggleVisibility = this.toggleVisibility.bind(this);
        
    }


    componentDidMount(){
        const delay = this.props.delay;
        const $node = this.$node.current

        var mountAnim = anime.timeline();
            mountAnim
                .add({
                    targets: $node,
                    scale: 0,
                    duration: 0
                }) 
                .add({
                    targets: $node,
                    scale: 0.5,
                    delay: delay*80,
                    duration: 0
                }) 
                .add({
                    targets: $node,
                    scale: 1,
                    elasticity: 300
                });   

        this.setState({loading: false});
        
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
        this.setState({visible: !this.state.visible});
    }








    // ---------------------------------------------------------------------------
    //  ______ _______ __   _ ______  _______  ______
    // |_____/ |______ | \  | |     \ |______ |_____/
    // |    \_ |______ |  \_| |_____/ |______ |    \_

    // ---------------------------------------------------------------------------
                                               
    render(){
        const frame = this.props.frameObj; 
        const thumbWidth = this.thumbWidth;


        // check if it has valid frames
        if (this.props.standby){
            // this is used when new Frames are created and it is waiting for API response
            return (
                <div className="tile standby"
                     ref={this.$node}>
                     
                     <Spinner style="light" 
                         float={false}
                         bgColor={"#f7f7f7"}
                         playgroundStyle={`width: ${thumbWidth}px; height: 100%; min-height: initial;`}
                         spinnerStyle={`width: 30px; height: 30px;`}
                         spinning={true}/>
                </div>
            )


        } else {

            let frame_physicalContent = false;
            if (frame && frame.hasOwnProperty("frame_image") && frame.frame_image != null && frame.frame_image != ""){
                frame_physicalContent = <div className="frame_image stretch">
                                            {/* opacity 0. Used only to stretch out the thumbnail box*/}
                                            <img src={frame.frame_image} width={thumbWidth+'px'}/>
                                        </div>
            } else {
                frame_physicalContent = <div>
                                            <span>Missing Image</span>
                                        </div>
            }

            return (
                <div className={"thumb" + 
                                (this.state.loading ? " loading" : "") +
                                (!this.state.visible ? " ignore" : "" )} 
                     frameid={frame.id}
                     onClick={()=>{pub_FrameModal_openModal(frame);}}
                     ref={this.$node}>
      
                    {frame_physicalContent}
                    
                    <div className="frame_image" 
                         style={{backgroundImage: `url(${frame.frame_image})` }}>
                        {/* this is what is actually visible to the user */}
                        
                        <span className="overlay_box" frameid={frame.id}>
                            <a>[ {frame.id} ]</a>
                            <a className={"far " + (this.state.visible ? "fa-eye" : "fa-eye-slash")}
                               onClick={this.toggleVisibility}></a>
                            <a className="fas fa-ellipsis-h"
                               onClick={this.openMenu}></a>
                        </span>
                        
                    </div>

                    <div className="slashes">
                    </div>

                    <FrameMenu on={this.state.menuOn} off={()=>{this.endModalState("menuOn");}}
                       actionDelete={this.handle_deleteSceneConfirm}/>
                    

                </div> 
            )
            
        } // end: standby
        
    }
}


export {
    FrameCard,
    FramePreviewCard
};