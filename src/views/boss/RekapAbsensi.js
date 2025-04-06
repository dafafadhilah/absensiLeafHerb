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
  Label,
} from "reactstrap";

import Header from "components/Headers/Header.js";
import moment from "moment";
import "moment/locale/id";
import supabase from "utils/supabaseClient";
import CustomModal from "../../components/CustomModal";
import * as XLSX from "xlsx";

const RekapAbsensi = (props) => {
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
      .eq("job_code", "crew");

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

      if (form.employee === "ALL") {
        const { data, error } = await supabase
          .from("attendance")
          .select("id, date, clock_in, clock_out, status, users(email, name)")
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
      } else {
        const { data, error } = await supabase
          .from("attendance")
          .select("id, date, clock_in, clock_out, status, users(email, name)")
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
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    let newErrors = {};

    if (!form.employee.trim()) newErrors.employee = "Pilih Karyawan!";
    if (!form.month) newErrors.month = "Pilih bulan!";
    if (!form.year) newErrors.year = "Pilih tahun!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    } else {
      setErrors({});
    }
    const monthNumber = parseInt(form.month, 10); // Konversi string ke number
    const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
    const nextYear =
      monthNumber === 12
        ? parseInt(form.year, 10) + 1
        : parseInt(form.year, 10);

    if (form.employee === "ALL") {
      const { data, error } = await supabase
        .from("attendance")
        .select("id, date, clock_in, clock_out, status, users(email, name)")
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
        // setCurrentPage(1);
        console.log("Data Absensi Karyawan", data);
        // setDataAbsensiKaryawan(data);
        downloadReport(data);
      } else {
        console.log("Tidak ada karyawan");
        setModal({
          visible: true,
          type: "error",
          message: "Data tidak ditemukan!",
        });
        // setDataAbsensiKaryawan(data);
        // setCurrentPage(0);
      }
    } else {
      const { data, error } = await supabase
        .from("attendance")
        .select("id, date, clock_in, clock_out, status, users(email, name)")
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
        // setCurrentPage(1);
        console.log("Data Absensi Karyawan", data);
        // setDataAbsensiKaryawan(data);
        downloadReport(data);
      } else {
        console.log("Tidak ada karyawan");
        setModal({
          visible: true,
          type: "error",
          message: "Data tidak ditemukan!",
        });
        // setDataAbsensiKaryawan(data);
        // setCurrentPage(0);
      }
    }
  };

  const downloadReport = (dataDownload) => {
    // Tentukan bulan dan tahun berdasarkan data pertama
    const firstDate = moment(dataDownload[0]?.date); // Mengambil bulan pertama dari data
    const monthYear = firstDate.format("MMMM YYYY");
    const daysInMonth = firstDate.daysInMonth(); // Jumlah hari dalam bulan

    // Persiapkan data untuk Excel
    const excelData = [];

    const header2 = ["Data Absensi Karyawan " + monthYear];
    excelData.push(header2);
    // Menambahkan baris kosong untuk memisahkan data karyawan dengan keterangan
    excelData.push([]);

    // Menambahkan baris 1 (header utama)
    const header1 = ["Nama Karyawan"];
    for (let i = 1; i <= daysInMonth; i++) {
      header1.push(i.toString()); // Menambahkan nomor hari 1, 2, 3, dst
    }
    header1.push("Hadir", "Hadir* (W)", "Izin", "Sakit", "Cuti", "Tidak Hadir"); // Kolom untuk total Hadir dan Tidak Hadir
    excelData.push(header1);

    // Menyusun data untuk setiap karyawan
    const employeeData = {};

    dataDownload.forEach((item) => {
      const employeeName = item.users.name; // Mengambil nama karyawan
      const date = moment(item.date).format("YYYY-MM-DD"); // Format tanggal (YYYY-MM-DD)
      const day = moment(item.date).date(); // Ambil hari dari tanggal
      const clockInTime = moment(item.clock_in, "HH:mm");
      const clockOutTime = item.clock_out
        ? moment(item.clock_out, "HH:mm")
        : null;

      // Inisialisasi data karyawan jika belum ada
      if (!employeeData[employeeName]) {
        employeeData[employeeName] = {
          name: employeeName,
          days: Array(daysInMonth).fill("X"), // Semua diasumsikan Tidak Hadir (X)
          hadir: 0,
          tidakHadir: 0,
          hadirWarning: 0,
          izin: 0,
          sakit: 0,
          cuti: 0,
        };
      }

      // Tentukan status hadir atau tidak hadir
      const isHadir =
        clockInTime.isBefore(moment("09:00", "HH:mm")) &&
        clockOutTime?.isAfter(moment("18:00", "HH:mm"));

      // Tandai hadir (O) dan cek apakah jam tidak sesuai
      if (item.status === "Sakit") {
        employeeData[employeeName].days[day - 1] = "S"; // Tandai hadir (O)
        employeeData[employeeName].sakit++;
      } else if (item.status === "Izin") {
        employeeData[employeeName].days[day - 1] = "I"; // Tandai hadir (O)
        employeeData[employeeName].izin++;
      } else if (item.status === "Cuti") {
        employeeData[employeeName].days[day - 1] = "C"; // Tandai hadir (O)
        employeeData[employeeName].cuti++;
      } else if (isHadir) {
        employeeData[employeeName].days[day - 1] = "O"; // Tandai hadir (O)
        employeeData[employeeName].hadir++;
      } else {
        employeeData[employeeName].days[day - 1] = "W"; // Tandai hadir WARNING (W)
        employeeData[employeeName].hadirWarning++;
      }
    });

    // Menambahkan data karyawan ke excelData
    Object.keys(employeeData).forEach((employeeName) => {
      const employee = employeeData[employeeName];
      const row = [
        employee.name,
        ...employee.days,
        employee.hadir,
        employee.hadirWarning,
        employee.izin,
        employee.sakit,
        employee.cuti,
        daysInMonth - employee.hadir - employee.hadirWarning,
      ];
      excelData.push(row);
    });

    // Menambahkan baris kosong untuk memisahkan data karyawan dengan keterangan
    excelData.push([]);

    // Menambahkan keterangan
    excelData.push(["Keterangan:"]);
    const info1 = ["O : HADIR"];
    const info2 = ["X : TIDAK HADIR"];
    const info3 = ["I : IZIN"];
    const info4 = ["S : SAKIT"];
    const info5 = ["C : CUTI"];
    const info6 = ["W : HADIR tetapi jam masuk / jam pulang perlu di revisi"];
    excelData.push(info1);
    excelData.push(info2);
    excelData.push(info3);
    excelData.push(info4);
    excelData.push(info5);
    excelData.push(info6);

    // Membuat worksheet dan workbook
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absensi Karyawan");

    // Mengatur ukuran kolom
    const colWidths = [];

    // Set lebar kolom Nama Karyawan lebih besar
    colWidths.push({ wch: 20 }); // Nama Karyawan (lebar lebih besar)

    // Set lebar kolom untuk tanggal 1 hingga 31 lebih kecil
    for (let i = 0; i < daysInMonth; i++) {
      colWidths.push({ wch: 3 }); // Lebar kolom tanggal (lebih kecil)
    }

    // Set lebar kolom untuk Hadir dan Tidak Hadir lebih besar
    colWidths.push(
      { wch: 6 },
      { wch: 10 },
      { wch: 6 },
      { wch: 6 },
      { wch: 6 },
      { wch: 10 }
    );

    // Terapkan lebar kolom
    ws["!cols"] = colWidths;

    // Menyimpan file Excel
    XLSX.writeFile(wb, `Rekap_Absensi_${form.employee}_${monthYear}.xlsx`);
  };

  return (
    <>
      <Header menuName={"REKAP ABSENSI"} />
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
                      <Label for="karyawan">Karyawan</Label>
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-single-02" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          className="form-control-alternative"
                          type="select"
                          name="employee"
                          value={form.employee}
                          onChange={handleChange}
                        >
                          <option value="">Pilih Karyawan</option>
                          <option value="ALL">ALL</option>
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
                      <Label for="bulan">Bulan</Label>
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-calendar-grid-58" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          className="form-control-alternative"
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
                      <Label for="tahun">Tahun</Label>
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-watch-time" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          className="form-control-alternative"
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
                      <Button color="dark" onClick={exportToExcel}>
                        Download
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
                    <th scope="col">Status</th>
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
                        <td>{item.status}</td>
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

export default RekapAbsensi;
