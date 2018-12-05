import React, { Component, PureComponent } from "react";
import { lightBox_publicFunctions as lb } from "./../LightBox";
import ReactDOM from "react-dom";



//http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=Jxs%20Msg

//      ██╗███████╗██╗  ██╗    ███╗   ███╗███████╗ ██████╗ 
//      ██║██╔════╝╚██╗██╔╝    ████╗ ████║██╔════╝██╔════╝ 
//      ██║███████╗ ╚███╔╝     ██╔████╔██║███████╗██║  ███╗
// ██   ██║╚════██║ ██╔██╗     ██║╚██╔╝██║╚════██║██║   ██║
// ╚█████╔╝███████║██╔╝ ██╗    ██║ ╚═╝ ██║███████║╚██████╔╝
//  ╚════╝ ╚══════╝╚═╝  ╚═╝    ╚═╝     ╚═╝╚══════╝ ╚═════╝ 
                                                        

                                                        
const getJSXDemoMessage = function(msgIndex, staticroot) {
	staticroot = staticroot || "/static/";
	if (staticroot[staticroot.length-1] != "/"){
		staticroot = staticroot + "/"
	}

	const jsxArr = [

		// Message 1
		[
			<div id="msg1">
				<h3>Welcome!</h3>
				<img src={`${staticroot}img/tutorial/tut01a_flipbook.jpg`}/>
				<p>
					This app makes shareable instances of <strong>"flipbook"</strong>.                  
					It is somewhere <strong>between a movie and a storyboard</strong>, 
					an experimenal way to tell a story scenamatically but at low-cost.
		        </p>
		    </div>
		    ,
		    <div id="msg2">
				<h3>Getting started</h3>
				<img src={`${staticroot}img/tutorial/tut01b_download.jpg`}/>
				<p>
					This demo chapter contains an <strong>incomplete stop-motion 
					animation</strong>. Images used to complete it can be 
					<strong>downloaded</strong>. Or, you can experiment with your own images.
				</p>
			</div>
		    ,
		    <div id="msg3">
				<h3>Getting started</h3>
				<img src={`${staticroot}img/tutorial/tut01c.jpg`}/>
				<p>
					Click <strong>'View from the start'</strong> to see what a flipbook looks like for this
					demo chapter. 
				</p>
				<span className="img_space">
					<img src={`${staticroot}img/tutorial/tut01d.jpg`}
					 	 className="no_stretch"/>
				</span>
				<p>
					The green guide buttons are there to help you!
				</p>
			</div>
		],



		// Message 2
		[
			<div id="msg1">
		    	<h3>Flipbook View</h3>
		    	<img src={`${staticroot}img/tutorial/tut02a_strip.jpg`}/>
				<p>
					Use your <strong>arrow keys:  
					<span class="bigtext-3 far fa-caret-square-left"></span>
					<span class="bigtext-3 far fa-caret-square-right"></span></strong> to view.
					More control options are coming soon.
				</p>
				<p>
					Hover over the scrubber to see which strip it corresponds to.
				</p>
			</div>
			,
			<div id="msg2">
		    	<h3>Animation</h3>
		    	<img src={`${staticroot}img/tutorial/tut02b_strip.jpg`}/>
		    	<img src={`${staticroot}img/tutorial/tut02c_strip.jpg`}/>
				<p>
					Each key press 
					<span class="bigtext-3 far fa-caret-square-left"></span>
					<span class="bigtext-3 far fa-caret-square-right"></span>
					"animates" one <strong><span className="bigtext-3 fas fa-film"/>strip</strong>.
				</p>
			</div>
			,
			<div id="msg3">
		    	<h3>Editing a flipbook</h3>
				<img src={`${staticroot}img/tutorial/tut02d.jpg`}/>
				<p>
					After viewing, you can see flipbook details and make any changes in the edit mode.
				</p>
			</div>
		],



		// Message 3
		[
			<div id="msg1">
				<h3>Scenes</h3>
				<img src={`${staticroot}img/tutorial/tut03a_scene.jpg`}/>
				<p>
					A group of <span className="bigtext-3 fas fa-film"/>strips 
					makes a <strong><span className="bigtext-3 fas fa-video"/>scene
					</strong>.
				</p>
				<img src={`${staticroot}img/tutorial/tut03b_chapter.jpg`}/>
				<p>
					A collection of <span className="bigtext-3 fas fa-video"/>scenes makes 
					a <strong>chapter</strong>. 
				</p>
			</div>
			,
			<div id="msg2">
				<h3>Editing</h3>
				<img src={`${staticroot}img/tutorial/tut03c.jpg`}/>
				<p>
					Add new images to generate new <strong>
					<span className="bigtext-3 fas fa-sticky-note"/>frames</strong> under a 
					<span className="bigtext-3 fas fa-film"/>strip. 
				</p>
				<p>
					You can bulk upload, reorder frames and strips, preview strip animations, and more.
				</p>
			</div>
		]
	];

	return jsxArr[msgIndex];
}








