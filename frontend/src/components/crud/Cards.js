import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import { Sortable } from '@shopify/draggable';
// import Sortable from 'sortablejs';

import { FrameCard, FramePreviewCard } from "./FrameCard";
import { FrameWindow } from "./../FlipbookPlayer";
import { CardCover } from "./CardCover"

import { lightBox_publicFunctions as lb } from "./../LightBox";
import { EditableTextField } from "./../UI";
import Spinner from "./../Spinner";
import key from "weak-key";

// Custom helpers
import Helper from "./../Helper";
const h = new Helper();
import XhrHandler from "./XHRHandler";
const axh = new XhrHandler(); //axios helper






function pub_handle_fetchScene(){
    // bind to SceneCardList
    this.handle_fetchScene();
}




// http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=CallOuts

//  ██████╗ █████╗ ██╗     ██╗      ██████╗ ██╗   ██╗████████╗███████╗
// ██╔════╝██╔══██╗██║     ██║     ██╔═══██╗██║   ██║╚══██╔══╝██╔════╝
// ██║     ███████║██║     ██║     ██║   ██║██║   ██║   ██║   ███████╗
// ██║     ██╔══██║██║     ██║     ██║   ██║██║   ██║   ██║   ╚════██║
// ╚██████╗██║  ██║███████╗███████╗╚██████╔╝╚██████╔╝   ██║   ███████║
//  ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝
                                                                                                                                                           

class MenuButton extends Component {
    constructor(props){
        super(props);
    }

    render (){
        const hasFrames = this.props.hasFrames;
        return (
            <a className={this.props.iconClass + (hasFrames == null ? "" : (!hasFrames ? " disabled" : "")  )} 
               onClick={hasFrames != null && !hasFrames? ()=>{} : this.props.action}></a>
        )
    }
}


// http://patorjk.com/software/taag/#p=display&f=Cyberlarge&t=PopupMenu
// ---------------------------------------------------------------------------
//  _____   _____   _____  _     _  _____  _______ _______ __   _ _     _
// |_____] |     | |_____] |     | |_____] |  |  | |______ | \  | |     |
// |       |_____| |       |_____| |       |  |  | |______ |  \_| |_____|

// ---------------------------------------------------------------------------
                                                                       
class StripMenu extends Component {
    /* behaves similarly to CardCover */

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
                    <li onClick={()=>{this.blurAndAction(this.props.actionOpenUpload)}}>Upload Frames</li>
                    <li className="disabled">Batch Frame Edit</li>
                    <li className="disabled">Copy</li>
                    <li className="disabled">Properties</li>
                    <li onClick={()=>{this.blurAndAction(this.props.actionDelete)}}>Delete</li>
                </ul>
            </div>
        )
    }
}









                                    
// ███████╗ ██████╗ ██████╗ ████████╗ █████╗ ██████╗ ██╗     ███████╗
// ██╔════╝██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗██╔══██╗██║     ██╔════╝
// ███████╗██║   ██║██████╔╝   ██║   ███████║██████╔╝██║     █████╗  
// ╚════██║██║   ██║██╔══██╗   ██║   ██╔══██║██╔══██╗██║     ██╔══╝  
// ███████║╚██████╔╝██║  ██║   ██║   ██║  ██║██████╔╝███████╗███████╗
// ╚══════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝
                                                                  
     
function initializeSortable($container, name, callback){
    if ($container == null) {return false;}

    const frameSortable = new Sortable($container, {
        draggable: '.thumb',
        delay: 200,
        mirror: {
            appendTo: document.querySelector('body'),
            //appendTo: $container.getAttribute("class"),
            constrainDimensions: true,
        },
        scrollable: {
            speed: 0,
            sensitivity: 0
        }
    });

    frameSortable.on('sortable:start', () => {
        //tilt the chosen
        const pickedUp = document.querySelector('.thumb.draggable-mirror');
    });
    frameSortable.on('sortable:stop', () => {
        //get new order
        let thOrder = [];
        $container.querySelectorAll(".thumb").forEach(th=>{
            let thclass = th.getAttribute("class");
            let id = th.getAttribute("frameid");

            if (!thclass.includes("draggable")){
                thOrder.push(id);
            } else if (thclass.includes("draggable-source")){
                thOrder.push(id);
            }
        });

        console.log(thOrder.join(","));
        callback(thOrder);

    });
}


