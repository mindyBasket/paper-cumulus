import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";

import { FileInputButton } from "./../UI";


// Custom helpers
import Helper from "./../Helper"
const h = new Helper();




 

function getRandomGreeting(){

    const greetings = [
        "Hello!",
        "What's up?",
        "Guten Tag!",
        "Hey friend!",
        "How are you?",
        "안녕하세요!"
    ]

    return greetings[ Math.round(Math.random()*(greetings.length-1)) ];
}

function getCardCoverMessage(templateName, offFunc, handlerMap){

    // WARNING: This function is used by all of CardCovers. Do not bind(this) to it.
    //          It will only work for the first binder. 

    switch (templateName){
        case "default":
            return (
                <div className="cover_message">
                    <p>
                        <span className="bigtext 1">{getRandomGreeting()}</span>
                    </p>
                </div>
            )

        case "dragAndDrop":
            return (
                <div className="cover_message">
                    <p className="color red">
                        <span className="bigtext-1 fas fa-plus-circle"/>
                        <span className="bigtext-1 fas fa-file-image"/>
                    </p>
                    <p>
                        <span className="bigtext 1">Drop images to make frames</span>
                    </p>
                </div>
            )

        case "upload":
            let handle_createFrame = () => {}
            if (handlerMap && handlerMap.hasOwnProperty('createFrame')){
                handle_createFrame = handlerMap.createFrame;
            }
            return (
                <div className="cover_message columns">
                    <div className="center">
                        <FileInputButton message="Choose file"
                                         fieldLabel="frame_image"
                                         action={handle_createFrame}
                                         onClickAction={offFunc}/>
                    </div>
                    <p className="center">
                        <span className="bigtext-2">OR</span>
                    </p>
                    <p className="center">
                        <span className="bigtext-1 fas fa-file-upload"></span>
                        <br/>
                        <span className="bigtext-3">drag and drop</span>
                    </p>
                    
                </div>           
         
            )

        case "deleteConfirm":
            let handle_deleteScene = () => {}
            if (handlerMap && handlerMap.hasOwnProperty('deleteScene')){
                handle_deleteScene = handlerMap.deleteScene;
            }
            return (
                <div className="cover_message">
                    <p>
                    <span className="bigtext 2">Are you sure you want to delete this scene?</span>
                    </p>
                    <p>
                        <span>
                            <button onClick={()=>{
                                        offFunc(); 
                                        handle_deleteScene();
                                    }} 
                                    className='warning'>DELETE</button>
                            <button onClick={offFunc}>Cancel</button>
                        </span>
                    </p>
                </div>           
         
            )

        case "frameCreateError":
            return (
                <div className="cover_message">
                    <p className="color red">
                        <span className="bigtext-1 far fa-frown-open"></span>
                        <span>Aww, it didn't work!</span>
                    </p>

                    <p>
                        <button>Sorry about that</button>
                    </p>
                </div>
            )

        case "wrongFileType":
            return (
                <div className="cover_message">
                    <p className="color red">
                        <span className="bigtext-1 far fa-file-image"></span>
                        <span className="bigtext-1 fas fa-question"></span>
                    </p>

                    <p> 
                        <span>Wrong file type. Please upload .png, .gif, or .jpg</span>
                    </p>

                    <p>
                        <button onClick={offFunc}>Doh</button>
                    </p>
                </div>
            )

        case "invalidForm":
            return (
                <div className="cover_message">
                    <p className="color red">
                        <span className="bigtext-1 far fa-frown-open"></span>
                    </p>

                    <p><span>Something went wrong! Cannot send information.</span></p>

                    <p>
                        <button>Sorry about that</button>
                    </p>
                </div>
            )
    }
}

class CardCover extends PureComponent {
    constructor(props){
        super(props);
        this.r = React.createRef();

        // prop reference
        // this.props.setStripState // for communication with parent(Strip)

        // Some cover message is supposed to be intangible, but some messages
        // have confirmation button, which requires them to be tangible.
        // this.intangibilityMap = {
        //     default: true, //for drag and drop
        //     deleteConfirm: false,
        //     frameCreateError: false,
        //     wrongFileType: false,
        //     invalidForm: false,
        // }

        this.behaviorMap = {
            default:            {intangible: true, spotlight: true},

            dragAndDrop:        {intangible: true, spotlight: false},
            upload:             {intangible: false, spotlight: true},
            deleteConfirm:      {intangible: false, spotlight: true},

            frameCreateError:   {intangible: false, spotlight: true},
            wrongFileType:      {intangible: false, spotlight: false},
            invalidForm:        {intangible: false, spotlight: false}
        }
        
        
        this.getBehavior = this.getBehavior.bind(this);

        // public
        getCardCoverMessage = getCardCoverMessage.bind(this);

    }

    componentDidUpdate(prevProps, prevState, snapshot){
        console.log("Message type set to: " + this.props.messageType);
        const behavior = this.getBehavior(this.props.messageType);

        // check if this card was rendered to be active, 
        // then control lightbox
        if        (prevProps.on == false && this.props.on == true){
            if (behavior.spotlight) { this.props.setParentSpotlight(true); }

        } else if (prevProps.on == true && this.props.on == false){
            this.props.setParentSpotlight(false);
        }
    }


    getBehavior(msgType){
        const bmap = this.behaviorMap;
        return bmap.hasOwnProperty(msgType) ? bmap[msgType] : bmap.default;
    }

    render(){
        const bmap = this.behaviorMap;
        const msgType = this.props.messageType;
        const handlerMap = {
            "createFrame": this.props.handle_createFrame, 
            "deleteScene": this.props.handle_deleteScene
        } 

        let intangible = bmap.hasOwnProperty(msgType) ? bmap[msgType].intangible : bmap.default.intangible;
        return (
            <div className={"cover light drag_and_drop" + 
                            (this.props.on ? " active" : "") +
                            (intangible ? " intangible" : "")}
                 onDrop={(e)=>{e.preventDefault()}}>
      
                    {getCardCoverMessage(msgType, this.props.off, handlerMap )}
            </div>
        )
    }
}

export {
    CardCover,
    getCardCoverMessage
};