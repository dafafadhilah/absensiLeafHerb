import { useEffect, useState } from "react";
// node.js library that concatenates classes (strings)
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
// reactstrap components
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Container,
  Row,
  Table,
} from "reactstrap";

// core components
import { chartOptions, parseOptions } from "variables/charts.js";

import Header from "components/Headers/Header.js";
import moment from "moment";
import "moment/locale/id";
import supabase from "utils/supabaseClient";
import CustomModal from "../../components/CustomModal";

const Absensi = (props) => {
  const [activeNav, setActiveNav] = useState(1);
  const [chartExample1Data, setChartExample1Data] = useState("data1");
  const [loading, setLoading] = useState(false);
  const [cekMasuk, setCekMasuk] = useState(false);
  const [cekKeluar, setCekKeluar] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [modal, setModal] = useState({
    visible: false,
    type: "",
    message: "",
  });
  const [time, setTime] = useState(new Date());
  const [dataHistory, setDataHistory] = useState([]);

  useEffect(() => {
    checkAttendanceIn();
    checkAttendanceOut();
    getHistoryAbsen();
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date()); // Perbarui waktu setiap detik
    }, 1000);

    return () => clearInterval(interval); // Bersihkan interval saat komponen unmount
  }, []);

  const getHistoryAbsen = async () => {
    const today = new Date()
      .toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-"); // Format YYYY-MM-DD

    const { data, error } = await supabase
      .from("attendance")
      .select("id, date, clock_in, clock_out, users(email, name)") // Join dengan tabel users
      .eq("user_id", userId)
      .eq("status", "Hadir")
      .lte("date", today)
      .order("date", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error saat mengambil history absen:", error.message);
    }

    if (data) {
      console.log("Data history", data);
      setDataHistory(data);
    } else {
      console.log("Tidak ada history");
    }
  };

  const checkAttendanceIn = async () => {
    const today = new Date()
      .toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-"); // Format YYYY-MM-DD

    const { data, error } = await supabase
      .from("attendance")
      .select("id")
      .eq("user_id", userId)
      .eq("date", today);

    if (error && error.code !== "PGRST116") {
      console.error("Error saat mengecek absen:", error.message);
      setCekMasuk(false);
    }

    if (data.length > 0) {
      console.log("Data absen sudah ada:", data);
      setCekMasuk(true);
    } else {
      console.log("Belum ada data absen untuk user ini hari ini.");
      setCekMasuk(false);
    }
  };

  const checkAttendanceOut = async () => {
    const today = new Date()
      .toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-"); // Format YYYY-MM-DD

    const { data, error } = await supabase
      .from("attendance")
      .select("id")
      .eq("user_id", userId)
      .eq("date", today)
      .is("clock_out", null); // Cek jika clock_out masih NULL

    if (error && error.code !== "PGRST116") {
      console.error("Error saat mengecek absen:", error.message);
      setCekKeluar(false); // Seharusnya tetap false jika error
    }

    if (data.length > 0) {
      console.log("Data absen pulang sudah ada:", data);
      setCekKeluar(false);
    } else {
      console.log("Belum ada data absen pulang untuk user ini hari ini.");
      setCekKeluar(true);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);

    // Ambil tanggal & waktu sekarang
    const now = new Date();
    const date = new Date()
      .toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-"); // Format YYYY-MM-DD
    const clockIn = now
      .toLocaleTimeString("id-ID", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/\./g, ":");

    // Insert data ke Supabase
    const { error } = await supabase.from("attendance").insert([
      {
        user_id: userId,
        date: date,
        clock_in: clockIn,
        status: "Hadir",
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Error saat absen masuk:", error.message);
      setModal({
        visible: true,
        type: "error",
        message: error.message,
      });
    } else {
      setModal({
        visible: true,
        type: "success",
        message: "Absen masuk berhasil!",
      });
      checkAttendanceIn();
      checkAttendanceOut();
      getHistoryAbsen();
    }
  };

  const handleClockOut = async () => {
    setLoading(true);

    // Ambil tanggal & waktu sekarang
    const now = new Date();
    const date = new Date()
      .toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-"); // Format YYYY-MM-DD
    const clockOut = now
      .toLocaleTimeString("id-ID", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/\./g, ":");

    // Update clock_out di Supabase berdasarkan user_id & tanggal hari ini
    const { error } = await supabase
      .from("attendance")
      .update({ clock_out: clockOut }) // Hanya update clock_out
      .eq("user_id", userId)
      .eq("date", date); // Pastikan update hanya untuk absen hari ini

    setLoading(false);

    if (error) {
      console.error("Error saat absen pulang:", error.message);
      setModal({
        visible: true,
        type: "error",
        message: error.message,
      });
    } else {
      setModal({
        visible: true,
        type: "success",
        message: "Absen pulang berhasil!",
      });
      checkAttendanceIn();
      checkAttendanceOut();
      getHistoryAbsen();
    }
  };

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }
  return (
    <>
      <Header menuName={"ABSENSI"} />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          <Col lg="12" xl="6">
            <Card className="card-stats mb-4 mb-xl-0">
              <CardBody>
                <Row>
                  <div className="col">
                    <CardTitle
                      tag="h5"
                      className="text-uppercase text-muted mb-0"
                    >
                      Absen Masuk - 09:00
                    </CardTitle>
                    <span className="h2 font-weight-bold mb-0">
                      {moment().locale("id").format("DD MMMM YYYY") +
                        " " +
                        time
                          .toLocaleTimeString("id-ID", { hour12: false })
                          .replace(/\./g, ":")}
                    </span>
                  </div>
                  <Col className="col-auto">
                    <div className="icon icon-shape bg-primary text-white rounded-circle shadow">
                      <i className="ni ni-user-run" />
                    </div>
                  </Col>
                </Row>
                <p className="mt-3 mb-0 text-muted text-sm">
                  <Button
                    color="primary"
                    onClick={handleClockIn}
                    disabled={cekMasuk}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      "Masuk"
                    )}
                  </Button>
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col lg="12" xl="6">
            <Card className="card-stats mb-4 mb-xl-0">
              <CardBody>
                <Row>
                  <div className="col">
                    <CardTitle
                      tag="h5"
                      className="text-uppercase text-muted mb-0"
                    >
                      Absen Pulang - 18:00
                    </CardTitle>
                    <span className="h2 font-weight-bold mb-0">
                      {moment().locale("id").format("DD MMMM YYYY") +
                        " " +
                        time
                          .toLocaleTimeString("id-ID", { hour12: false })
                          .replace(/\./g, ":")}
                    </span>
                  </div>
                  <Col className="col-auto">
                    <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                      <i
                        className="ni ni-user-run"
                        style={{ transform: "scaleX(-1)" }}
                      />
                    </div>
                  </Col>
                </Row>
                <p className="mt-3 mb-0 text-muted text-sm">
                  <Button
                    color="warning"
                    onClick={handleClockOut}
                    disabled={cekKeluar}
                  >
                    Pulang
                  </Button>
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <div className="col">
            <Card className="shadow mt-4">
              <CardHeader className="border-0">
                <h3 className="mb-0">History Absensi</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    {/* <th scope="col">Email</th>
                    <th scope="col">Nama</th> */}
                    <th scope="col">Tanggal</th>
                    <th scope="col">Jam Masuk</th>
                    <th scope="col">Jam Pulang</th>
                  </tr>
                </thead>
                <tbody>
                  {dataHistory.length > 0 ? (
                    dataHistory.map((item) => {
                      const clockInTime = moment(item.clock_in, "HH:mm");
                      const clockOutTime = moment(item.clock_out, "HH:mm");
                      const isLateIn = clockInTime.isAfter(
                        moment("09:00", "HH:mm")
                      );
                      const isLateOut = clockOutTime.isBefore(
                        moment("18:00", "HH:mm")
                      );

                      return (
                        <tr key={item.id}>
                          {/* <th scope="row">{item.users.email}</th>
          <td>{item.users.name}</td> */}
                          <td>{moment(item.date).format("DD MMMM YYYY")}</td>
                          <td
                            style={{
                              "background-color": isLateIn ? "yellow" : "white",
                            }}
                          >
                            {item.clock_in}
                          </td>
                          <td
                            style={{
                              "background-color": isLateOut
                                ? "yellow"
                                : "white",
                            }}
                          >
                            {item.clock_out}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {/* <CardFooter className="py-4">
                <nav aria-label="...">
                  <Pagination
                    className="pagination justify-content-end mb-0"
                    listClassName="justify-content-end mb-0"
                  >
                    <PaginationItem className="disabled">
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                        tabIndex="-1"
                      >
                        <i className="fas fa-angle-left" />
                        <span className="sr-only">Previous</span>
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem className="active">
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        2 <span className="sr-only">(current)</span>
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        3
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        <i className="fas fa-angle-right" />
                        <span className="sr-only">Next</span>
                      </PaginationLink>
                    </PaginationItem>
                  </Pagination>
                </nav>
              </CardFooter> */}
            </Card>
          </div>
        </Row>

        <CustomModal
          visible={modal.visible}
          type={modal.type}
          message={modal.message}
          onClose={() => setModal({ ...modal, visible: false })}
        />
      </Container>
    </>
  );
};

export default Absensi;