function initializeSortable_Scene($container, name, callback){
    if ($container == null) {return false;}

    console.log("initialize sortable for StripCards");

    const targetName = '.strip_card';
    const StripSortable = new Sortable($container, {
        draggable: targetName,
        delay: 300,
        mirror: {
            appendTo: document.querySelector('body'),
            //appendTo: $container.getAttribute("class"),
            constrainDimensions: true,
        },
        scrollable: {
            speed:0,
            sensitivity: 0
        }
    });

    // because this takes much longer delay, add animated indicator
    // $container.querySelectorAll(targetName).forEach((stripCard)=>{

    // });

    StripSortable.on('sortable:start', (e) => {
        //tilt the chosen
        // const pickedUp = document.querySelector(targetName+'.draggable-mirror');
        const childBeingDragged = e.startContainer.querySelector(".draggable-source--is-dragging");
        if (childBeingDragged){
            e.cancel();
        }
    });
    StripSortable.on('sortable:stop', () => {
        //get new order
        let thOrder = [];
        $container.querySelectorAll(targetName).forEach(th=>{
            let thclass = th.getAttribute("class");
            let id = th.getAttribute("stripid");

            if (!thclass.includes("draggable")){
                thOrder.push(id);
            } else if (thclass.includes("draggable-source")){
                thOrder.push(id);
            }
        });

        console.log(thOrder.join(","));
        callback(thOrder);

    });
}







// ███████╗ ██████╗███████╗███╗   ██╗███████╗
// ██╔════╝██╔════╝██╔════╝████╗  ██║██╔════╝
// ███████╗██║     █████╗  ██╔██╗ ██║█████╗  
// ╚════██║██║     ██╔══╝  ██║╚██╗██║██╔══╝  
// ███████║╚██████╗███████╗██║ ╚████║███████╗
// ╚══════╝ ╚═════╝╚══════╝╚═╝  ╚═══╝╚══════╝


class StripCard extends PureComponent {

    constructor(props){
        super(props);

        this.$node = React.createRef();
        this.$frameForm = document.querySelector("#frame_create_form");
        this.$lb = document.querySelector("#lightbox_bg"); //lightbox
        
        // Props note:
        // this.props.stripObj
        // this.props.index
        // this.setSceneDataState
        // this.props.handle_fetchScene

        this.state={
            loadingFrames: false,

            cardCoverOn: false,
            menuOn: false,
            dragAndDropOn: false,
            previewOn: false,

            cardCover_messageType: "default"
        }

        // List of state name that is related to modal. 
        // This roster used when turning all of them off
        this.modalStateKeys = ['cardCoverOn', 'menuOn', 'dragAndDropOn'];

        this.selfSpotlighted = false; // as opposed to this.props.spotlightedAll

        

        this.handle_openUploadCover = this.handle_openUploadCover.bind(this);
        this.handle_deleteSceneConfirm = this.handle_deleteSceneConfirm.bind(this);
        this.handle_createFrame = this.handle_createFrame.bind(this);
        this.handle_deleteScene = this.handle_deleteScene.bind(this);
        this.handle_updateStrip = this.handle_updateStrip.bind(this);
        this.handle_frameSort = this.handle_frameSort.bind(this);
        this.handle_dragMessageToggle = this.handle_dragMessageToggle.bind(this);
        this.handle_dragAndDrop = this.handle_dragAndDrop.bind(this);

        this.openMenu = this.openMenu.bind(this);
        this.openDurationField = this.openDurationField.bind(this);
        this.openPreview = this.openPreview.bind(this);

        this.endModalState = this.endModalState.bind(this); // more generic version of 'removeCardCover'
        this.setStripState = this.setStripState.bind(this); // for communication
        this.setSpotlight = this.setSpotlight.bind(this);

    }




