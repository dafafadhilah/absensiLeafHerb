import Index from "views/Index.js";
import Profile from "views/examples/Profile.js";
import Maps from "views/examples/Maps.js";
import Tables from "views/examples/Tables.js";
import Icons from "views/examples/Icons.js";
import Register from "views/examples/Register";
import Login from "views/examples/Login";
import ForgotPassword from "views/examples/ForgotPassword";
import ResetPassword from "views/examples/ResetPassword";
import Absensi from "views/employee/Absensi";
import KoreksiAbsensi from "views/employee/KoreksiAbsensi";
import AbsensiKaryawan from "views/boss/AbsensiKaryawan";
import Todolist from "views/boss/Todolist";

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
  },
  {
    path: "/icons",
    name: "Icons",
    icon: "ni ni-planet text-blue",
    component: <Icons />,
    layout: "/admin",
    allowedJobCodes: ["template"],
  },
  {
    path: "/maps",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: <Maps />,
    layout: "/admin",
    allowedJobCodes: ["template"],
  },
  {
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: <Profile />,
    layout: "/admin",
  },
  {
    path: "/absensi",
    name: "Absensi",
    icon: "ni ni-tag text-green",
    component: <Absensi />,
    layout: "/admin",
    allowedJobCodes: ["employee"],
  },
  {
    path: "/koreksiAbsensi",
    name: "Request Koreksi Absensi",
    icon: "ni ni-ui-04 text-orange",
    component: <KoreksiAbsensi />,
    layout: "/admin",
    allowedJobCodes: ["employee"],
  },
  {
    path: "/absensiKaryawan",
    name: "Absensi Karyawan",
    icon: "ni ni-tag text-green",
    component: <AbsensiKaryawan />,
    layout: "/admin",
    allowedJobCodes: ["boss"],
  },
  {
    path: "/todolist",
    name: "Todolist",
    icon: "ni ni-check-bold text-blue",
    component: <Todolist />,
    layout: "/admin",
    allowedJobCodes: ["boss"],
  },
  {
    path: "/tables",
    name: "Tables",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Tables />,
    layout: "/admin",
    allowedJobCodes: ["template"],
  },
  {
    path: "/register",
    name: "Register",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Register />,
    layout: "/auth",
    allowedJobCodes: ["auth"],
  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Login />,
    layout: "/auth",
    allowedJobCodes: ["auth"],
  },
  {
    path: "/forgotPassword",
    name: "ForgotPassword",
    icon: "ni ni-bullet-list-67 text-red",
    component: <ForgotPassword />,
    layout: "/auth",
    allowedJobCodes: ["auth"],
  },
  {
    path: "/resetPassword",
    name: "ResetPassword",
    icon: "ni ni-bullet-list-67 text-red",
    component: <ResetPassword />,
    layout: "/auth",
    allowedJobCodes: ["auth"],
  },
];
export default routes;
