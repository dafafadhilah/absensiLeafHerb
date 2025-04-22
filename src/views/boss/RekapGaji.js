import { Spin } from "antd";
import { useEffect, useState, useRef } from "react";
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
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Row,
  Table,
} from "reactstrap";

import Header from "components/Headers/Header.js";
import moment from "moment";
import "moment/locale/id";
import supabase from "utils/supabaseClient";
import logo from "../../assets/img/brand/leafherb-removebg-preview.png";
import CustomModal from "../../components/CustomModal";

import jsPDF from "jspdf";
import "jspdf-autotable"; // Tanpa menggunakan `as autoTable`

const RekapGaji = (props) => {
  const [modal, setModal] = useState({
    visible: false,
    type: "",
    message: "",
  });

  const [form, setForm] = useState({
    gaji: 1500000,
    lembur: 0,
    bonus: 0,
    hadiah: 0,
    potongan: 0,
    tanggal: moment().format("YYYY-MM-DD"),
    employee: "",
    month: moment().month() + 1, // Default bulan sekarang
    year: moment().year(), // Default tahun sekarang
    totalDays: 0,
    totalHours: 0,
    averageHoursPerDay: 0,
    weekendOvertime: 0,
  });

  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [loading, setLoading] = useState(false);
  const [searchCondition, setSearchCodition] = useState(false);
  const [errors, setErrors] = useState({});
  const [dataKaryawan, setDataKaryawan] = useState([]);
  const [dataPenghasilan, setDataPenghasilan] = useState([]);
  const [dataPotongan, setDataPotongan] = useState([]);
  const inputRef = useRef(null);

  const handleClick = () => {
    if (inputRef.current) {
      // Browser modern (Chrome, Edge, dll)
      if (inputRef.current.showPicker) {
        inputRef.current.showPicker();
      } else {
        // Fallback untuk browser lama
        inputRef.current.click();
      }
    }
  };

  useEffect(() => {
    getDataKaryawan();
  }, []);

  const getDataKaryawan = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*") // Join dengan tabel users
      .eq("job_code", "crew");

    setLoading(false);
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

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID").format(angka);
  };

  const handleChange = (e) => {
    if (e.target.name === "gaji" || e.target.name === "lembur") {
      let value = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
      setForm({ ...form, [e.target.name]: value });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!form.employee) newErrors.employee = "Pilih karyawan!";
    if (!form.gaji) newErrors.gaji = "Mohon input gaji!";
    if (!form.month) newErrors.month = "Pilih bulan!";
    if (!form.year) newErrors.year = "Pilih tahun!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setSearchCodition(true);
      callGetLembur();
      setErrors({});
    }
  };

  const callGetLembur = async () => {
    setLoading(true);
    const nextMonth = form.month === 12 ? 1 : Number(form.month) + 1;
    const nextYear = form.month === 12 ? form.year + 1 : form.year;

    // Pastikan bulan tetap dua digit
    const formattedMonth = String(form.month).padStart(2, "0");
    const formattedNextMonth = String(nextMonth).padStart(2, "0");

    console.log(
      `Mencari data lembur dari ${form.year}-${formattedMonth}-01 hingga ${nextYear}-${formattedNextMonth}-01`
    );

    const { data, error } = await supabase
      .from("overtime_requests")
      .select("total_hours, overtime_date")
      .eq("user_id", form.employee)
      .eq("status", "Approved")
      .gte("overtime_date", `${form.year}-${formattedMonth}-01`)
      .lt("overtime_date", `${nextYear}-${formattedNextMonth}-01`);

    setLoading(false);

    if (error) {
      console.error("Error saat mengambil data lemburan:", error.message);
      return;
    }

    console.log("Data lembur yang diambil:", data);

    if (!data || data.length === 0) {
      console.warn("Tidak ada data lemburan!");
      setForm((prev) => ({
        ...prev,
        lembur: 0,
      }));
      return;
    }

    // **SUM Manual hanya mengambil JAM**
    const totalHours = data.reduce((sum, row) => {
      const hours = row.total_hours
        ? parseInt(row.total_hours.split(":")[0])
        : 0;
      return sum + hours;
    }, 0);

    const totalOvertimePay = totalHours * 5000;

    console.log(
      `Total jam lembur: ${totalHours}, Total upah lembur: ${totalOvertimePay}`
    );

    const totalDays = new Set(data.map((row) => row.overtime_date)).size;
    const averageHoursPerDay = totalDays
      ? (totalHours / totalDays).toFixed(1)
      : 0;
    const weekendOvertime = data.filter((row) =>
      [6, 0].includes(new Date(row.overtime_date).getDay())
    ).length;

    setForm((prev) => ({
      ...prev,
      lembur: totalOvertimePay,
      totalDays: totalDays,
      totalHours: totalHours,
      averageHoursPerDay: averageHoursPerDay,
      weekendOvertime: weekendOvertime,
    }));
  };

  const exportSlipGaji = () => {
    let bool = false;
    dataPenghasilan.map((item) => {
      if (!item.total || !item.name) {
        bool = true;
        return;
      }
    });
    if (bool) {
      setModal({
        visible: true,
        type: "error",
        message: "Mohon pastikan seluruh total penghasilan sudah terisi!",
      });
      return false;
    }

    const doc = new jsPDF("p", "mm", "a4"); // Ubah dari "l" ke "p"

    const employee = dataKaryawan.find((item) => item.id === form.employee);
    const monthName = moment(`${form.year}-${form.month}`, "YYYY-M").format(
      "MMMM"
    );
    const lastDay = new Date(form.year, form.month, 0).getDate();

    const pageWidth = doc.internal.pageSize.width; // Lebar halaman A4 potrait = 210mm
    const halfPage = (pageWidth - 20) / 2;
    const logoWidth = 60;
    const logoHeight = 20;
    const centerX = (pageWidth - logoWidth) / 2;

    doc.addImage(logo, "JPEG", centerX, 7, logoWidth, logoHeight);

    // Header
    const headerY = logoHeight + 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("SLIP GAJI KARYAWAN", pageWidth / 2, headerY, { align: "center" });

    doc.setFontSize(12);
    doc.text(
      `Periode 1 ${monthName} ${form.year} - ${lastDay} ${monthName} ${form.year}`,
      pageWidth / 2,
      headerY + 8,
      { align: "center" }
    );

    // Tabel 1: Info Karyawan
    doc.autoTable({
      startY: headerY + 15,
      margin: { left: 10 },
      tableWidth: pageWidth - 20, // full width dengan margin 10 kanan-kiri
      body: [
        ["COMPANY", ": PT Herbal Jaya Sentosa (LeafHerb)"],
        ["NAME", ": " + employee.name],
      ],
      theme: "plain",
      styles: { halign: "left" },
      columnStyles: {
        0: { cellWidth: 40, halign: "left" },
        1: { cellWidth: pageWidth - 60, halign: "left" },
      },
    });

    const startY2 = doc.lastAutoTable.finalY + 5;

    let sumPenghasilan = 0;
    dataPenghasilan.forEach((item) => {
      sumPenghasilan += Number(item.total);
    });
    const marginLeft = 10;
    const gap = 10;
    const tableWidth = (pageWidth - marginLeft * 2 - gap) / 2; // hasilnya 90

    // Tabel 2: PENGHASILAN
    doc.autoTable({
      startY: startY2,
      margin: { left: marginLeft }, // 10
      tableWidth: tableWidth, // 90
      head: [["PENGHASILAN", "JUMLAH"]],
      body: [
        ["GAJI POKOK", "Rp. " + formatRupiah(form.gaji)],
        ["LEMBUR", "Rp. " + formatRupiah(form.lembur)],
        ...dataPenghasilan.map((item) => {
          return [item.name.toUpperCase(), "Rp. " + formatRupiah(item.total)];
        }),
        [
          { content: "TOTAL PENGHASILAN", styles: { fontStyle: "bold" } },
          {
            content:
              "Rp. " +
              formatRupiah(
                Number(form.gaji) + Number(form.lembur) + sumPenghasilan
              ),
            styles: { fontStyle: "bold" },
          },
        ],
      ],
      styles: { halign: "left" },
      columnStyles: { 0: { halign: "left" }, 1: { halign: "left" } },
    });
    const penghasilanY = doc.lastAutoTable.finalY;

    let sumPotongan = 0;
    dataPotongan.forEach((item) => {
      sumPotongan += Number(item.total);
    });

    // Tabel 3: POTONGAN
    doc.autoTable({
      startY: startY2,
      margin: { left: marginLeft + tableWidth + gap }, // 10 + 90 + 10 = 110
      tableWidth: tableWidth, // 90
      head: [["POTONGAN", "JUMLAH"]],
      body: [
        ...dataPotongan.map((item) => [
          item.name.toUpperCase(),
          "Rp. " + formatRupiah(item.total),
        ]),
        [
          { content: "TOTAL POTONGAN", styles: { fontStyle: "bold" } },
          {
            content: "Rp. " + formatRupiah(sumPotongan),
            styles: { fontStyle: "bold" },
          },
        ],
      ],
      styles: { halign: "left" },
      columnStyles: { 0: { halign: "left" }, 1: { halign: "left" } },
    });
    const potonganY = doc.lastAutoTable.finalY;
    const startY4 = Math.max(penghasilanY, potonganY) + 10;

    // Tabel 4: PENERIMAAN BERSIH
    doc.autoTable({
      startY: startY4,
      margin: { left: 10 },
      tableWidth: pageWidth - 20,
      head: [["PENERIMAAN BERSIH"]],
      body: [
        [
          "Rp. " +
            formatRupiah(
              Number(form.gaji) +
                Number(form.lembur) +
                sumPenghasilan -
                sumPotongan
            ),
        ],
      ],
      styles: { halign: "center", fontStyle: "bold" },
    });

    const startY5 = doc.lastAutoTable.finalY + 10;

    const today = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Tabel 5: TTD
    doc.autoTable({
      startY: startY5,
      margin: { left: marginLeft + tableWidth + gap + 10 },
      tableWidth: 100,
      head: [["Depok, " + moment(form.tanggal).format("DD MMMM YYYY")]],
      body: [["Crew Leader"], [""], [""], [""], ["Jailani Syawaluddin"]],
      theme: "plain",
      styles: { halign: "center", fontSize: 12 },
      columnStyles: {
        0: { halign: "center", fontSize: 12, fontStyle: "bold" },
      },
      pageBreak: "avoid",
    });

    // Simpan
    doc.save(`Slip_Gaji_${employee.name}.pdf`);
  };

  const addPenghasilan = () => {
    let bool = false;
    dataPenghasilan.map((item) => {
      if (!item.total || !item.name) {
        bool = true;
        return;
      }
    });
    if (bool) {
      setModal({
        visible: true,
        type: "error",
        message: "Mohon pastikan seluruh data penghasilan sudah terisi!",
      });
      return false;
    }
    setDataPenghasilan((prev) => [
      ...prev,
      {
        name: "",
        total: "",
      },
    ]);
  };

  const handleChangePenghasilan = (index, e) => {
    const { name, value } = e.target;
    setDataPenghasilan((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [name]: name === "total" ? value.replace(/\D/g, "") : value,
            }
          : item
      )
    );
  };

  const handleDeletePenghasilan = (index) => {
    setDataPenghasilan((prev) => prev.filter((_, i) => i !== index));
  };

  const addPotongan = () => {
    let bool = false;
    dataPotongan.map((item) => {
      if (!item.total || !item.name) {
        bool = true;
        return;
      }
    });
    if (bool) {
      setModal({
        visible: true,
        type: "error",
        message: "Mohon pastikan seluruh data potongan sudah terisi!",
      });
      return false;
    }
    setDataPotongan((prev) => [
      ...prev,
      {
        name: "",
        total: "",
      },
    ]);
  };

  const handleChangePotongan = (index, e) => {
    const { name, value } = e.target;
    setDataPotongan((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [name]: name === "total" ? value.replace(/\D/g, "") : value,
            }
          : item
      )
    );
  };

  const handleDeletePotongan = (index) => {
    setDataPotongan((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Header menuName={"REKAP GAJI"} />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          <Col lg="24" xl="12">
            <Spin spinning={loading} size="large">
              <Card className="card-stats mb-4 mb-xl-0">
                <Row className="d-flex justify-content-between">
                  <Col lg="6" xl="6">
                    <CardBody>
                      <CardTitle
                        tag="h5"
                        className="text-uppercase text-muted mb-3"
                      >
                        Form Gaji
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
                              disabled={searchCondition}
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
                            <small className="text-danger">
                              {errors.employee}
                            </small>
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
                              disabled={searchCondition}
                            >
                              {moment.months().map((name, index) => (
                                <option key={index + 1} value={index + 1}>
                                  {name}
                                </option>
                              ))}
                            </Input>
                          </InputGroup>
                          {errors.month && (
                            <small className="text-danger">
                              {errors.month}
                            </small>
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
                              disabled={searchCondition}
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
                          <Button
                            color="primary"
                            type="submit"
                            disabled={searchCondition}
                          >
                            Search
                          </Button>
                        </div>
                      </Form>
                    </CardBody>
                  </Col>
                  {searchCondition ? (
                    <Col lg="6" xl="6" className="text-end">
                      <CardBody>
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-3"
                        ></CardTitle>
                        <Form>
                          <FormGroup className="mb-3">
                            <Label for="tanggal">Tanggal TTD</Label>
                            <InputGroup className="input-group-alternative">
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                  <i className="ni ni-calendar-grid-58" />
                                </InputGroupText>
                              </InputGroupAddon>
                              <Input
                                innerRef={inputRef}
                                className="form-control-alternative"
                                type="date"
                                name="tanggal"
                                value={form.tanggal}
                                onChange={handleChange}
                                onClick={handleClick}
                              />
                            </InputGroup>
                            {errors.tanggal && (
                              <small className="text-danger">
                                {errors.tanggal}
                              </small>
                            )}
                          </FormGroup>
                          <FormGroup className="mb-3">
                            <Label for="gaji">Gaji</Label>
                            <InputGroup className="input-group-alternative">
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                  <i className="ni ni-money-coins" />
                                </InputGroupText>
                              </InputGroupAddon>
                              <Input
                                className="form-control-alternative"
                                type="text"
                                name="gaji"
                                value={`Rp ${formatRupiah(form.gaji)}`}
                                onChange={handleChange}
                              />
                            </InputGroup>
                            {errors.gaji && (
                              <small className="text-danger">
                                {errors.gaji}
                              </small>
                            )}
                          </FormGroup>
                          <FormGroup className="mb-3">
                            <Label for="lembur">Lembur</Label>
                            <InputGroup className="input-group-alternative">
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                  <i className="ni ni-fat-add" />
                                </InputGroupText>
                              </InputGroupAddon>
                              <Input
                                className="form-control-alternative"
                                type="text"
                                name="lembur"
                                value={`Rp ${formatRupiah(form.lembur)}`}
                                onChange={handleChange}
                              />
                            </InputGroup>
                            {errors.lembur && (
                              <small className="text-danger">
                                {errors.lembur}
                              </small>
                            )}
                          </FormGroup>
                          <FormGroup className="mb-3">
                            <Label for="detailLembur">Detail Lembur</Label>
                            <Table responsive className="table-bordered mt-2">
                              <tbody>
                                <tr>
                                  <td>
                                    <b>Total Hari</b>
                                  </td>
                                  <td>{form.totalDays} hari</td>
                                </tr>
                                <tr>
                                  <td>
                                    <b>Total Jam</b>
                                  </td>
                                  <td>{form.totalHours} jam</td>
                                </tr>
                                <tr>
                                  <td>
                                    <b>Rata-rata Jam/Hari</b>
                                  </td>
                                  <td>{form.averageHoursPerDay} jam</td>
                                </tr>
                                <tr>
                                  <td>
                                    <b>Lembur Akhir Pekan</b>
                                  </td>
                                  <td>{form.weekendOvertime} kali</td>
                                </tr>
                              </tbody>
                            </Table>
                          </FormGroup>

                          <div className="d-flex justify-content-end">
                            <Button
                              color="danger"
                              onClick={() => setSearchCodition(false)}
                            >
                              Cancel
                            </Button>
                            <Button color="dark" onClick={exportSlipGaji}>
                              Cetak Slip Gaji
                            </Button>
                          </div>
                        </Form>
                      </CardBody>
                    </Col>
                  ) : (
                    ""
                  )}
                </Row>
              </Card>
            </Spin>
          </Col>
        </Row>
        {searchCondition ? (
          <Row className="mt-4">
            {/* Kartu Kiri */}
            <Col xl="6">
              <Card className="shadow">
                <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">Penghasilan</h3>
                  <Button
                    color="primary"
                    size="sm"
                    className="d-flex align-items-center"
                    onClick={addPenghasilan}
                  >
                    <i className="ni ni-fat-add me-1"></i>
                    Add
                  </Button>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Total</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          <span className="spinner-border spinner-border-sm"></span>
                        </td>
                      </tr>
                    ) : dataPenghasilan.length > 0 ? (
                      dataPenghasilan.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <Input
                              className="form-control-alternative"
                              type="text"
                              name="name"
                              value={item.name.toUpperCase()}
                              placeholder="Tambah penghasilan"
                              onChange={(e) =>
                                handleChangePenghasilan(index, e)
                              }
                            />
                          </td>
                          <td>
                            <Input
                              className="form-control-alternative"
                              type="text"
                              name="total"
                              value={`Rp ${formatRupiah(item.total)}`}
                              placeholder="0"
                              onChange={(e) =>
                                handleChangePenghasilan(index, e)
                              }
                            />
                          </td>
                          <td>
                            <Button
                              color="danger"
                              className="d-flex align-items-center"
                              onClick={() => handleDeletePenghasilan(index)}
                            >
                              <i className="ni ni-fat-remove"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No Data Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card>
            </Col>

            {/* Kartu Kanan */}
            <Col xl="6">
              <Card className="shadow">
                <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">Potongan</h3>
                  <Button
                    color="primary"
                    size="sm"
                    className="d-flex align-items-center"
                    onClick={addPotongan}
                  >
                    <i className="ni ni-fat-add me-1"></i>
                    Add
                  </Button>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Total</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          <span className="spinner-border spinner-border-sm"></span>
                        </td>
                      </tr>
                    ) : dataPotongan.length > 0 ? (
                      dataPotongan.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <Input
                              className="form-control-alternative"
                              type="text"
                              name="name"
                              value={item.name.toUpperCase()}
                              placeholder="Tambah potongan"
                              onChange={(e) => handleChangePotongan(index, e)}
                            />
                          </td>
                          <td>
                            <Input
                              className="form-control-alternative"
                              type="text"
                              name="total"
                              value={`Rp ${formatRupiah(item.total)}`}
                              placeholder="0"
                              onChange={(e) => handleChangePotongan(index, e)}
                            />
                          </td>
                          <td>
                            <Button
                              color="danger"
                              className="d-flex align-items-center"
                              onClick={() => handleDeletePotongan(index)}
                            >
                              <i className="ni ni-fat-remove"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No Data Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
        ) : (
          ""
        )}

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

export default RekapGaji;