    componentDidMount(){
        const delay = this.props.delay;
        const $node = this.$node.current

        if (delay != -1){ // Note: decided to remove animation when it first mounts.

            var mountAnim = anime.timeline();
                mountAnim
                    .add({
                        targets: $node, scale: 0, duration: 0
                    }) 
                    .add({
                        targets: $node, scale: 0.5, duration: 0,
                        delay: delay*80
                    }) 
                    .add({
                        targets: $node, scale: 1, duration: 600,
                        elasticity: 200
                    });  
        }
        

        // Sortable magic
        initializeSortable(this.$node.current.querySelector('.strip_flex_container'), 
                           this.props.index,
                           this.handle_frameSort);
    }


    // componentDidUpdate(prevProps, prevState, snapshot){
    // }

    
    // returns list of frame objects in order referencing children_li
    // TODO: this function doesn't consider "ignored" field of each Frame. 
    //       Updated version of function of same name [BAD. Don't leave it this way]
    //       in FlipbookPlayer.js
    reorderFrames(strip){
        const frameIdList = strip.children_li.split(",");
        if (frameIdList==null || frameIdList==='') {return null;}

        let frameOrderedArr = Array.apply(null, Array(frameIdList.length));
        let frameLeftOver = [];

        strip.frames.forEach((f)=>{
            const insertAt = frameIdList.indexOf(String(f.id));
            if (insertAt>=0 && insertAt<frameOrderedArr.length){
                frameOrderedArr[insertAt] = f; 
            } else if (insertAt==-1){
                // children not ref'd in children_li is just placed at the end
                frameLeftOver.push(f);
            }
            
        });

        if (frameLeftOver.length>0){
            frameOrderedArr.push(...frameLeftOver);
        }

        return frameOrderedArr;
    }


    setStripState(newState){
        this.setState(newState);
    }




    
    handle_createFrame(inputData){
        this.setState({loadingFrames: true}); 

        const csrfToken = axh.getCSRFToken();
        if (!csrfToken){ return false;}

        let fd = h.makeFormData(inputData); 
            fd.set("strip", this.props.stripObj.id);

        // quick validation
        if (!fd.has("frame_image")){return false;}

        axh.createFrame(this.props.stripObj.id, fd, csrfToken).then(res=>{
            if (res && res.data){
                this.setState({loadingFrames: false}); 
                this.props.handle_fetchScene();
            } else {
                console.error("Frame Create Failed");
            }
            
        }).catch(error=>{
            console.log(error);
            // Well that didn't work!
            console.log("Something went wrong processing the response");
            this.setState({cardCover_messageType: "frameCreateError"});
        });
    }

    
    // ---------------------------------------------------------------------------
    // _______ _    _ _______ __   _ _______                        
    // |______  \  /  |______ | \  |    |                           
    // |______   \/   |______ |  \_|    |                           
                                                              
    // _     _ _______ __   _ ______         _______  ______ _______
    // |_____| |_____| | \  | |     \ |      |______ |_____/ |______
    // |     | |     | |  \_| |_____/ |_____ |______ |    \_ ______|

    // ---------------------------------------------------------------------------
                                        
                                                                                                       
    handle_deleteSceneConfirm(){
        console.log("handle_deleteSceneCONFIRM");

        //turn on cover
        this.setState({
            cardCoverOn: true,
            cardCover_messageType: "deleteConfirm" 
            // this is a shared state between 2 CardCovers. Might be bad idea.
            // Update: unified into just ONE CardCover.
            // Note: lightBox and spotlighting is controlled inside the CardCover
        });
    }


