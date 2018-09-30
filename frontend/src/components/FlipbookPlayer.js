import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import FrameFeeder from "./FrameFeeder";
import key from "weak-key";


const FrameStage = ({ data }) => {
	data = new Array(data); //unify format
	return (
		!data || !data.length ? (
			<p>Nothing to show</p>
		) : (
			<div className="frame_stage">
		  
				{/* <strong>{data.length} Scenes</strong> */}
			 	
			 	{/* data.strips is an array of JSON objects */}
				{data[0]['strips'].map(el_strip => (
					<span className="strip" id={el_strip.id} key={key(el_strip)}>

						{el_strip.frames.map(el_frame => {
							JSON.stringify(el_frame[1]);
							return (
								<img src={el_frame.frame_image} className="frame_item" key={key(el_frame)}/>
							);
						})}
					</span>


				))} {/* end of data.map() */}
				

					
		
			</div>

		)
	)
}


class FlipbookPlayer extends Component{

	constructor(props){
		super(props);

		this.state = {

		}
	}

	render (){
		return (
			<div className="flipbook_player">
				{/* -- fit_block frame_load --*/}
				<div className="frame_window">
					<FrameFeeder endpoint="/api/scene/1/" 
								render={data => <FrameStage data={data} />} />
				</div>
			</div>

		)
	}

}


// const Flipbook = () => (
//   <Curtain color="black"/>
// );

// render flipbook
const wrapper = document.getElementById("letterbox");
wrapper ? ReactDOM.render(<FlipbookPlayer />, wrapper) : null;