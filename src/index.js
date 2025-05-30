import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux"; // Import Provider Redux
import store from "./redux/store"; // Import store Redux

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    {/* Wrap dengan Provider */}
    <BrowserRouter>
      <Routes>
        {/* Halaman Admin Terproteksi */}
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* Halaman Auth */}
        <Route path="/auth/*" element={<AuthLayout />} />

        {/* Redirect jika path tidak ditemukan */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);
