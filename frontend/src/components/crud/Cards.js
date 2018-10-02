import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import Spinner from "./../Spinner";
import key from "weak-key";


class FrameCard extends Component{

    constructor(props){
        super(props);
        this.thumbWidth = 180, //px
        this.state = {
            data: this.props.data,
            loading: true
        }
    }

    render(){
        const frame = this.props.data; 
        const thumbWidth = this.thumbWidth;

        // check if it has valid frames
        if (frame.hasOwnProperty("frame_image") && frame.frame_image != null && frame.frame_image != ""){

            return (
                <div className={"thumb "+ (this.state.loading && "loading")} frameid={frame.id}>
      
                    <div className="frame_image stretch">
                        {/* opacity 0. Used only to stretch out the thumbnail box*/}
                        <img src={frame.frame_image} width={thumbWidth+'px'}/>
                    </div>
                    
                    <div className="frame_image" 
                         style={{backgroundImage: `url(${frame.frame_image})` }}>
                        
                        <span className="overlay_box" frameid={frame.id}>
                            <a>[ {frame.id} ]</a>
                            <a className="frame_edit glyphicon glyphicon-pencil" aria-hidden="true" style={{fontSize:'1.2em'}}></a>
                            <a className="frame_delete glyphicon glyphicon-trash" aria-hidden="true" style={{fontSize:'1.2em'}}></a>
                            <a className="frame_options glyphicon glyphicon-option-horizontal" aria-hidden="true" style={{fontSize:'1.2em'}}></a>
                        </span>
                    </div>

                </div> 
            )
        } else {
            {/* Frame with invalid image */}
                <div className="thumb placeholder2" frameid="{frame.id}">
                <span>Missing Image</span>
                    <a href="" className="mini_menu edit">frame [{frame.id}]</a>
                </div>
        }
        
        

    }

}









class SceneCard extends Component {

    constructor(props){
        super(props);
        this.state = {
            data: null
        }
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
   
          })
          .catch(error => {
            console.log(error);
          })

    }

    // componentDidUpdate(){
  
    // }

    render (){



        return (
            <div>
            {this.state.data == null ? ( 
                    <p>Strip List Loading...</p>
                ) : (
                    <ul className="list_strips">
                        {this.state.data['strips'].map( (strip,index) => (
                            <li className="flex_list" stripid="{strip.id}">
   
                                <div className="strip_flex_toolbar">
                                    <div className="header">
                                        <span className="bigtext-2">{index}</span>
                                        <span>id: {strip.id}</span>
                                    </div>
                                    <div className="tools">
                                        <a className="strip_preview glyphicon glyphicon-play" aria-hidden="true"></a>
                                        <a className="strip_upload glyphicon glyphicon-upload" aria-hidden="true"></a>
                                        <a className="strip_edit glyphicon glyphicon-edit" aria-hidden="true"></a>
                                        <a className="strip_delete glyphicon glyphicon-trash" aria-hidden="true"></a>
                                        <a className="strip_options glyphicon glyphicon-option-horizontal" aria-hidden="true"></a>
                                    </div>
                                    
                                </div>
                                    
                                {strip.frames == null || strip.frames.length === 0 || Object.keys(strip.frames).length === 0 ? 
                                    (
                                        <div className="strip_flex_container" stripid={strip.id}>
                                            <div className="tile empty-strip ui-state-disabled">
                                                <span>No frames in this strip. Upload some!</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="strip_flex_container" stripid={strip.id}>
                                            {strip.frames.map( (frame, index) => (
                                                <FrameCard data={frame}/>
                                            ))}
                                        </div>
                                    )
                                }


                                <div className="strip_flex_editor">
                                    frame rate
                                </div>

                            </li> 
                        )) } 
                    </ul>
                    
                ) //end: ternary
            }
            </div>
        ) //end: return
    } //end: render()


}


export {
    SceneCard,
    FrameCard
};
