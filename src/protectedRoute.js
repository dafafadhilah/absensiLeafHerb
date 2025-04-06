import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "utils/supabaseClient";
import { Spin } from "antd";

const ProtectedRoute = ({ allowedJobCodes, children }) => {
  const [status, setStatus] = useState("loading"); // loading | unauthorized | forbidden | allowed
  console.log("daf");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        setStatus("unauthorized"); // belum login
        return;
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("job_code")
        .eq("id", userId)
        .single();

      if (error || !allowedJobCodes.includes(userData.job_code)) {
        setStatus("forbidden"); // login tapi gak punya akses
        return;
      }

      setStatus("allowed");
    };

    fetchUser();
  }, [allowedJobCodes]);

  if (status === "loading") {
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
  }

  if (status === "unauthorized") return <Navigate to="/login" replace />;
  if (status === "forbidden")
    return <Navigate to="/admin/unauthorized" replace />;
  return children;
};

export default ProtectedRoute;