    handle_deleteScene(){
        // DANGER ZONE!

        const strip = this.props.stripObj;

        console.log("handle_deleteScene for Strip id: " + this.props.stripObj.id);
        const csrfToken = axh.getCSRFToken();
        axh.destroyStrip(strip.id, csrfToken).then(res=>{
            // Destroy successful. Re-fetch.
            console.log("[Strip destory] response came back");
            // FETCH SCENE
            pub_handle_fetchScene();
        });
    }

    handle_updateStrip(data){

        const strip = this.props.stripObj;
        let fd = h.makeFormData(data);
        const csrfToken = axh.getCSRFToken();

        return axh.updateStrip(strip.id, fd, csrfToken).then(res=>{
            // TODO: update the field based on what comes back.
            //       For example, sending 1000000 for frame_duration will
            //       return 9999. 

            if (res && res.data){
                // FETCH SCENE
                pub_handle_fetchScene();
            }

        });
    }


    handle_openUploadCover(){
        //turn on cover
        this.setState({
            cardCoverOn: true,
            cardCover_messageType: "upload" 
        });
    }



    handle_frameSort(idArr){

        const strip = this.props.stripObj;
        const sortableData = {frame_ids: idArr.join(",")}
        console.log("ready to send: " +JSON.stringify(sortableData));

        axios({
            method: "get",
            params: sortableData,
            url: `/flipbooks/ajax/strips/${strip.id}/sort-children/`
 
        })
        .then(res =>{ 
            if (res && res.data){
                console.log("sucessfully came back: " + res.data["frame_ids"]);
                // FETCH SCENE
                pub_handle_fetchScene();
            }
            
        })
        .catch(err => {
            console.error(JSON.stringify(err));
            console.error(err.data);
            console.log(data.status);
        })
    }



    handle_dragMessageToggle(e, on){
        // probably already true'd by setSpotlightALL, but just in case
        e.stopPropagation();

        if (on){
            this.setState({
                selfSpotlighted: true,
                cardCoverOn: true,
                cardCover_messageType: "dragAndDrop",
            });  
       } else {
            this.setState({
                selfSpotlighted: false, //selfSpotlightAll should keep it on
                cardCoverOn: false
            }); 
       }
    }


    removeDragData(e) {
        console.log('[Drag data clean up]');
        if (e.dataTransfer.items) {
            // Use DataTransferItemList interface to remove the drag data
            e.dataTransfer.items.clear();
        } else {
            // Use DataTransfer interface to remove the drag data
            e.dataTransfer.clearData();
        }
    }

