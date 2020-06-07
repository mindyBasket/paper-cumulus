import * as React from "react";
import * as ReactDOM from "react-dom";

import { Hello } from "./components/Hello";

const entryElem = document.getElementById("react_entry");

if (entryElem) {
    ReactDOM.render(
        <Hello compiler="TypeScript" framework="React" />,
        document.getElementById("react_entry")
    );   
} else {
    console.error("Could not find entry point to render");
}
