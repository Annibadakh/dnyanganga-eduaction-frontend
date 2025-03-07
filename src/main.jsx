// import React from "react";
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import App from "./App";
// import './index.css';

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// );

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./Context/AuthContext";
import './index.css';
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ Wrap the entire app with AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
