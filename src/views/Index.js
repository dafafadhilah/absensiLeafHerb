import { useState } from "react";
// node.js library that concatenates classes (strings)
import classnames from "classnames";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
  Container,
  Row,
  Col,
} from "reactstrap";

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2,
} from "variables/charts.js";

import Header from "components/Headers/Header.js";

const Index = (props) => {
  const [activeNav, setActiveNav] = useState(1);
  const [chartExample1Data, setChartExample1Data] = useState("data1");

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  const toggleNavs = (e, index) => {
    e.preventDefault();
    setActiveNav(index);
    setChartExample1Data("data" + index);
  };
  return (
    <>
      <Header menuName={"DASHBOARD"} />
      {/* Page content */}
      <Container className="mt--7 justify-content-center" fluid>
        <Row className="justify-content-center">
          <Col xl="12">
            {" "}
            {/* Tinggi diperbesar */}
            {/* <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col text-center">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Aplikasi
                    </h6>
                    <h2 className="mb-0 font-weight-bold">ABSENSI KARYAWAN</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="d-flex justify-content-center align-items-center">
                <h1
                  className="font-weight-bold"
                  style={{
                    fontSize: "4rem",
                    background: "linear-gradient(45deg, #5e72e4, #4054b2)", // Gradasi lebih gelap
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    textShadow: "2px 2px 10px rgba(0,0,0,0.2)",
                  }}
                >
                  Welcome!
                </h1>
              </CardBody> */}
            <Card className="card-profile shadow mt-5">
              <Row className="justify-content-center">
                <Col className="order-lg-2" lg="3">
                  <div className="card-profile-image">
                    <img
                      alt="..."
                      className="rounded-circle"
                      src={require("../assets/img/brand/leafherb.jpg")}
                    />
                  </div>
                </Col>
              </Row>
              <CardHeader className="text-center border-0 pt-8 pt-md-4 pb-0 pb-md-4"></CardHeader>
              <CardBody className="pt-0 pt-md-4">
                <Row>
                  <div className="col">
                    <div className="card-profile-stats d-flex justify-content-center mt-md-5">
                      <div>
                        <h3>APLIKASI ABSENSI KARYAWAN</h3>
                        <h1
                          className="font-weight-bold"
                          style={{
                            fontSize: "4rem",
                            background:
                              "linear-gradient(45deg, #5e72e4, #4054b2)", // Gradasi lebih gelap
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                            textShadow: "2px 2px 10px rgba(0,0,0,0.2)",
                          }}
                        >
                          Welcome!
                        </h1>
                      </div>
                    </div>
                  </div>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;
