import "bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import React from "react";
import * as ReactDOM from "react-dom/client";

import { MarineSearchPrep } from "./marine-sar-search-prep";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<MarineSearchPrep />);
