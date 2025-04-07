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
import RekapAbsensi from "views/boss/RekapAbsensi";
import RekapGaji from "views/boss/RekapGaji";
import RekapLembur from "views/boss/RekapLembur";
import Todolist from "views/boss/Todolist";
import PengajuanLembur from "views/employee/PengajuanLembur";
import Perizinan from "views/employee/Perizinan";
import Unauthorized from "views/Unauthorized";
import ProtectedRoute from "protectedRoute"; // Proteksi halaman admin

var routes = [
  // Menu Utama
  {
    category: "Menu Utama",
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: (
      <ProtectedRoute allowedJobCodes={["crew", "crew Leader", "admin"]}>
        <Index />
      </ProtectedRoute>
    ),
    layout: "/admin",
    allowedJobCodes: ["crew", "crew Leader", "admin"],
  },
  {
    category: "Menu Utama",
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-dark",
    component: (
      <ProtectedRoute allowedJobCodes={["crew", "crew Leader", "admin"]}>
        <Profile />
      </ProtectedRoute>
    ),
    layout: "/admin",
    allowedJobCodes: ["crew", "crew Leader", "admin"],
  },

  // Menu Template
  {
    category: "Menu Template",
    path: "/icons",
    name: "Icons",
    icon: "ni ni-planet text-blue",
    component: (
      <ProtectedRoute allowedJobCodes={["template", "admin"]}>
        <Icons />
      </ProtectedRoute>
    ),
    layout: "/admin",
    allowedJobCodes: ["template", "admin"],
  },
  {
    category: "Menu Template",
    path: "/maps",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: (
      <ProtectedRoute allowedJobCodes={["template", "admin"]}>
        <Maps />
      </ProtectedRoute>
    ),
    layout: "/admin",
    allowedJobCodes: ["template", "admin"],
  },
  {
    category: "Menu Template",
    path: "/tables",
    name: "Tables",
    icon: "ni ni-bullet-list-67 text-red",
    component: (
      <ProtectedRoute allowedJobCodes={["template", "admin"]}>
        <Tables />
      </ProtectedRoute>
    ),
    layout: "/admin",
    allowedJobCodes: ["template", "admin"],
  },
  {
    category: "Menu Template",
    path: "/unauthorized",
    name: "Unauthorized",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Unauthorized />,
    layout: "/admin",
    hidden: true, // <- tambahkan ini
  },

  // Menu Karyawan
  {
    category: "Menu Karyawan",
    path: "/absensi",
    name: "Absensi",
    icon: "ni ni-tag text-green",
    component: (
      <ProtectedRoute allowedJobCodes={["crew", "admin"]}>
        <Absensi />
      </ProtectedRoute>
    ),
    layout: "/admin",
    allowedJobCodes: ["crew", "admin"],
  },
  {
    category: "Menu Karyawan",
    path: "/koreksiAbsensi",
    name: "Request Koreksi Absensi",
    icon: "ni ni-ui-04 text-orange",
    component: (
      <ProtectedRoute allowedJobCodes={["crew", "admin"]}>
        <KoreksiAbsensi />
      </ProtectedRoute>
    ),
    layout: "/admin",
    allowedJobCodes: ["crew", "admin"],
  },
  {
    category: "Menu Karyawan",
    path: "/pengajuanLembur",
    name: "Pengajuan Lembur",
    icon: "ni ni-spaceship text-red",
    component: (
      <ProtectedRoute allowedJobCodes={["crew", "admin"]}>
        <PengajuanLembur />
      </ProtectedRoute>
    ),
    layout: "/admin",
    allowedJobCodes: ["crew", "admin"],
  },
  {
    category: "Menu Karyawan",
    path: "/perizinan",
    name: "Perizinan",
    icon: "ni ni-ruler-pencil text-blue",
    component: (
      <ProtectedRoute allowedJobCodes={["crew", "admin"]}>
        <Perizinan />
      </ProtectedRoute>
    ),
    layout: "/admin",
    allowedJobCodes: ["crew", "admin"],
  },

  // Menu Crew Leader
  {
    category: "Menu Crew Leader",
    path: "/rekapAbsensi",
    name: "Rekap Absensi",
    icon: "ni ni-tag text-green",
    component: (
      <ProtectedRoute allowedJobCodes={["crew Leader", "admin"]}>
        <RekapAbsensi />
      </ProtectedRoute>
    ),
    layout: "/admin",
    allowedJobCodes: ["crew Leader", "admin"],
  },
  {
    category: "Menu Crew Leader",
    path: "/rekapGaji",
    name: "Rekap Gaji",
    icon: "ni ni-money-coins text-yellow",
    component: (
      <ProtectedRoute allowedJobCodes={["crew Leader", "admin"]}>
        <RekapGaji />
      </ProtectedRoute>
    ),
    layout: "/admin",
    allowedJobCodes: ["crew Leader", "admin"],
  },
  {
    category: "Menu Crew Leader",
    path: "/rekapLembur",
    name: "Rekap Lembur",
    icon: "ni ni-spaceship text-red",
    component: (
      <ProtectedRoute allowedJobCodes={["crew Leader", "admin"]}>
        <RekapLembur />
      </ProtectedRoute>
    ),
    layout: "/admin",
    allowedJobCodes: ["crew Leader", "admin"],
  },
  {
    category: "Menu Crew Leader",
    path: "/todolist",
    name: "Todolist",
    icon: "ni ni-check-bold text-blue",
    component: (
      <ProtectedRoute allowedJobCodes={["crew Leader", "admin"]}>
        <Todolist />
      </ProtectedRoute>
    ),
    layout: "/admin",
    allowedJobCodes: ["crew Leader", "admin"],
  },

  // Menu Pendaftaran
  {
    category: "Menu Pendaftaran",
    path: "/register",
    name: "Register",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Register />,
    layout: "/auth",
    allowedJobCodes: ["auth"],
  },
  {
    category: "Menu Pendaftaran",
    path: "/login",
    name: "Login",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Login />,
    layout: "/auth",
    allowedJobCodes: ["auth"],
  },
  {
    category: "Menu Pendaftaran",
    path: "/forgotPassword",
    name: "ForgotPassword",
    icon: "ni ni-bullet-list-67 text-red",
    component: <ForgotPassword />,
    layout: "/auth",
    allowedJobCodes: ["auth"],
  },
  {
    category: "Menu Pendaftaran",
    path: "/resetPassword",
    name: "ResetPassword",
    icon: "ni ni-bullet-list-67 text-red",
    component: <ResetPassword />,
    layout: "/auth",
    allowedJobCodes: ["auth"],
  },
];
export default routes;
