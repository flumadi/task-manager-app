/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React from "https://esm.sh/react@18.2.0?deps=react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client?deps=react@18.2.0,react-dom@18.2.0";
import App from "./components/App.tsx";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);