import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { Theme } from "@radix-ui/themes";
import store from "./store";
import "./index.css"; // ✅ Must be at top

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <Theme appearance="light" accentColor="indigo" radius="large" scaling="100%">
            <App />
          </Theme>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
