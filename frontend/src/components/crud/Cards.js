import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import { Sortable } from '@shopify/draggable';
// import Sortable from 'sortablejs';
import Spinner from "./../Spinner";
import key from "weak-key";

// Custom helpers
import Helper from "./../Helper"
const h = new Helper();


// http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=Frame


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
        this.state = {
            loading: true,
            visible: true
        }

        this.$node = React.createRef();

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
        
    }


    toggleVisibility(){

        this.setState({visible: !this.state.visible});



    }




    render(){
        const frame = this.props.frameObj; 
        const thumbWidth = this.thumbWidth;

        // check if it has valid frames
        if (frame.hasOwnProperty("frame_image") && frame.frame_image != null && frame.frame_image != ""){

            return (
                <div className={"thumb " + 
                                (this.state.loading && "loading") + " " +
                                (!this.state.visible && "ignore" )} 
                     frameid={frame.id} ref={this.$node}>
      
                    <div className="frame_image stretch">
                        {/* opacity 0. Used only to stretch out the thumbnail box*/}
                        <img src={frame.frame_image} width={thumbWidth+'px'}/>
                    </div>
                    
                    <div className="frame_image" 
                         style={{backgroundImage: `url(${frame.frame_image})` }}>
                        
                        <span className="overlay_box" frameid={frame.id}>
                            <a>[ {frame.id} ]</a>
                            <a className={"far " + (this.state.visible ? "fa-eye" : "fa-eye-slash")}
                               onClick={this.toggleVisibility}></a>
                            <a className="fas fa-ellipsis-h"></a>
                        </span>
                        
                    </div>

                    <div className="slashes">
                    </div>

                </div> 
            )
        } else {
            return (
                <div className="thumb placeholder2" frameid="{frame.id}" ref={this.$node}>
                    {/* Frame with invalid image */}
                    <span>Missing Image</span>
                        <a href="" className="mini_menu edit">frame [{frame.id}]</a>
                </div>
            )
            
                
        }
    }



    


}





// ███╗   ███╗ ██████╗ ██████╗  █████╗ ██╗     ███████╗
// ████╗ ████║██╔═══██╗██╔══██╗██╔══██╗██║     ██╔════╝
// ██╔████╔██║██║   ██║██║  ██║███████║██║     ███████╗
// ██║╚██╔╝██║██║   ██║██║  ██║██╔══██║██║     ╚════██║
// ██║ ╚═╝ ██║╚██████╔╝██████╔╝██║  ██║███████╗███████║
// ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
                                                                                                 

class MenuButton extends Component {
    constructor(props){
        super(props);

    }

    render (){
        return (
            <a className={this.props.iconClass} onClick={this.props.action}></a>
        )
    }
}






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
                    <li onClick={()=>console.log("Upload Image!")}>Upload Frames</li>
                    <li>Batch Frame Edit</li>
                    <li>Edit</li>
                    <li>Copy</li>
                    <li onClick={()=>{this.blurAndAction(this.props.actionDelete)}}>Delete</li>
                </ul>
            </div>
        )
    }
}






class CardCover extends Component {
    constructor(props){
        super(props);
        this.r = React.createRef();
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        // if        (!prevProps.on && this.props.on){
        //     console.log("[CARD COVER] set spotlight on");
        //     this.props.setParentSpotlight(true);
        // } else if (prevProps.on && !this.props.on){
        //     console.log("[CARD COVER] set spotlight off");
        //     this.props.setParentSpotlight(false);
        // }
    }

    render(){
        return (
            <div className={"cover light delete_confirm " + (this.props.on ? "active" : "")}>

                <div className="cover_message">
                    <p>
                    <span className="bigtext 2">Are you sure you want to delete this scene?</span>
                    </p>
                    <p>
                        <span>
                            <button className='warning'>DELETE</button>
                            <button onClick={this.props.off}>Cancel</button></span>
                    </p>
                </div>           
            </div>
        )
    }
}



function getCardCoverMessage(templateName){

    switch (templateName){
        case "default":
            return (
                <div className="cover_message">
                    <p className="color red">
                        <span className="bigtext-1 fas fa-file-image"/>
                    </p>
                    <p>
                        <span className="bigtext 1">Drop images to make frames</span>
                    </p>
                </div>
            )

        case "frameCreateError":
            return (
                <div className="cover_message">
                    <p className="color red">
                        <span className="bigtext-1 far fa-frown-open"></span>
                        <span>Aww, something broke!</span>
                    </p>

                    <p>
                        <button>Sorry about that</button>
                    </p>
                </div>
            )
    }
    


}

