import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import FrameFeeder from "./FrameFeeder";
import key from "weak-key";


const FrameBundle = ({ data }) => {
	data = new Array(data); //unify format
	return (
		!data || !data.length ? (
			<p>Nothing to show</p>
		) : (
			<div className="fit_block frame_load">
		  
				{/* <strong>{data.length} Scenes</strong> */}
			 	
			 	{/* data.strips is an array of JSON objects */}
				{console.log(data[0]['strips'])}
				{data[0]['strips'].map(el_strip => (
					<span className="strip" id={el_strip.id} key={key(el_strip)}>

						{el_strip.frame_set.map(frame_list => {
							JSON.stringify(scene_prop[1])
							return ();
						})}
						This should have image

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
			<div className="frame_view wide">
				{/* -- fit_block frame_load --*/}
				<FrameFeeder endpoint="/api/scene/1/" 
								render={data => <FrameBundle data={data} />} />

				{/* -- cover for hiding frames --*/}		
				<div className="fit_block stage">
				</div>

			</div>
		)
	}

}


// const Flipbook = () => (
//   <Curtain color="black"/>
// );

// render flipbook
const wrapper = document.getElementById("flipbook-player");
wrapper ? ReactDOM.render(<FlipbookPlayer />, wrapper) : null;