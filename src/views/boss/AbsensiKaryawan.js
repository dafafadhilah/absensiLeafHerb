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
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
  Table,
  CardFooter,
} from "reactstrap";

import Header from "components/Headers/Header.js";
import moment from "moment";
import "moment/locale/id";
import supabase from "utils/supabaseClient";
import CustomModal from "../../components/CustomModal";

const AbsensiKaryawan = (props) => {
  const [modal, setModal] = useState({
    visible: false,
    type: "",
    message: "",
  });

  const [form, setForm] = useState({
    employee: "",
    month: moment().month() + 1, // Default bulan sekarang
    year: moment().year(), // Default tahun sekarang
  });

  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dataKaryawan, setDataKaryawan] = useState([]);
  const [dataAbsensiKaryawan, setDataAbsensiKaryawan] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Jumlah data per halaman

  // Hitung total halaman
  const totalPages =
    dataAbsensiKaryawan.length === 0
      ? 0
      : Math.ceil(dataAbsensiKaryawan.length / itemsPerPage);

  // Ambil data sesuai halaman
  const paginatedData = dataAbsensiKaryawan.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    getDataKaryawan();
  }, []);

  const getDataKaryawan = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*") // Join dengan tabel users
      .eq("job_code", "employee");

    if (error) {
      console.error("Error saat mengambil history absen:", error.message);
    }

    if (data) {
      console.log("Data Karyawan", data);
      setDataKaryawan(data);
    } else {
      console.log("Tidak ada karyawan");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!form.employee.trim()) newErrors.employee = "Pilih Karyawan!";
    if (!form.month) newErrors.month = "Pilih bulan!";
    if (!form.year) newErrors.year = "Pilih tahun!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      callGetDataAbsensi();
      setErrors({});
    }
  };

  const callGetDataAbsensi = async () => {
    setLoading(true);
    try {
      const monthNumber = parseInt(form.month, 10); // Konversi string ke number
      const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
      const nextYear =
        monthNumber === 12
          ? parseInt(form.year, 10) + 1
          : parseInt(form.year, 10);

      const { data, error } = await supabase
        .from("attendance")
        .select("id, date, clock_in, clock_out, users(email, name)")
        .eq("user_id", form.employee)
        .gte("date", `${form.year}-${String(form.month).padStart(2, "0")}-01`) // Awal bulan
        .lt("date", `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`) // Awal bulan berikutnya
        .order("date", { ascending: false });

      if (error) {
        console.error(
          "Error saat mengambil data absen karyawan:",
          error.message
        );
      }

      if (data.length > 0) {
        setCurrentPage(1);
        console.log("Data Absensi Karyawan", data);
        setDataAbsensiKaryawan(data);
      } else {
        console.log("Tidak ada karyawan");
        setModal({
          visible: true,
          type: "error",
          message: "Data tidak ditemukan!",
        });
        setDataAbsensiKaryawan(data);
        setCurrentPage(0);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          <Col lg="24" xl="12">
            <Card className="card-stats mb-4 mb-xl-0">
              <Col lg="12" xl="6">
                <CardBody>
                  <CardTitle
                    tag="h5"
                    className="text-uppercase text-muted mb-3"
                  >
                    Form Absensi
                  </CardTitle>
                  <Form onSubmit={handleSubmit}>
                    {/* Input Nama Karyawan */}
                    <FormGroup className="mb-3">
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-single-02" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          type="select"
                          name="employee"
                          value={form.employee}
                          onChange={handleChange}
                        >
                          <option value="">Pilih Karyawan</option>
                          {dataKaryawan.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </Input>
                      </InputGroup>
                      {errors.employee && (
                        <small className="text-danger">{errors.employee}</small>
                      )}
                    </FormGroup>

                    {/* Dropdown Bulan */}
                    <FormGroup className="mb-3">
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-calendar-grid-58" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          type="select"
                          name="month"
                          value={form.month}
                          onChange={handleChange}
                        >
                          {moment.months().map((name, index) => (
                            <option key={index + 1} value={index + 1}>
                              {name}
                            </option>
                          ))}
                        </Input>
                      </InputGroup>
                      {errors.month && (
                        <small className="text-danger">{errors.month}</small>
                      )}
                    </FormGroup>

                    {/* Dropdown Tahun */}
                    <FormGroup className="mb-3">
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-watch-time" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          type="select"
                          name="year"
                          value={form.year}
                          onChange={handleChange}
                        >
                          {Array.from(
                            { length: 5 },
                            (_, i) => moment().year() - i
                          ).map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </Input>
                      </InputGroup>
                      {errors.year && (
                        <small className="text-danger">{errors.year}</small>
                      )}
                    </FormGroup>

                    <div className="d-flex justify-content-end">
                      <Button color="primary" type="submit">
                        Search
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Col>
            </Card>
          </Col>
        </Row>
        <Row>
          <div className="col">
            <Card className="shadow mt-4">
              <CardHeader className="border-0">
                <h3 className="mb-0">Data Absensi Karyawan</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Email</th>
                    <th scope="col">Nama Karyawan</th>
                    <th scope="col">Jam Masuk</th>
                    <th scope="col">Jam Pulang</th>
                    <th scope="col">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        <span className="spinner-border spinner-border-sm"></span>
                      </td>
                    </tr>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id}>
                        <th scope="row">{item.users.email}</th>
                        <td>{item.users.name}</td>
                        <td>{item.clock_in}</td>
                        <td>{item.clock_out}</td>
                        <td>{moment(item.date).format("DD MMMM YYYY")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <CardFooter className="d-flex justify-content-between align-items-center p-3 border-top">
                <span className="fw-bold text-muted">
                  Page {currentPage} of {totalPages}
                </span>

                <div>
                  <Button
                    color="outline-primary"
                    disabled={currentPage === 1 || totalPages === 0} // Tambahkan totalPages === 0
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="rounded-pill me-2"
                  >
                    Previous
                  </Button>

                  <Button
                    color="outline-primary"
                    disabled={currentPage === totalPages || totalPages === 0} // Tambahkan totalPages === 0
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="rounded-pill"
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
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

export default AbsensiKaryawan;
