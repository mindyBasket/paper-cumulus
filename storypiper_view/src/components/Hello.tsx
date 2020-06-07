import * as React from "react";
import renamedUtilFunction from "@Storypiper/utils/testUtils";

export interface HelloProps { compiler: string; framework: string; }

export const Hello = (props: HelloProps) => {
  return (
    <div>
        <h1>Hello from {props.compiler} and {props.framework}! </h1>
        <p>
          {renamedUtilFunction("Lucas")}
        </p>
    </div>
  );
}