    handle_dragAndDrop(e){
        // parse data?
        e.preventDefault();

        if (e.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file.

            // Because the backend cannot hande multiple files yet, use just the FIRST file.
            if (e.dataTransfer.items.length == 1 && e.dataTransfer.items[0].kind === 'file') { // check if file 

                var file = e.dataTransfer.items[0].getAsFile();
                console.log('>> file[' + 0 + '].name = ' + file.name + " : type = " + file.type);

                /////// CHECKPOINT 1: image only
                const allowedImageTypes = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'];
                if (!allowedImageTypes.includes(file.type)){
                    // exit abruptly. This causes this component to remain in dragAndDrop state
                    this.setState({cardCover_messageType: "wrongFileType"});
                    return false;
                }

                const csrfToken = axh.getCSRFToken();

                /////// CHECKPOINT 2: valid CSRF token
                if (!csrfToken){
                    // exit abruptly. This causes this component to remain in dragAndDrop state.
                    this.setState({cardCover_messageType: "invalidForm"});
                    return false;
                }

                /////// Build formData and ship it off              
                let fd = new FormData();
                fd.append("strip", this.props.stripObj.id);
                fd.append("frame_image", file)

                this.setState({loadingFrames: true}); 

                axh.createFrame(this.props.stripObj.id, fd, csrfToken).then(res=>{
                    if (res && res.data){
                        console.log("[FrameCreate response] " + JSON.stringify(res.data));
                        // stop loading state and Re-fetch scene
                        // TODO: In the future, it may not be just one request
                        this.setState({loadingFrames: false}); 
                        this.props.handle_fetchScene();

                    } else {
                        console.error("Frame Create Failed");
                    }
                    
                }).catch(error=>{
                    console.log(error);
                    // Well that didn't work!
                    console.log("Something went wrong processing the response");
                    this.setState({cardCover_messageType: "frameCreateError"});
                });

        
            } 
            else if (e.dataTransfer.items.length > 1) {

                let fd_arr = []
                for(let i=0;i<e.dataTransfer.items.length;i++){
                    let fd = new FormData();
                        fd.append("strip", this.props.stripObj.id);

                    var file = e.dataTransfer.items[i].getAsFile();
                    console.log('>> file[' + i + '].name = ' + file.name + " : type = " + file.type);

                    // Add only if it is a valid image file
                    const allowedImageTypes = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'];
                    if (allowedImageTypes.includes(file.type)){
                        fd.append("frame_image", file);
                        fd_arr.push(fd);
                    }
                }
                
                const csrfToken = axh.getCSRFToken();
                if (!csrfToken){
                    // exit abruptly. This causes this component to remain in dragAndDrop state.
                    this.setState({cardCover_messageType: "invalidForm"});
                    return false;
                }
               
                // recursively chain the requests
                const reqconf = [this.props.stripObj.id, csrfToken];

                var recur = fd_arr => {
                    if (fd_arr.length == 1){ // tail
                        return axh.createFrame(reqconf[0], fd_arr[0], reqconf[1])
                    }

                    let curr_fd = fd_arr.pop();
                    return recur(fd_arr)
                    .then(()=>{
                        //this.props.handle_fetchScene();
                        return axh.createFrame(reqconf[0], curr_fd, reqconf[1]);
                    })
                    
                }

                // recursion starter
                this.setState({loadingFrames: true}); 

                recur(fd_arr)
                .then((res)=>{
                    // ALL DONE
                    // this.props.handle_fetchScene(); // fetch one more time just in case
                    pub_handle_fetchScene();
                    this.setState({loadingFrames: false}); 
                })
                .catch(error=>{
                    console.log(error);
                    // Well that didn't work!
                    // console.log("Something went wrong processing the response");
                    // this.setState({cardCover_messageType: "frameCreateError"});
                });

            }

        } else {
            // Use DataTransfer interface to access the file(s)
            for (var i = 0; i < ev.dataTransfer.files.length; i++) {
                console.log('... file[' + i + '].name = ' + e.dataTransfer.files[i].name);
            }
        } 

        // Pass event to removeDragData for cleanup
        this.removeDragData(e)

        // If you reached this point, then you avoided all errors from user side.
        this.setState({loadingFrames: false});
        // crap...I thought any kind of setState is async? if I don't put this
        // here, anything that happens afterward may or may not happen
        console.warn("Request send success. Escape dragAndDrop state.");
        
        // Close

        // [Outdated Note. setSpotlightAll is removed] 
        // DragAndDrop is a bit unique in a sense that it can be initated by SceneEditor, the parent.
        // But it can still be triggered by individual StripCard.
              
        this.setSpotlight(false); // This doesn't turn off setSpotlightAll
        lb.pub_LightBox_off();

    }








    // ---------------------------------------------------------------------------
    // _______ _______ __   _ _     _    /  _____  _______ __   _ _______       
    // |  |  | |______ | \  | |     |   /  |_____] |_____| | \  | |______ |     
    // |  |  | |______ |  \_| |_____|  /   |       |     | |  \_| |______ |_____
    //                                /                                         
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

    openDurationField(){
        console.log("change duration");
    }

    openPreview(){

        // Play if preview already opened
        if (this.state.previewOn){
            // Anti-pattern? Using increments to cause it to refresh every setState
            console.log("Curr playPreviewNow count: " + this.state.playPreviewNow);
            this.setState({playPreviewNow: this.state.playPreviewNow ? this.state.playPreviewNow+1 : 1}); 
        } else {
            this.setState({previewOn: true});
            // FrameStage component is set to autoplay upon mount, only when standlone
        }
        
    }



