import { DatePicker, TimePicker } from "antd";
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

const AbsensiKaryawan = () => {
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
    employee: "",
    tanggal: null,
    lemburIn: null,
    lemburOut: null,
    alasan: null,
  });

  const [loading, setLoading] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [dataLembur, setDataLembur] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Jumlah data per halaman
  // Hitung total halaman
  const totalPages =
    dataLembur.length === 0 ? 0 : Math.ceil(dataLembur.length / itemsPerPage);
  // Ambil data sesuai halaman
  const paginatedData = dataLembur.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    getPengajuanLembur();
  }, [userId]);

  const getPengajuanLembur = async () => {
    setLoadingTab(true);
    const { data, error } = await supabase
      .from("overtime_requests")
      .select(
        "id, overtime_date, overtime_in, overtime_out, reason, status, users:user_id(email, name)"
      ) // Join dengan tabel users
      .eq("user_id", userId)
      .order("request_date", { ascending: false });

    setLoadingTab(false);

    if (error) {
      console.error("Error saat mengambil data lembur:", error.message);
    }

    if (data.length > 0) {
      console.log("Data lembur", data);
      setDataLembur(data);
    } else {
      console.log("Tidak ada data lembur");
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

  const handleTimeChange = (field, time, timeString) => {
    setForm((prev) => ({
      ...prev,
      [field]: timeString,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    console.log(form);

    if (!form.alasan) newErrors.alasan = "Pilih Alasan!";
    if (!form.tanggal) newErrors.tanggal = "Pilih Tanggal!";
    if (!form.lemburIn) newErrors.lemburIn = "Pilih Jam Masuk Lembur!";
    if (!form.lemburOut) newErrors.lemburOut = "Pilih Jam Keluar Lembur!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      // Panggil API di sini
      setModalConfirm({
        visible: true,
        message: "Apakah anda yakin ingin melakukan pengajuan lembur?",
        confirm: () => {
          callCekLembur();
          setModalConfirm({ ...modalConfirm, visible: false });
        },
      });
    }
  };

  const callCekLembur = async () => {
    const { data, error } = await supabase
      .from("overtime_requests")
      .select("*")
      .eq("user_id", userId)
      .eq("overtime_date", form.tanggal);

    if (error) {
      console.error("Error saat cek lembur:", error.message);
    }

    if (data.length > 0) {
      console.log("Data cek lembur", data);
      setModal({
        visible: true,
        type: "warning",
        message: `Anda sudah melakukan pengajuan pada ${moment(
          form.tanggal,
          "YYYY-MM-DD"
        ).format(
          "DD MMMM YYYY"
        )} sebelumnya, mohon cek history pengajuan lembur!`,
      });
    } else {
      console.log("Tidak ada data lembur");
      callSubmitLembur();
    }
  };

  const callSubmitLembur = async () => {
    setLoading(true);
    try {
      // Insert data ke Supabase
      const { error } = await supabase.from("overtime_requests").insert([
        {
          user_id: userId,
          overtime_date: form.tanggal,
          overtime_in: form.lemburIn,
          overtime_out: form.lemburOut,
          reason: form.alasan,
        },
      ]);

      setLoading(false);

      if (error) {
        console.error("Error saat insert pengajuan lembur:", error.message);
        setModal({
          visible: true,
          type: "error",
          message: error.message,
        });
      } else {
        getPengajuanLembur();
        setModal({
          visible: true,
          type: "success",
          message: "Data berhasil diinput mohon menunggu approval manager!",
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
      <Header menuName={"PENGAJUAN LEMBUR"} />
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
                      Form Pengajuan Lembur
                    </CardTitle>
                    <Form onSubmit={handleSubmit}>
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
                          className="w-100 form-control-alternative"
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

                      <FormGroup className="mb-3">
                        <Label>Jam Lembur</Label>
                        <Row>
                          <Col md={6}>
                            <TimePicker
                              // value={
                              //   form.lemburIn
                              //     ? moment(form.lemburIn, "HH:mm")
                              //     : null
                              // }
                              onChange={(time, timeString) =>
                                handleTimeChange("lemburIn", time, timeString)
                              }
                              format="HH:mm"
                              minuteStep={1}
                              placeholder="Jam Masuk Lembur"
                              className="w-100 form-control-alternative"
                            />

                            {errors.lemburIn && (
                              <small className="text-danger">
                                {errors.lemburIn}
                              </small>
                            )}
                          </Col>
                          <Col md={6}>
                            <TimePicker
                              // value={
                              //   form.lemburOut
                              //     ? moment(form.lemburOut, "HH:mm")
                              //     : null
                              // }
                              onChange={(time, timeString) =>
                                handleTimeChange("lemburOut", time, timeString)
                              }
                              format="HH:mm"
                              minuteStep={1}
                              placeholder="Jam Keluar Lembur"
                              className="w-100 form-control-alternative"
                            />

                            {errors.lemburOut && (
                              <small className="text-danger">
                                {errors.lemburOut}
                              </small>
                            )}
                          </Col>
                        </Row>
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
                <h3 className="mb-0">History Pengajuan Lembur</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    {/* <th scope="col">Email</th>
                    <th scope="col">Nama</th> */}
                    <th scope="col">Tanggal</th>
                    <th scope="col">Jam Masuk Lembur</th>
                    <th scope="col">Jam Pulang Lembur</th>
                    <th scope="col">Alasan</th>
                    <th scope="col">Status</th>
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
                        <td>
                          {moment(item.overtime_date).format("DD MMMM YYYY")}
                        </td>
                        <td>{item.overtime_in}</td>
                        <td>{item.overtime_out}</td>
                        <td>{item.reason}</td>
                        <td>
                          <Button
                            color={
                              item.status === "Pending"
                                ? "warning"
                                : item.status === "Rejected"
                                ? "danger"
                                : "success"
                            }
                          >
                            {item.status}
                          </Button>
                        </td>
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

export default AbsensiKaryawan;