class CardCover2 extends Component {
    constructor(props){
        super(props);
        this.r = React.createRef();
    }

    render(){
        return (
            <div className={"cover light drag_and_drop " + 
                            (this.props.on ? "active" : "") + " " +
                            (this.props.intangible ? "intangible" : "")}>
      

                    {getCardCoverMessage(this.props.messageType)}

      
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
        mirror: {
            appendTo: document.querySelector('body'),
            //appendTo: $container.getAttribute("class"),
            constrainDimensions: true,
        },
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

        //TODO: animation?


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

        this.state={
            cardCoverOn: false,
            menuOn: false,
            dragAndDropOn: false,

            cardCover_messageType: "default"
        }

        // List of state name that is related to modal. 
        // This is used when turning all of them off
        this.modalStateKeys = ['cardCoverOn', 'menuOn'];

        this.selfSpotlighted = false; // as opposed to this.props.spotlightedAll

        this.handle_deleteSceneConfirm = this.handle_deleteSceneConfirm.bind(this);
        this.handle_deleteScene = this.handle_deleteScene.bind(this);
        this.handle_frameSort = this.handle_frameSort.bind(this);
        this.handle_dragMessageToggle = this.handle_dragMessageToggle.bind(this);
        this.handle_dragAndDrop = this.handle_dragAndDrop.bind(this);

        this.openMenu = this.openMenu.bind(this);
        //this.removeCardCover = this.removeCardCover.bind(this);
        this.hideComponent = this.hideComponent.bind(this); // more generic version of 'removeCardCover'
        this.setSpotlight = this.setSpotlight.bind(this);
    }





    componentDidMount(){
        const delay = this.props.delay;
        const $node = this.$node.current

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

        // Sortable magic
        initializeSortable(this.$node.current.querySelector('.strip_flex_container'), 
                           this.props.index,
                           this.handle_frameSort);



          
    }

    componentDidUpdate(){
        //console.warn("[STRIPCARD] SOMETHING UPDATED: " + JSON.stringify(this.state));

        // internal changes that warrent lightbox
        if (this.state.cardCoverOn){
            this.setSpotlight(true);
        }

    }

    setSpotlight(on){
        // Set this component in spotlight against lightbox.
        // Due to the nature of this container, only .flex_list can do this

        // Bind spotlight off event
        this.$lb.onclick = e => {
            //console.log("Curr state in onclick: " + JSON.stringify(this.state));
            this.setSpotlight(false);
            // NOTE: the reason this is blinding here is because onclick's scope is
            //       a snapshot when this event is binded. So if onclick is binded
            //       say componentDidUpdate, the states excessed in setSpotlight is
            //       all false, so the state never actualy updates properly. 
            // TODO: look more into how to get around this quirk.
        }
        
        
        if (on){
            console.log("setSpotlight " + on);
            //this.$node.current.setAttribute('style', 'z-index:1000;');
            this.$lb.classList.add('active');
            this.setState({selfSpotlighted: true});
        } else {
            console.log("setSpotlight " + on);
            //this.$node.current.setAttribute('style', '');
            this.$lb.classList.remove('active');

            //remove all modals or any callouts
            this.setState(()=>{
                let st = {};
                const keys = this.modalStateKeys;
                for (var i=0; i<keys.length; i++) {
                    if (this.state.hasOwnProperty(keys[i])) {
                        st[keys[i]] = false;
                    }
                }
                //also remove selfSpotlight
                st.selfSpotlighted = false
                
                return st;
            });
        }

        
    }




    

    // http://patorjk.com/software/taag/#p=display&f=Cyberlarge&t=Event%0AHandlers
    // _______ _    _ _______ __   _ _______                        
    // |______  \  /  |______ | \  |    |                           
    // |______   \/   |______ |  \_|    |                           
                                                              
    // _     _ _______ __   _ ______         _______  ______ _______
    // |_____| |_____| | \  | |     \ |      |______ |_____/ |______
    // |     | |     | |  \_| |_____/ |_____ |______ |    \_ ______|
                                        
                                                                                                       
    handle_deleteSceneConfirm(){
        console.log("handle_deleteSceneCONFIRM");

        //turn on cover
        this.setState({cardCoverOn: true});
    
    }

    handle_deleteScene(){
        // DANGER ZONE!

        const strip = this.props.stripObj;

        console.log("handle_deleteScene");

        // TODO: this returns "forbidden" error
        // axios({
        //     method: 'get',
        //     url: `/api/strip/${strip.id}/delete/`,
        // })
        // .then(response => {
        //     console.log("Delete Request made");
        // })
        // .catch(error => {
        //     console.log(error);
        // })
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
        .then(response =>{
            console.log("sucessfully came back: " + response.data["frame_ids"]);
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
                dragAndDropOn: true
            });  
       } else {
            this.setState({
                 dragAndDropOn: false
            }); 
       }
    }

