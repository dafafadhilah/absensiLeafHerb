import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedJobCodes }) => {
  const userJobCode = useSelector((state) => state.auth.user?.jobCode);

  // Kalau jobCode user nggak diizinin, redirect ke unauthorized
  if (allowedJobCodes && !allowedJobCodes.includes(userJobCode)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
