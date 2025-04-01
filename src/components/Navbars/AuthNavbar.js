import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Collapse,
  NavbarBrand,
  Navbar,
  NavbarToggler,
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,
  Col,
} from "reactstrap";

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Fungsi toggle navbar
  const toggleNavbar = () => setIsOpen(!isOpen);

  // Fungsi menutup navbar saat klik link
  const closeNavbar = () => setIsOpen(false);

  return (
    <>
      <Navbar className="navbar-top navbar-horizontal navbar-dark" expand="md">
        <Container className="px-4">
          <NavbarBrand to="/" tag={Link}>
            <img
              alt="..."
              src={require("../../assets/img/brand/leafherb-removebg-preview.png")}
            />
          </NavbarBrand>

          {/* Tombol toggler */}
          <NavbarToggler onClick={toggleNavbar} />

          {/* Navbar Collapse */}
          <Collapse isOpen={isOpen} navbar>
            <div className="navbar-collapse-header d-md-none">
              <Row>
                <Col className="collapse-brand" xs="6">
                  <Link to="/">
                    <img
                      alt="..."
                      src={require("../../assets/img/brand/leafherb-removebg-preview.png")}
                    />
                  </Link>
                </Col>
                <Col className="collapse-close" xs="6">
                  <button className="navbar-toggler" onClick={toggleNavbar}>
                    <span />
                    <span />
                  </button>
                </Col>
              </Row>
            </div>

            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink to="/auth/register" tag={Link} onClick={closeNavbar}>
                  <i className="ni ni-circle-08" />
                  <span className="nav-link-inner--text">Register</span>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/auth/login" tag={Link} onClick={closeNavbar}>
                  <i className="ni ni-key-25" />
                  <span className="nav-link-inner--text">Login</span>
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;
