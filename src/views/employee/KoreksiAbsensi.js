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
import Header from "components/Headers/Header.js";
import moment from "moment";
import "moment/locale/id";
import supabase from "utils/supabaseClient";
import CustomModal from "../../components/CustomModal";
import CustomModalConfirm from "../../components/CustomModalConfirm";
import { DatePicker, TimePicker } from "antd";

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
    previousInTime: null,
    previousOutTime: null,
    newInTime: null,
    newOutTime: null,
    alasan: null,
  });

  const [loading, setLoading] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [errors, setErrors] = useState({});
  const [dataAbsensiKaryawan, setDataAbsensiKaryawan] = useState([]);
  const [searchTanggal, setSearchTanggal] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [dataHistory, setDataHistory] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Jumlah data per halaman
  // Hitung total halaman
  const totalPages =
    dataHistory.length === 0 ? 0 : Math.ceil(dataHistory.length / itemsPerPage);
  // Ambil data sesuai halaman
  const paginatedData = dataHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    getHistoryAbsen();
  }, [userId]);

  const getHistoryAbsen = async () => {
    setLoadingTab(true);
    const { data, error } = await supabase
      .from("attendance_corrections")
      .select(
        "id, old_clock_in, old_clock_out,new_clock_in, new_clock_out, status, users:user_id(email, name), attendance:attendance_id(date)"
      ) // Join dengan tabel users
      .eq("user_id", userId)
      .order("request_date", { ascending: false });

    setLoadingTab(false);

    if (error) {
      console.error(
        "Error saat mengambil history koreksi absensi:",
        error.message
      );
    }

    if (data.length > 0) {
      console.log("Data history koreksi absensi", data);
      setDataHistory(data);
    } else {
      console.log("Tidak ada history koreksi absensi");
    }
  };

  const callCekAbsensi = async (dataAbsensi) => {
    const { data, error } = await supabase
      .from("attendance_corrections")
      .select("*") // Join dengan tabel users
      .eq("user_id", userId)
      .eq("status", "Pending")
      .eq("attendance_id", dataAbsensi.id);

    if (error) {
      console.error("Error saat cek absensii:", error.message);
    }

    if (data.length > 0) {
      console.log("Data cek absensi", data);
      setModal({
        visible: true,
        type: "warning",
        message: `Anda sudah melakukan pengajuan pada ${moment(
          form.tanggal,
          "YYYY-MM-DD"
        ).format("DD MMMM YYYY")} sebelumnya, mohon cek history absensi!`,
      });
    } else {
      console.log("Tidak ada history koreksi absensi");
      setSearchTanggal(true);
      setForm((prev) => ({
        ...prev,
        ["newInTime"]: dataAbsensi.clock_in,
        ["newOutTime"]: dataAbsensi.clock_out,
      }));
    }
  };

  const handleDateChange = (field, date, dateString) => {
    if (dateString !== form[field]) {
      // Cegah setState jika nilai sama
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

    if (!form.tanggal) newErrors.tanggal = "Pilih Tanggal!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      // Panggil API di sini
      callGetAbsensi(userId, form.tanggal);
    }
  };

  const callGetAbsensi = async (user, dataForm) => {
    setLoading(true);
    try {
      const today = new Date()
        .toLocaleDateString("id-ID", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .split("/")
        .reverse()
        .join("-"); // Format YYYY-MM-DD
      if (!dataForm) {
        console.error("dataForm is null or undefined");
        return;
      }

      // Pastikan dataForm adalah string atau objek moment yang valid
      const formattedDate = moment(dataForm, "DD-MM-YYYY", true).isValid()
        ? moment(dataForm, "DD-MM-YYYY").format("YYYY-MM-DD")
        : null;

      if (!formattedDate) {
        console.error("Invalid date:", dataForm);
        return;
      }

      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user)
        .eq("date", formattedDate)
        .neq("date", today)
        .single();

      if (error) {
        console.error(
          "Error saat mengambil data absen karyawan:",
          error.message
        );
      }

      if (data) {
        console.log("Data Absensi Karyawan", data);
        callCekAbsensi(data);
        setDataAbsensiKaryawan(data);
      } else {
        console.log("Tidak ada karyawan");
        setModal({
          visible: true,
          type: "error",
          message: "Data tidak ditemukan!",
        });
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitKoreksi = (e) => {
    e.preventDefault();
    let newErrors = {};
    console.log(form);

    if (!form.alasan) newErrors.alasan = "Pilih Alasan!";
    if (!form.newInTime) newErrors.newInTime = "Pilih Jam Masuk!";
    if (!form.newOutTime) newErrors.newOutTime = "Pilih Jam Keluar!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      // Panggil API di sini
      setModalConfirm({
        visible: true,
        message: "Apakah anda yakin ingin mengajukan koreksi absensi?",
        confirm: () => {
          callSubmitKoreksi();
          setModalConfirm({ ...modalConfirm, visible: false });
        },
      });
    }
  };

  const callSubmitKoreksi = async () => {
    setLoading(true);
    try {
      // Ambil tanggal & waktu sekarang
      const now = new Date();

      // Insert data ke Supabase
      const { error } = await supabase.from("attendance_corrections").insert([
        {
          attendance_id: dataAbsensiKaryawan.id,
          user_id: dataAbsensiKaryawan.user_id,
          old_clock_in: dataAbsensiKaryawan.clock_in,
          old_clock_out: dataAbsensiKaryawan.clock_out,
          new_clock_in: form.newInTime,
          new_clock_out: form.newOutTime,
          reason: form.alasan,
        },
      ]);

      setLoading(false);

      if (error) {
        console.error("Error saat insert koreksi absensi:", error.message);
        setModal({
          visible: true,
          type: "error",
          message: error.message,
        });
      } else {
        setModal({
          visible: true,
          type: "success",
          message: "Data berhasil diinput mohon menunggu approval manager!",
          onConfirm: () => window.location.reload(),
        });
        getHistoryAbsen();
        setSearchTanggal(false);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header menuName={"KOREKSI ABSENSI"} />
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
                      Form Koreksi Absensi
                    </CardTitle>
                    <Form onSubmit={handleSubmit}>
                      {/* Pilih Tanggal */}
                      <FormGroup className="mb-3">
                        <Label for="tanggal">Pilih Tanggal</Label>
                        <DatePicker
                          id="tanggal"
                          format="DD-MM-YYYY"
                          onChange={(date, dateString) =>
                            handleDateChange("tanggal", date, dateString)
                          }
                          className="w-100 form-control-alternative"
                          disabled={searchTanggal}
                          disabledDate={(current) =>
                            current && current > moment().endOf("day")
                          }
                        />

                        {errors.tanggal && (
                          <small className="text-danger">
                            {errors.tanggal}
                          </small>
                        )}
                      </FormGroup>

                      <div className="d-flex justify-content-end">
                        <Button
                          color="primary"
                          type="submit"
                          disabled={searchTanggal}
                        >
                          Search
                        </Button>
                      </div>
                    </Form>
                    <Form onSubmit={handleSubmitKoreksi}>
                      {searchTanggal ? (
                        <>
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
                              <small className="text-danger">
                                {errors.alasan}
                              </small>
                            )}
                          </FormGroup>

                          <FormGroup className="mb-3">
                            <Label>Sebelumnya</Label>
                            <Row>
                              <Col md={6}>
                                <TimePicker
                                  value={moment(
                                    dataAbsensiKaryawan.clock_in,
                                    "HH:mm"
                                  )}
                                  format="HH:mm"
                                  minuteStep={1}
                                  placeholder="Jam Masuk"
                                  className="w-100 form-control-alternative"
                                  disabled
                                />
                              </Col>
                              <Col md={6}>
                                <TimePicker
                                  className="w-100 form-control-alternative"
                                  value={
                                    dataAbsensiKaryawan.clock_out
                                      ? moment(
                                          dataAbsensiKaryawan.clock_out,
                                          "HH:mm"
                                        )
                                      : null
                                  }
                                  format="HH:mm"
                                  minuteStep={1}
                                  placeholder={"-"}
                                  disabled
                                />
                              </Col>
                            </Row>
                          </FormGroup>

                          <FormGroup className="mb-3">
                            <Label>Sesudahnya</Label>
                            <Row>
                              <Col md={6}>
                                <TimePicker
                                  //   value={moment(form.newInTime, "HH:mm")}
                                  onChange={(time, timeString) =>
                                    handleTimeChange(
                                      "newInTime",
                                      time,
                                      timeString
                                    )
                                  }
                                  format="HH:mm"
                                  minuteStep={1}
                                  placeholder="Jam Masuk"
                                  className="w-100 form-control-alternative"
                                />

                                {errors.newInTime && (
                                  <small className="text-danger">
                                    {errors.newInTime}
                                  </small>
                                )}
                              </Col>
                              <Col md={6}>
                                <TimePicker
                                  //   value={moment(form.newOutTime, "HH:mm")}
                                  onChange={(time, timeString) =>
                                    handleTimeChange(
                                      "newOutTime",
                                      time,
                                      timeString
                                    )
                                  }
                                  format="HH:mm"
                                  minuteStep={1}
                                  placeholder="Jam Keluar"
                                  className="w-100 form-control-alternative"
                                />

                                {errors.newOutTime && (
                                  <small className="text-danger">
                                    {errors.newOutTime}
                                  </small>
                                )}
                              </Col>
                            </Row>
                          </FormGroup>

                          <div className="d-flex justify-content-end">
                            <Button
                              color="warning"
                              disabled={!searchTanggal}
                              onClick={() => setSearchTanggal(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              color="primary"
                              type="submit"
                              disabled={!searchTanggal}
                            >
                              Submit
                            </Button>
                          </div>
                        </>
                      ) : (
                        ""
                      )}
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
                <h3 className="mb-0">History Koreksi Absensi</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    {/* <th scope="col">Email</th>
                    <th scope="col">Nama</th> */}
                    <th scope="col">Tanggal</th>
                    <th scope="col">Jam Masuk Sebelum</th>
                    <th scope="col">Jam Pulang Sebelum</th>
                    <th scope="col">Jam Masuk Sesudah</th>
                    <th scope="col">Jam Pulang Sesudah</th>
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
                          {moment(item.attendance.date).format("DD MMMM YYYY")}
                        </td>
                        <td>{item.old_clock_in}</td>
                        <td>{item.old_clock_out}</td>
                        <td>{item.new_clock_in}</td>
                        <td>{item.new_clock_out}</td>
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
