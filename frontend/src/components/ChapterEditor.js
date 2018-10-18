import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import { LightBox, lightBox_publicFunctions as lb } from "./LightBox";
import Spinner from "./Spinner";

// Custom helpers
import Helper from "./Helper"
const h = new Helper();
import XhrHandler from "./crud/XHRHandler"
const axh = new XhrHandler(); //axios helper


// Note: Chapter editor is kept extremely minimal due to time constraint. 
// 		 It only render a single button that creates new scene. That's it.


class SceneCreateModal extends PureComponent{


	constructor(props){
		super(props);
		
		this.r_form = React.createRef();
		this.chapterId = document.querySelector('#ref-content').getAttribute("chapterId");
		// this.$node = React.createRef();
		
		this.state = {
			valid: false
		}

		this.handle_nameChange = this.handle_nameChange.bind(this);
		this.handle_createScene = this.handle_createScene.bind(this);
	}

	componentDidUpdate(prevProps, prevStates){


		// check if this card was rendered to be active, 
        // then control lightbox
        // if        (prevProps.on == false && this.props.on == true){
        //     //if (behavior.spotlight) { this.props.setParentSpotlight(true); }

        // } else if (prevProps.on == true && this.props.on == false){
        //     //this.props.setParentSpotlight(false);
        // }
	}

	handle_nameChange(){
		const nameField = this.r_form.current.querySelector("#scene_name");
		if (nameField.value != ''){
			console.log("has valuw");
		}

		if (nameField && nameField.value != ''){
			this.setState({valid: true});
		} else {
			this.setState({valid: false})
		}
	}
	
	handle_createScene(){
		const chapter = this.props.chapterObj;
		const fd = h.makeFormData({chapter: chapter.id })

		axh.createScene(chapter.id, fd, axh.getCSRFToken()).then(res=>{
			console.log("Something came back");
			console.log(JSON.stringify(res.data));

			// take the user there
			// since I don't want to hardcode any url...trying to call DJango for this.
			// const args = h.makeFormData({'budgie': "inay"}); // yeah doesn't work like that

			axh.django_getSceneUrl("flipbooks:scene-edit", {'pk': res.data.id}).then(res=>{
				if (res.data && res.data.hasOwnProperty('url') && res.data.url ) {
					window.location.href = res.data.url;
				} else {
					console.error("Something went wrong while creating new Scene");
				}
				
			});


			
		});
	}

	render(){
		const chapter = this.props.chapterObj;
		return (
			<div id="light_box_modal" 
				 className={this.props.on ? "active" : ""} 
				 object="scene">

				<div class="header">
					<span class="bigtext-2">{chapter.title}</span>
					|
					<span>New scene</span>
				</div>

				<div className="scene_form_content" ref={this.r_form}>
				 	<span>Name: <input id="scene_name" type="text" onChange={this.handle_nameChange}/></span>

				 	<span className="align_right">
				 		<button className={this.state.valid ? "" : "disabled"}
				 				onClick={this.handle_createScene}>
				 			Create
				 		</button>
				 	</span>
				</div>
				 
				 
			</div>
		)
	}

}



// http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=FrameStage

// ███████╗██████╗ ██╗████████╗ ██████╗ ██████╗ 
// ██╔════╝██╔══██╗██║╚══██╔══╝██╔═══██╗██╔══██╗
// █████╗  ██║  ██║██║   ██║   ██║   ██║██████╔╝
// ██╔══╝  ██║  ██║██║   ██║   ██║   ██║██╔══██╗
// ███████╗██████╔╝██║   ██║   ╚██████╔╝██║  ██║
// ╚══════╝╚═════╝ ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
                                             

class ChapterEditor extends Component{

	constructor(props){
		super(props);
		
		this.chapter={
			id: document.querySelector('#ref-content').getAttribute("chapterId"),
			title: document.querySelector('#ref-content').getAttribute("chapterTitle")
		}

		// this.$node = React.createRef();
		
		this.state = {
			sceneCreateOn: false
		}

		this.handle_openSceneCreateModal = this.handle_openSceneCreateModal.bind(this);

	}

	handle_openSceneCreateModal(){
		console.log("Create scene under chapter " + this.chapterId);
		lb.pub_LightBox_addToOnClick( ()=>{this.setState({sceneCreateOn: false})} );
		lb.pub_LightBox_on();
		this.setState({sceneCreateOn: true});
		

	}

	render(){
		return(
			<div>
				<button onClick={this.handle_openSceneCreateModal}>+ Scene</button>

				{/* invisible */}
				<LightBox addToOnClick={this.addTo_LightBoxOnClick}
						  handle_dragAndDrop={this.handle_dragAndDrop}
						  setParentState={this.setParentState}/>

				<SceneCreateModal on={this.state.sceneCreateOn}
								  chapterObj={this.chapter}/>

			</div>
		)
	}

}


// render flipbook
const wrapper = document.getElementById("chapter_editor_wrapper");

// const refNode = wrapper ? document.getElementById("ref").querySelector("#ref-content") : null;
// const sceneId = wrapper ? refNode.getAttribute("sceneId") : null;
wrapper ? ReactDOM.render(<ChapterEditor/>, wrapper) : null;


