import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";

// Custom helpers
import Helper from "./../Helper"
const h = new Helper();




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
                </div>
            )

        case "invalidForm":
            return (
                <div className="cover_message">
                    <p className="color red">
                        <span className="bigtext-1 far fa-frown-open"></span>
                    </p>

                    <p><span>Oh no, something broke! Cannot send information.</span></p>

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

        // Some cover message is supposed to be intangible, but some messages
        // have confirmation button, which requires them to be tangible.
        this.intangibilityMap = {
            default: true, //probably for drag and drop
            frameCreateError: false,
            wrongFileType: true,
            invalidForm: false,
        }
        
    }

    render(){
        const intanMap = this.intangibilityMap;
        const intangible = intanMap.hasOwnProperty(this.props.messageType) ? intanMap[this.props.messageType] : intanMap.default;
        return (
            <div className={"cover light drag_and_drop " + 
                            (this.props.on ? "active" : "") + " " +
                            (intangible ? "intangible" : "")}
                 onDrop={(e)=>{e.preventDefault()}}>
      
                    {getCardCoverMessage(this.props.messageType)}
            </div>
        )
    }
}

export {
    CardCover2,
    getCardCoverMessage
};