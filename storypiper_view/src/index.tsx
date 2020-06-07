import * as React from "react";
import * as ReactDOM from "react-dom";

import { Hello } from "./components/Hello";

export default ReactDOM.render(
    <Hello compiler="TypeScript" framework="React" />,
    document.getElementById("react_entry")
);
