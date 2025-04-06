import Header from "components/Headers/Header.js";
import { Container, Row, Col, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { Card } from "antd";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header menuName={"UNAUTHORIZED"} />
      <Container
        className={"mt-n7"}
        // style={{ marginTop: window.innerWidth > 768 ? "-7px" : "-9px" }}
        fluid
      >
        <Card>
          <Row className="justify-content-center">
            <Col md="8" className="text-center">
              <h1 className="display-1 text-danger">403</h1>
              <h2 className="mb-3">Unauthorized</h2>
              <p className="lead text-muted mb-4">
                Anda tidak memiliki akses ke halaman ini.
              </p>
              <Button color="primary" onClick={() => navigate("/")}>
                Kembali ke Beranda
              </Button>
            </Col>
          </Row>
        </Card>
      </Container>
    </>
  );
};

export default Unauthorized;
