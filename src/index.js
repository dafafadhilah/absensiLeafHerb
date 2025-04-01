import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";
import PrivateRoute from "components/PrivateRoute"; // Import proteksi halaman admin

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      {/* Halaman Admin Terproteksi */}
      <Route element={<PrivateRoute />}>
        <Route path="/admin/*" element={<AdminLayout />} />
      </Route>

      {/* Halaman Auth */}
      <Route path="/auth/*" element={<AuthLayout />} />

      {/* Redirect jika path tidak ditemukan */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  </BrowserRouter>
);