    setSpotlight(on){
        // Set this component in spotlight against lightbox.
        // Due to the nature of this container, only .strip_card can do this

        // modify click event to the LightBox!
        this.props.setState_LightBox({addToOnClick: ()=>{ this.setSpotlight(false); }})

        
        if (on){
            // console.log("setSpotlight " + on);
            this.props.setState_LightBox({active: true});
            this.setState({selfSpotlighted: true});
        } else {
            // console.log("setSpotlight " + on);
            this.props.setState_LightBox({active: false});
            // might be safer to CLICK on the lightbox actually...but I don't have access to that. 

            //remove ALL modals or any callouts
            // TODO: isn't this similar to endModalState()?

            this.setState(()=>{
                let st = {};
                const keys = this.modalStateKeys;
                for (var i=0; i<keys.length; i++) {
                    if (this.state.hasOwnProperty(keys[i])) {
                        st[keys[i]] = false;
                    }
                }
                //also remove selfSpotlight
                st.selfSpotlighted = false;
                console.warn("Ready to set state?: " + JSON.stringify(st));
                
                return st;
            });
        }

        // Reset DragAndDrop CardCover's state
        //this.setState({cardCover_messageType: "default"});

    }


    // Generic function for hiding any modal or callouts
    // Use this function to end spotlighted sessions like 'cardCoverOn' or 'dragAndDropOn'

    // TODO: this function's purpose is getting reduced to just setting spotlight off and on. 
    //       CardCover and Menus are being built to take care of visibility on its own. 
    //       Well, it's not as simple. They can both be closed by external source. That's 
    //       What's causing the complexity. 