// ███╗   ███╗ ██████╗ ██████╗  █████╗ ██╗     
// ████╗ ████║██╔═══██╗██╔══██╗██╔══██╗██║     
// ██╔████╔██║██║   ██║██║  ██║███████║██║     
// ██║╚██╔╝██║██║   ██║██║  ██║██╔══██║██║     
// ██║ ╚═╝ ██║╚██████╔╝██████╔╝██║  ██║███████╗
// ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
                                            
class DemoModal extends PureComponent{

	constructor(props){
		super(props);

		// prop ref
		// this.props.messageNum

		this.message = [];

		this.state={
			currPage: 0
		}

		this.nextMsg=this.nextMsg.bind(this);
		this.prevMsg=this.prevMsg.bind(this);
		
	}

	componentDidMount(){
		// select message
		// switch(this.props.messageNum) {
		//     case 1:
		//         this.message = JSXMESSAGE1;
		//         break;
		//     case 2:
		//         this.message = JSXMESSAGE2;
		//         break;
		//     case 3:
		//         this.message = JSXMESSAGE3;
		//         break;
		//     default:
		//         this.message = [];
		// }

		// get static root
		const refDom = document.querySelector("#dtemplt_ref");
		const STATIC_ROOT = refDom ? refDom.getAttribute("staticroot") : undefined;

		
		this.message = getJSXDemoMessage(this.props.messageNum-1, STATIC_ROOT);
	}

	componentDidUpdate(prevProps, prevStates){
		console.log("prev: " + prevProps.on + "...curr " + this.props.on);
		// check if this card was rendered to be active, 
  		// then control lightbox
        if        (prevProps.on == false && this.props.on == true){
            lb.pub_LightBox_on();
            this.setState({currPage: 0}); //reset page
	        lb.pub_LightBox_addToOnClick( ()=>{
				this.props.close();
			});
        } else if (prevProps.on == true && this.props.on == false){
            lb.pub_LightBox_off();
            this.props.close();
        }


	}

	nextMsg(){
		if(this.state.currPage < this.message.length-1){
			this.setState({currPage: this.state.currPage+1});
		}
	}
	prevMsg(){
		if(this.state.currPage > 0){
			this.setState({currPage: this.state.currPage-1});
		}
	}

	render(){
		if (this.message && this.message.length > 0){
			const pageNum = this.state.currPage;
			const maxPageNum = this.message.length;

			return(
				<div className={"demo_modal " +
								(this.props.on ? "active":"")}
					 onClick={(e)=>{e.stopPropagation()}}>
					<div className="message_wrapper">
						{this.message[pageNum]}
					
						<span className="message_nav">
							{pageNum <= 0 ? (
								<span></span> 
							) : (
								<span className="button flat" 
								  	  onClick={this.prevMsg}>
									{`< Page ${pageNum}`}
								</span>
								
							)}
							
							{pageNum >= maxPageNum-1 ? (
								<span className="button flat"
									  onClick={this.props.close}>
									Close
								</span>
							) : (
								<span className="button flat"
									  onClick={this.nextMsg}>
									{`Page ${pageNum+2} >`}
								</span>
								
							)}
							
						</span>
					</div>
				</div>
			)
		} else {
			return false
		}
		
	}
}



class DemoGuideBtn extends PureComponent{

	constructor(props){
		super(props);

		this.r = React.createRef();

		this.state = {
			messageOpen: false
		}

		this.openDemoMessage=this.openDemoMessage.bind(this);
		this.closeDemoMessage=this.closeDemoMessage.bind(this);
	}

	componentDidMount(){

		// Show the modal first thing when mounted, but
		// don't do it if there is no local storage on the browser!
		if(this.props.onAtMount==true) {
			const currTutIndex = window.localStorage.getItem("currTutIndex"); 
			if(window.localStorage){
				if( currTutIndex != null){
					if(this.props.num > currTutIndex){
						// This page is new to the user
						this.openDemoMessage();
						window.localStorage.setItem("currTutIndex", this.props.num);
					}
				} else {
					// currTutIndex was never set
					this.openDemoMessage();
					window.localStorage.setItem("currTutIndex", this.props.num);
				}
			}
		}

		if(this.props.proxyId != null || this.props.proxyId != undefined){
			// append to proxy
			const proxy = document.querySelector(this.props.proxyId);
			if(proxy){
				proxy.appendChild(this.r.current);
			}	  
		}
	}

	openDemoMessage(){
		this.setState({messageOpen: true});
	}

	closeDemoMessage(){
		this.setState({messageOpen: false});
	}

	render(){

		return (
			<button className="demoguide"
					onClick={this.openDemoMessage}
					ref={this.r}>
				<span className="far fa-lightbulb"></span>
				{`#${this.props.num}`}
	
				<DemoModal on={this.state.messageOpen}
						   close={this.closeDemoMessage}
						   messageNum={this.props.num}/>
			</button>
		)
	}

}


export {
    DemoModal,
    DemoGuideBtn
};