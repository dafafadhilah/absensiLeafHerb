// protectedRoute.js
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "utils/supabaseClient";
import { Spin } from "antd";

const ProtectedRoute = ({ allowedJobCodes, children }) => {
  const [isAllowed, setIsAllowed] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return setIsAllowed(false);

      const { data, error } = await supabase
        .from("users")
        .select("job_code")
        .eq("id", userId)
        .single();

      if (error || !allowedJobCodes.includes(data.job_code)) {
        setIsAllowed(false);
        return;
      }

      setIsAllowed(true);
    };

    fetchUser();
  }, [allowedJobCodes]);

  if (isAllowed === null)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );

  if (isAllowed === false) return <Navigate to="/admin/unauthorized" replace />;
  return children;
};

export default ProtectedRoute;
