import { configure } from "mobx";
import * as ReactDOMClient from "react-dom/client";

import App from "./App";

configure({
  enforceActions: "always",
  computedRequiresReaction: true,
  disableErrorBoundaries: process.env.NODE_ENV === "development",
  reactionRequiresObservable: true,
  observableRequiresReaction: false,
});

const rootElement = document.getElementById("root");
const root = ReactDOMClient.createRoot(rootElement!);

root.render(
  // <StrictMode>
  <App />,
  // </StrictMode>
);
