// reactstrap components
import { Button, Container, Row, Col } from "reactstrap";

const UserHeader = ({ dataUser }) => {
  return (
    <>
      <div
        className="header pb-8 pt-5 pt-lg-8 d-flex align-items-center"
        style={{
          minHeight: "600px",
          backgroundImage:
            "url(" + require("../../assets/img/theme/team-1-800x800.jpg") + ")",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        {/* Mask */}
        <span className="mask bg-gradient-default opacity-8" />
        {/* Header container */}
        <Container className="d-flex align-items-center" fluid>
          <Row>
            <Col lg="10" md="10">
              <h1 className="display-2 text-white">
                Hello {dataUser?.name || ""}
              </h1>
              <p className="text-white mt-0 mb-5">
                {dataUser?.about_me ? (
                  dataUser?.about_me || ""
                ) : (
                  <>
                    Harapan akan tetap ada bahkan ketika semuanya terasa
                    menyedihkan. <br />
                    Pohon yang kokoh juga lahir dari benih yang kecil.
                  </>
                )}
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default UserHeader;
