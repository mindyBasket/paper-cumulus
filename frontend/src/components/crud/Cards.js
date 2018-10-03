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
            loading: true
        }

        this.$node = React.createRef();
        
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

    render(){
        const frame = this.props.frameObj; 
        const thumbWidth = this.thumbWidth;

        // check if it has valid frames
        if (frame.hasOwnProperty("frame_image") && frame.frame_image != null && frame.frame_image != ""){

            return (
                <div className={"thumb "+ (this.state.loading && "loading")} 
                     frameid={frame.id} ref={this.$node}>
      
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






// ███████╗ ██████╗███████╗███╗   ██╗███████╗
// ██╔════╝██╔════╝██╔════╝████╗  ██║██╔════╝
// ███████╗██║     █████╗  ██╔██╗ ██║█████╗  
// ╚════██║██║     ██╔══╝  ██║╚██╗██║██╔══╝  
// ███████║╚██████╗███████╗██║ ╚████║███████╗
// ╚══════╝ ╚═════╝╚══════╝╚═╝  ╚═══╝╚══════╝
                                          


class SceneCard extends Component {

    constructor(props){
        super(props);
        this.$node = React.createRef();

    }

    shouldComponentUpdate(nextProps, nextState) {

      if (JSON.stringify(this.props.stripObj) != JSON.stringify(nextProps.stripObj)){
        return true;
      }
      return false;
    }

    componentDidMount(){
        //console.log(JSON.stringify(this.$node.current));
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
                    duration: 400,
                    elasticity: 200
                });   
        
    }


    render(){
        const strip = this.props.stripObj;
        const index = this.props.index;

        return (
            <li className="flex_list" stripid="{strip.id}" key={key({stripkey: strip})} ref={this.$node}>
   
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
                                <FrameCard frameObj={frame} delay={index+this.props.delay} key={key({frameKey: frame})}/>
                            ))}
                        </div>
                    )
                }


                <div className="strip_flex_editor">
                    frame rate
                </div>

            </li>
        )
    }
}







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
        console.log("Component did update");

        // It's okay to setState here. Just make sure it's 
        // inside a conditional to prevent infinite loop

        // Check inbox
        if (JSON.stringify(prevProps.dataInbox) != JSON.stringify(this.props.dataInbox)){
            console.log("MAIL TIME [SceneCardList]");
            // Mail time!
            const newData = this.appendData(this.state.data, this.props.dataInbox)
            this.setState({data: newData});

            //Empty mailbox
            // oh ...props is read only. ]: I can't do this. 
            // this.props.dataInbox = {};
        }

    }


    // takes only one key from newData. Rest will be ignored for now.
    appendData(data, newData){
        console.log("New DAta looks like this: " + JSON.stringify(newData.newStrip));

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
                             <SceneCard stripObj={strip} delay={this.firstLoad ? index : 1}/>
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