    handle_dragAndDrop(e){
        // parse data?
        e.preventDefault();

        if (e.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file.

            // Because the backend cannot hande multiple files yet, use just the FIRST file.
            // If dropped items aren't files, reject them
            if (e.dataTransfer.items[0].kind === 'file') {
                var file = e.dataTransfer.items[0].getAsFile();
                console.log('... file[' + 0 + '].name = ' + file.name);

                // Frameform does not actually hold any useful information.
                // Just extract csrfToken from it
                const frameFormData = h.serializeForm(this.$frameForm);
                console.log(this.$frameForm);
                console.log(JSON.stringify(frameFormData.csrfmiddlewaretoken));
                const csrfToken = frameFormData ? (frameFormData.hasOwnProperty("csrfmiddlewaretoken") ? frameFormData.csrfmiddlewaretoken : null) : null;

                if (!csrfToken){
                    console.error("Cannot find CSRF Token. Check if the form rendered correctly.");
                    return false;
                }

                // Build formData
                let formData = new FormData();

                formData.append("strip", this.props.stripObj.id); //does this need to be a number?
                formData.append("frame_image", file);
                
                console.log("Formdata done: " + JSON.stringify(formData));
                //'processData': false,
                //'contentType': false
        
                // Is this relly supposed to work without the whole " 'multipart/form-data'){ thing??"
                // Ship it off
                 axios({
                    method: 'post',
                    url: `/api/strip/${formData.strip}/frame/create/`,
                    data: formData,
                    headers: {"X-CSRFToken": formData.csrfmiddlewaretoken}
                })
                .then(response => {
                    console.log("FrameCreate successful: " + JSON.stringify(response));
                    console.log("Congrats!!!");
                })
                .catch(error => {
                    console.log(error);
                    // Well that didn't work!
                    this.setState({cardCover_messageType: "frameCreateError"});

                });



            }

        
        } else {
            // Use DataTransfer interface to access the file(s)
            for (var i = 0; i < ev.dataTransfer.files.length; i++) {
                console.log('... file[' + i + '].name = ' + e.dataTransfer.files[i].name);
            }
        } 

        // Pass event to removeDragData for cleanup
        //removeDragData(e)

        this.setState({
            dragAndDropOn: false
        });
    }



     // _______  _____  ______  _______                              
     // |  |  | |     | |     \ |_____| |                            
     // |  |  | |_____| |_____/ |     | |_____                       
                                                                  
     // _______ _  _  _ _____ _______ _______ _     _ _______ _______
     // |______ |  |  |   |      |    |       |_____| |______ |______
     // ______| |__|__| __|__    |    |_____  |     | |______ ______|
                                                              
    openMenu(){
        this.setState({menuOn: true});
        // Note: because Strip Menu is nested inside this container
        //       it appear behind the next Strip container. 
        //       By toggling the z-index, it is propped up to the top.
        this.$node.current.setAttribute('style', 'z-index:1000;');
        this.$node.current.setAttribute('style', '');
    }