    endModalState(stateName, spotlighted){
        if (stateName === undefined || typeof stateName != "string" ){
            console.error("[endModalState()] No valid stateName provided");
            return false;
        }

        console.log("Hiding component by state: " + stateName);
        if (stateName != "All" && !this.modalStateKeys.includes(stateName)){
            console.warn(`'${stateName}' is not found in modalStateKeys, but will try to close it anyway`);
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

    // ---------------------------------------------------------------------------
                                               
    render(){
        const strip = this.props.stripObj;
        const index = this.props.index;
        const reorderedFrames = this.reorderFrames(strip);
    
        const noFrames = (strip.frames == null || strip.frames.length === 0 || Object.keys(strip.frames).length === 0);

        return (

            <li className={"strip_card " +
                           (this.props.spotlightedAll || this.state.selfSpotlighted ? "spotlighted" : "")} 
                stripid={strip.id}
                onDragOver={(e)=>(this.handle_dragMessageToggle(e, true))}
                onDragLeave={(e)=>(this.handle_dragMessageToggle(e, false))}
                onDrop={this.handle_dragAndDrop}

                ref={this.$node}> 
                {/* Keep strip_card position:relative to allow being "highlightable"
                    as well as allowing popups and callouts to appear around it */}
   
                <div className="strip_flex_toolbar">
                    <div className="info">
                        <span className="bigtext-3">{index}</span>
                        <span className="divider">|</span>
                        <span>
                            <span className="far fa-clock"/>
                            <EditableTextField fieldLabel="frame_duration" 
                                               fieldValue={strip.frame_duration}
                                               fieldUnit="ms"
                                               widthSize="2" 
                                               visualStyle="compact"
                                               action={this.handle_updateStrip}/> 
                        </span>
                    </div>

                    <div className="tools">
                        
                        <MenuButton iconClass="menu_btn fas fa-play-circle" action={this.openPreview} hasFrames={!noFrames}/>
                        <MenuButton iconClass="menu_btn fas fa-file-upload" action={this.handle_openUploadCover}/>
                        <MenuButton iconClass="menu_btn fas fa-pen" action={()=>{console.log("batch edit")}} hasFrames={false}/>
                        <MenuButton iconClass="menu_btn fas fa-trash" action={this.handle_deleteSceneConfirm}/>
                        <MenuButton iconClass="menu_btn fas fa-ellipsis-h" action={this.openMenu}/>
                    </div>
                    
                </div>

                {/* List of frames in this strip*/}
                <div className="strip_content">

                    {/* panel for frame animation preview */}
                    <FramePreviewCard on={this.state.previewOn} 
                                      off={()=>{
                                          this.endModalState("previewOn", true);
                                      }}
                                      stripObj={strip}
                                      playPreviewNow={this.state.playPreviewNow}/>

                    {noFrames ?
                        (
                            <div className="strip_flex_container" stripid={strip.id}>
                                <div className="tile empty-strip ui-state-disabled">
                                    <span>No frames in this strip. Upload some!</span>
                                </div>
                            </div>
                        ) : (
                            <div className="strip_flex_container" stripid={strip.id}>
                                {reorderedFrames.map( (frame, index) => (
                                    <FrameCard frameObj={frame} delay={index+this.props.delay} key={"frame"+frame.id}/>
                                ))}

                                {this.state.loadingFrames && <FrameCard standby={true}/>}
                            </div>
                        )
                    }

                </div>

                {/* Message or modals */}
                {/*<CardCover on={this.state.cardCoverOn} off={()=>{this.endModalState("cardCoverOn", true)}}
                            messageType="deleteConfirm"
                            setParentSpotlight={this.setSpotlight}
                            name="deleteConfirm"/>*/}

                <CardCover on={this.state.dragAndDropOn || this.state.cardCoverOn } 
                           off={()=>{this.endModalState("cardCoverOn", true)}}
                           messageType={this.state.cardCover_messageType}
                           setParentSpotlight={this.setSpotlight}
                           handle_deleteScene={this.handle_deleteScene}
                           handle_createFrame={this.handle_createFrame}
                           name="dragAndDrop"/>

                <StripMenu on={this.state.menuOn} 
                           off={()=>{this.endModalState("menuOn");}}
                           actionOpenUpload={this.handle_openUploadCover}
                           actionDelete={this.handle_deleteSceneConfirm}/>

            </li>
        )
    }
}







// ███████╗ ██████╗███████╗███╗   ██╗███████╗██╗     ██╗███████╗████████╗
// ██╔════╝██╔════╝██╔════╝████╗  ██║██╔════╝██║     ██║██╔════╝╚══██╔══╝
// ███████╗██║     █████╗  ██╔██╗ ██║█████╗  ██║     ██║███████╗   ██║   
// ╚════██║██║     ██╔══╝  ██║╚██╗██║██╔══╝  ██║     ██║╚════██║   ██║   
// ███████║╚██████╗███████╗██║ ╚████║███████╗███████╗██║███████║   ██║   
// ╚══════╝ ╚═════╝╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝╚══════╝   ╚═╝   
                                                                      



class SceneCardList extends Component {

    constructor(props){
        super(props);
        this.r_cardContainer = React.createRef();
        this.stripCount = Number(document.querySelector('#ref-content').getAttribute("stripSetCount"));

        this.state = {
            data: null
        }

        this.firstLoad = true;
        this.sortablified = false;

        this.handle_fetchScene = this.handle_fetchScene.bind(this);
        this.handle_stripSort = this.handle_stripSort.bind(this);

        pub_handle_fetchScene = pub_handle_fetchScene.bind(this);
        // incoming
        //this.props.toSceneCardList

    }

    componentDidMount(){
        this.handle_fetchScene();
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        // Check inbox
        if (JSON.stringify(prevProps.dataInbox) != JSON.stringify(this.props.dataInbox)){
            console.log("MAIL TIME [SceneCardList]");
            // Mail time!
            const newData = this.appendData(this.state.data, this.props.dataInbox)
            this.setState({data: newData});
        }

        if (this.r_cardContainer.current && !this.sortablified){
            // WEIRD: here, this.firstLoad is actually 'true'. 
            //        which is counter intuitive because this.firstLoad is set to false
            //        immediately after data is set to the state. (see handle_fetchScene())
            console.log("StripCard count: " + this.r_cardContainer.current.querySelectorAll('.strip_card').length);
            console.log(this.firstLoad);

            // Sortable magic
            initializeSortable_Scene(this.r_cardContainer.current, 
                                     null,
                                     this.handle_stripSort);
            this.sortablified = true;
        }

        
        


    }

    handle_fetchScene(){
        axh.fetchScene(this.props.sceneId).then(res =>{
            console.log("[SetState Scene Data]")
            this.setState({data: res.data});
            this.firstLoad = false;
        });
    }


    handle_stripSort(idArr){

        // TODO: this function is very similar to handle_frameSort. BAD!

        const sceneId = this.props.sceneId;
        const sortableData = {strip_ids: idArr.join(",")}
        console.log("ready to send: " +JSON.stringify(sortableData));

        axios({
            method: "get",
            params: sortableData,
            url: `/flipbooks/ajax/scene/${sceneId}/sort-children/`
 
        })
        .then(response =>{ 
            console.log("sucessfully came back: " + response.data["strip_ids"]);
        })
        .catch(err => {
            console.error(JSON.stringify(err));
            console.error(err.data);
            console.log(data.status);
        })
    }


    // takes only one key from newData. Rest will be ignored for now.
    appendData(data, newData){
        console.log("New Data looks like this: " + JSON.stringify(newData.newStrip));

        if (newData == null || Object.keys(newData).length === 0) {
            // newData is invalid. return same data.
            return data;
        }

        switch(Object.keys(newData)[0]){
            case "newStrip":
                //add it to list of strips
                if (data.hasOwnProperty("strips")) { data.strips.push(newData.newStrip) }
            default: 
                return data;
        }
        return data; 
    }

    // returns list of frame objects in order referencing children_li

    reorderedStrips(scene){

        if (scene && scene.hasOwnProperty('strips') && scene.strips.length > 0){

            const stripIdList = scene.children_li.split(",");
            if (stripIdList==null || stripIdList==='') {
                // children_li could be empty even if it has valid children
                return scene.strips
            }

            let stripOrderedArr = Array.apply(null, Array(stripIdList.length));
            let stripLeftOver = [];

            scene.strips.forEach((st)=>{
                const insertAt = stripIdList.indexOf(String(st.id));
                if (insertAt>=0 && insertAt<stripOrderedArr.length){
                    stripOrderedArr[insertAt] = st; 
                } else if (insertAt==-1){
                    // children not ref'd in children_li is just placed at the end
                    stripLeftOver.push(st);
                }
                
            });

            if (stripLeftOver.length>0){
                stripOrderedArr.push(...stripLeftOver);
            }

            return stripOrderedArr;
        } else {
            return [];
        }

        
    }


    render (){
        
        const reorderedStrips = this.reorderedStrips(this.state.data);

        return (
            <div>

            {this.state.data == null ? ( 
                <ul className="loading_strips">
                    {Array.apply(null, Array(this.stripCount>4 ? 4 : this.stripCount)).map((el,index)=>{
                        return (<li key={index}></li>)
                    })}
                </ul>
            ) : (
                <ul className="list_strips" ref={this.r_cardContainer}>
                    {reorderedStrips.map( (strip,index) => {
                        if (strip) {
                            return (<StripCard stripObj={strip} 
                                               delay={this.firstLoad ? -1 : 1} 
                                               index={index+1}
                                               spotlightedAll = {this.props.spotlightedAll}

                                                handle_fetchScene = {this.handle_fetchScene}
                                                setState_LightBox = {this.props.setState_LightBox}

                                                key={"strip"+strip.id}/>
                                    )
                         
                        }
                    }) } 
                </ul>
                
            )} 
            
            </div>
        ) //end: return
    } //end: render()


}


export {
    SceneCardList,
    pub_handle_fetchScene
};
