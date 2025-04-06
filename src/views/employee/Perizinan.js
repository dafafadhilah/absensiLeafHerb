import { DatePicker } from "antd";
import Header from "components/Headers/Header.js";
import moment from "moment";
import "moment/locale/id";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Table,
} from "reactstrap";
import supabase from "utils/supabaseClient";
import CustomModal from "../../components/CustomModal";
import CustomModalConfirm from "../../components/CustomModalConfirm";

const Perizinan = () => {
  const [modal, setModal] = useState({
    visible: false,
    type: "",
    message: "",
  });
  const [modalConfirm, setModalConfirm] = useState({
    visible: false,
    message: "",
    confirm: null,
  });

  const [form, setForm] = useState({
    izin: "",
    tanggal: null,
    alasan: null,
  });

  const [loading, setLoading] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [dataPerizinan, setDataPerizinan] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Jumlah data per halaman
  // Hitung total halaman
  const totalPages =
    dataPerizinan.length === 0
      ? 0
      : Math.ceil(dataPerizinan.length / itemsPerPage);
  // Ambil data sesuai halaman
  const paginatedData = dataPerizinan.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    getPerizinan();
  }, [userId]);

  const getPerizinan = async () => {
    setLoadingTab(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("id, date, reason, status, users:user_id(email, name)") // Join dengan tabel users
      .eq("user_id", userId)
      .neq("status", "Hadir")
      .order("created_at", { ascending: false });

    setLoadingTab(false);

    if (error) {
      console.error("Error saat mengambil data perizinan:", error.message);
    }

    if (data.length > 0) {
      console.log("Data perizinan", data);
      setDataPerizinan(data);
    } else {
      console.log("Tidak ada data perizinan");
    }
  };

  const handleDateChange = (field, date, dateString) => {
    console.log("Selected date:", dateString); // Log untuk memeriksa nilai
    if (dateString !== form[field]) {
      setForm((prev) => ({
        ...prev,
        [field]: dateString,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    console.log(form);

    if (!form.izin) newErrors.izin = "Pilih Izin!";
    if (!form.alasan) newErrors.alasan = "Pilih Alasan!";
    if (!form.tanggal) newErrors.tanggal = "Pilih Tanggal!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      // Panggil API di sini
      setModalConfirm({
        visible: true,
        message: "Apakah anda yakin ingin melakukan Perizinan?",
        confirm: () => {
          callCekPerizinan();
          setModalConfirm({ ...modalConfirm, visible: false });
        },
      });
    }
  };

  const callCekPerizinan = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "Hadir")
      .eq("date", form.tanggal);

    if (error) {
      console.error("Error saat cek perizinan:", error.message);
    }

    if (data.length > 0) {
      console.log("Data cek perizinan", data);
      setModal({
        visible: true,
        type: "warning",
        message: `Anda sudah melakukan perizinan pada ${moment(
          form.tanggal,
          "YYYY-MM-DD"
        ).format("DD MMMM YYYY")} sebelumnya, mohon cek history Perizinan!`,
      });
    } else {
      console.log("Tidak ada data perizinan");
      callSubmitPerizinan();
    }
  };

  const callSubmitPerizinan = async () => {
    setLoading(true);
    try {
      // Insert data ke Supabase
      const { error } = await supabase.from("attendance").insert([
        {
          user_id: userId,
          date: form.tanggal,
          clock_in: "00:00",
          clock_out: "00:00",
          reason: form.alasan,
          status: form.izin,
        },
      ]);

      setLoading(false);

      if (error) {
        console.error("Error saat insert Perizinan:", error.message);
        setModal({
          visible: true,
          type: "error",
          message: error.message,
        });
      } else {
        getPerizinan();
        setModal({
          visible: true,
          type: "success",
          message: "Data berhasil diinput!",
          onConfirm: () => window.location.reload(),
        });
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header menuName={"PERIZINAN"} />
      <Container className="mt--7" fluid>
        <Row>
          <Col lg="24" xl="12">
            <Card className="card-stats mb-4">
              <Row>
                <Col lg="12" xl="6">
                  <CardBody>
                    <CardTitle
                      tag="h5"
                      className="text-uppercase text-muted mb-3"
                    >
                      Form Perizinan
                    </CardTitle>
                    <Form onSubmit={handleSubmit}>
                      <FormGroup className="mb-3">
                        <Label for="tanggal">Pilih Perizinan</Label>
                        <Input
                          className="form-control-alternative"
                          type="select"
                          name="izin"
                          value={form.izin}
                          onChange={handleChange}
                        >
                          <option value="">Pilih Perizinan</option>
                          <option value="Izin">Izin</option>
                          <option value="Cuti">Cuti</option>
                          <option value="Sakit">Sakit</option>
                        </Input>
                        {errors.izin && (
                          <small className="text-danger">{errors.izin}</small>
                        )}
                      </FormGroup>
                      <FormGroup className="mb-3">
                        <Label for="alasan">Alasan</Label>
                        <Input
                          className="form-control-alternative"
                          type="textarea"
                          name="alasan"
                          id="alasan"
                          value={form.alasan || ""}
                          onChange={handleChange}
                          rows={4} // Mengatur tinggi tetap
                          style={{ resize: "none" }} // Tidak bisa diubah ukurannya
                        />

                        {errors.alasan && (
                          <small className="text-danger">{errors.alasan}</small>
                        )}
                      </FormGroup>
                      {/* Pilih Tanggal */}
                      <FormGroup className="mb-3">
                        <Label for="tanggal">Pilih Tanggal</Label>
                        <DatePicker
                          id="tanggal"
                          // format="DD-MM-YYYY"
                          // value={
                          //   form.tanggal
                          //     ? moment(form.tanggal, "DD-MM-YYYY")
                          //     : null
                          // }
                          onChange={(date, dateString) =>
                            handleDateChange("tanggal", date, dateString)
                          }
                          className="w-100 form-control-alternative"
                          disabledDate={(current) =>
                            current && current > moment().endOf("day")
                          }
                          onOpenChange={(open) => {
                            if (!open) {
                              console.log("DatePicker closed");
                            }
                          }}
                        />

                        {errors.tanggal && (
                          <small className="text-danger">
                            {errors.tanggal}
                          </small>
                        )}
                      </FormGroup>

                      <div className="d-flex justify-content-end">
                        <Button color="primary" type="submit">
                          Submit
                        </Button>
                      </div>
                    </Form>
                  </CardBody>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <Row>
          <div className="col">
            <Card className="shadow mt-4">
              <CardHeader className="border-0">
                <h3 className="mb-0">History Perizinan</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    {/* <th scope="col">Email</th>
                    <th scope="col">Nama</th> */}
                    <th scope="col">Tanggal</th>
                    <th scope="col">Status</th>
                    <th scope="col">Alasan</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingTab ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        <span className="spinner-border spinner-border-sm"></span>
                      </td>
                    </tr>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id}>
                        {/* <th scope="row">{item.users.email}</th>
                        <td>{item.users.name}</td> */}
                        <td>{moment(item.date).format("DD MMMM YYYY")}</td>
                        <td>{item.status}</td>
                        <td>{item.reason}</td>
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
        <CustomModalConfirm
          visible={modalConfirm.visible}
          message={modalConfirm.message}
          onClose={() => setModalConfirm({ ...modalConfirm, visible: false })}
          onConfirm={modalConfirm.confirm}
        />
      </Container>
    </>
  );
};

export default Perizinan;
