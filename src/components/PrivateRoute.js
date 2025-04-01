import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import CustomModal from "../components/CustomModal";

const PrivateRoute = () => {
  const token = localStorage.getItem("token");
  const tokenExpire = localStorage.getItem("tokenExpire");
  const [modal, setModal] = useState({
    visible: false,
    type: "",
    message: "",
  });

  useEffect(() => {
    if (!token || Date.now() > tokenExpire) {
      localStorage.clear();
      setModal({
        visible: true,
        type: "error",
        message: "Session anda telah habis, silakan login kembali!",
      });
    }
  }, [token, tokenExpire]);

  if (!token || Date.now() > tokenExpire) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <>
      <Outlet />
      <CustomModal
        visible={modal.visible}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal({ ...modal, visible: false })}
      />
    </>
  );
};

export default PrivateRoute;