    // Generic function for hiding any modal or callouts
    hideComponent(stateName, spotlighted){
        if (stateName){
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

    // returns list of frame objects in order referencing children_li
    reorderFrames(strip){
        const frameIdList = strip.children_li.split(",");
        if (frameIdList==null || frameIdList==='') {return null;}

        let frameOrderedArr = Array.apply(null, Array(frameIdList.length));

        strip.frames.forEach((f)=>{
            const insertAt = frameIdList.indexOf(String(f.id));
            if (insertAt>=0 && insertAt<frameOrderedArr.length){
                frameOrderedArr[insertAt] = f; 
            }
            
        });

        return frameOrderedArr;

    }

    render(){
        const strip = this.props.stripObj;
        const index = this.props.index;
        const reorderedFrames = this.reorderFrames(strip);
        
        return (
            <li className={"flex_list " +
                           (this.props.spotlightedAll || this.state.selfSpotlighted ? "spotlighted" : "")} 
                onDragOver={(e)=>(this.handle_dragMessageToggle(e, true))}
                onDragLeave={(e)=>(this.handle_dragMessageToggle(e, false))}
                onDrop={this.handle_dragAndDrop}
                ref={this.$node}>
                {/* Keep flex_list position:relative to allow being "highlightable"
                    as well as allowing popups and callouts to appear around it */}
   
                <div className="strip_flex_toolbar">
                    <div className="header">
                        <span className="bigtext-2">{index}</span>
                        <span>id: {strip.id}</span>
                    </div>
                    <div className="tools">
                        <a className="tool_btn fas fa-play-circle"></a>
                        <a className="tool_btn fas fa-file-upload"></a>
                        <a className="tool_btn fas fa-pen"></a>
                        <MenuButton iconClass="tool_btn fas fa-trash" action={this.handle_deleteSceneConfirm}/>
                        <MenuButton iconClass="tool_btn fas fa-ellipsis-h" action={this.openMenu}/>

                    </div>
                    
                </div>
                
                {/* List of frames in this strip*/}
                <div className="strip_content">

                    {strip.frames == null || strip.frames.length === 0 || Object.keys(strip.frames).length === 0 ? 
                        (
                            <div className="strip_flex_container" stripid={strip.id}>
                                <div className="tile empty-strip ui-state-disabled">
                                    <span>No frames in this strip. Upload some!</span>
                                </div>
                            </div>
                        ) : (
                            <div className="strip_flex_container" stripid={strip.id}>
                                {reorderedFrames.map( (frame, index) => (
                                    <FrameCard frameObj={frame} delay={index+this.props.delay} key={"frame"+index}/>
                                ))}
                            </div>
                        )
                    }

                </div>

                {/* Message or modals */}
                <CardCover on={this.state.cardCoverOn} off={()=>{this.hideComponent("cardCoverOn", true)}}
                           setParentSpotlight={this.setSpotlight}/>
                <CardCover2 on={this.state.dragAndDropOn} off={()=>{this.hideComponent("cardCoverOn", true)}}
                            intangible={true}
                            messageType={this.state.cardCover_messageType}
                            setParentSpotlight={this.setSpotlight}/>
                <StripMenu on={this.state.menuOn} off={()=>{this.hideComponent("menuOn");}}
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
        this.state = {
            data: null
        }

        this.firstLoad = true;

        // incoming
        //this.props.toSceneCardList

    }

    componentDidMount(){
        const thisObj = this;

        // fetch? 
        axios({
            method: 'get',
            url: `/api/scene/${this.props.sceneId}/`,
          })
          .then(response => {
            console.log( "Fetch successful");
            thisObj.setState({data: response.data});
            this.firstLoad = false;
   
          })
          .catch(error => {
            console.log(error);
          })

    }


    componentDidUpdate(prevProps, prevState, snapshot){
        // It's okay to setState here. Just make sure it's 
        // inside a conditional to prevent infinite loop

        // Check inbox
        if (JSON.stringify(prevProps.dataInbox) != JSON.stringify(this.props.dataInbox)){
            console.log("MAIL TIME [SceneCardList]");
            // Mail time!
            const newData = this.appendData(this.state.data, this.props.dataInbox)
            this.setState({data: newData});
        }

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



    render (){

        return (
            <div>
            {this.state.data == null ? ( 
                    <p>Strip List Loading...</p>
                ) : (
                    <ul className="list_strips">
                        {this.state.data['strips'].map( (strip,index) => (
                             <StripCard stripObj={strip} 
                                        delay={this.firstLoad ? index : 1} 
                                        index={index+1}
                                        spotlightedAll = {this.props.spotlightedAll}
                                        key={"strip"+index}/>
                        )) } 
                    </ul>
                    
                ) //end: ternary
            }
            </div>
        ) //end: return
    } //end: render()


}


export {
    SceneCardList,
    FrameCard
};
