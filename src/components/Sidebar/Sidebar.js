import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink as NavLinkRRD, useNavigate } from "react-router-dom";
import supabase from "utils/supabaseClient";
import { PropTypes } from "prop-types";
import {
  Navbar,
  Nav,
  NavItem,
  NavLink,
  Container,
  Collapse,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Media,
} from "reactstrap";
import { Badge } from "antd";
import { useDispatch } from "react-redux";
import { fetchNotificationCount } from "../../redux/action/notification";
import CustomModalConfirm from "../../components/CustomModalConfirm";

const Sidebar = (props) => {
  const navigate = useNavigate();
  const [collapseOpen, setCollapseOpen] = useState(false);
  const [jobCode, setJobCode] = useState(null);
  const [count, setCount] = useState(0);
  const { bgColor, routes, logo } = props;
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [modalConfirm, setModalConfirm] = useState({
    visible: false,
    message: "",
    confirm: null,
  });

  useEffect(() => {
    dispatch(fetchNotificationCount()); // Ambil data koreksi absensi & lembur saat Sidebar dimuat
  }, [dispatch]);

  const notificationCount = useSelector((state) => state.notification.count);

  useEffect(() => {
    setCount(
      notificationCount.KoreksiAbsensi + notificationCount.PengajuanLembur
    );
  }, [notificationCount]);

  useEffect(() => {
    const fetchJobCode = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Gagal mengambil jobCode:", error.message);
      } else {
        console.log(data.job_code);
        setJobCode(data.job_code);
        setUser(data);
      }
    };

    fetchJobCode();
  }, []);

  const toggleCollapse = () => setCollapseOpen((prev) => !prev);
  const closeCollapse = () => setCollapseOpen(false);

  const handleLogout = async () => {
    setModalConfirm({
      visible: true,
      message: "Apakah anda yakin ingin keluar?",
      confirm: async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        navigate("/auth/login");
      },
    });
  };

  // **Filter routes berdasarkan jobCode**
  const filteredRoutes = routes.filter(
    (route) =>
      (!route.allowedJobCodes || route.allowedJobCodes.includes(jobCode)) &&
      !route.hidden // <-- tambahkan ini
  );

  const groupedRoutes = filteredRoutes.reduce((acc, route) => {
    if (!acc[route.category]) {
      acc[route.category] = []; // Pastikan diinisialisasi sebagai array
    }
    acc[route.category].push(route);
    return acc;
  }, {});

  const hasTodolist = filteredRoutes.some((route) => route.name === "Todolist");

  const createLinks = (routes) =>
    Object.keys(routes).map((category, index) => (
      <div key={index}>
        <h6 className="navbar-heading text-muted mb-n1 mt-2 px-3">
          {category}
        </h6>
        {Array.isArray(routes[category]) &&
          routes[category].map((prop, key) => (
            <NavItem key={key}>
              <NavLink
                to={prop.layout + prop.path}
                tag={NavLinkRRD}
                onClick={closeCollapse} // Tambahkan ini agar sidebar tertutup saat menu diklik
              >
                <i className={prop.icon} />
                {prop.name}
                {prop.name === "Todolist" ? (
                  <Badge count={count} className="ml-1"></Badge>
                ) : (
                  ""
                )}
              </NavLink>
            </NavItem>
          ))}
      </div>
    ));

  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
    >
      <Container fluid>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleCollapse}
        >
          {hasTodolist ? (
            <Badge count={count}>
              <span className="navbar-toggler-icon" />
            </Badge>
          ) : (
            <span className="navbar-toggler-icon" />
          )}
        </button>

        {logo ? (
          <Link className="navbar-brand pt-0" to={logo.innerLink}>
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              src={logo.imgSrc}
            />
          </Link>
        ) : null}
        <Nav className="align-items-center d-md-none">
          {/* <UncontrolledDropdown nav>
            <DropdownToggle nav className="nav-link-icon">
              <i className="ni ni-bell-55" />
            </DropdownToggle>
            <DropdownMenu
              aria-labelledby="navbar-default_dropdown_1"
              className="dropdown-menu-arrow"
              right
            >
              <DropdownItem>Action</DropdownItem>
              <DropdownItem>Another action</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Something else here</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown> */}
          <UncontrolledDropdown nav>
            <DropdownToggle nav>
              <Media className="align-items-center">
                <span className="avatar avatar-sm rounded-circle">
                  <img
                    alt="..."
                    src={
                      user?.profile_picture
                        ? user?.profile_picture
                        : require("../../assets/img/theme/default-image.jpg")
                    }
                  />
                </span>
              </Media>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem className="noti-title" header tag="div">
                <h6 className="text-overflow m-0">Welcome!</h6>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-single-02" />
                <span>My profile</span>
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={handleLogout}>
                <i className="ni ni-user-run" />
                <span>Logout</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        <Collapse navbar isOpen={collapseOpen}>
          <Nav navbar>{createLinks(groupedRoutes)}</Nav>
        </Collapse>
      </Container>

      <CustomModalConfirm
        visible={modalConfirm.visible}
        message={modalConfirm.message}
        onClose={() => setModalConfirm({ ...modalConfirm, visible: false })}
        onConfirm={modalConfirm.confirm}
      />
    </Navbar>
  );
};

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    imgSrc: PropTypes.string.isRequired,
    imgAlt: PropTypes.string.isRequired,
  }),
};

export default Sidebar;
