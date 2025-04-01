import { useEffect, useState } from "react";
// node.js library that concatenates classes (strings)
// javascipt plugin for creating charts
// react plugin used to create charts
// reactstrap components
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Container,
  Input,
  Row,
  Table,
} from "reactstrap";

import Header from "components/Headers/Header.js";
import moment from "moment";
import "moment/locale/id";
import supabase from "utils/supabaseClient";
import CustomModal from "../../components/CustomModal";
import CustomModalConfirm from "../../components/CustomModalConfirm";

const Todolist = (props) => {
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

  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [loading, setLoading] = useState(false);
  const [dataKoreksiAbsensiKaryawan, setDataKoreksiAbsensiKaryawan] = useState(
    []
  );

  const [cekUpdate, setCekUpdate] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [paginatedData, setPaginatedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); // State untuk menyimpan ID yang dipilih
  const itemsPerPage = 5; // Jumlah data per halaman

  // Hitung total halaman
  useEffect(() => {
    setTotalPages(
      dataKoreksiAbsensiKaryawan.length === 0
        ? 0
        : Math.ceil(dataKoreksiAbsensiKaryawan.length / itemsPerPage)
    );

    // Ambil data sesuai halaman
    setPaginatedData(
      dataKoreksiAbsensiKaryawan.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    );
  }, [dataKoreksiAbsensiKaryawan, currentPage]); // Tambahkan currentPage ke dependencies

  useEffect(() => {
    callGetDataKoreksiAbsensi();
  }, []);

  const callGetDataKoreksiAbsensi = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("attendance_corrections")
        .select(
          "id, attendance_id, old_clock_in, old_clock_out,new_clock_in, new_clock_out, status, users:user_id(email, name), attendance:attendance_id(date)"
        )
        .eq("status", "Pending")
        .order("request_date", { ascending: false });

      if (error) {
        console.error(
          "Error saat mengambil data koreksi absen karyawan:",
          error.message
        );
      }

      if (data.length > 0) {
        const formattedData = data.map((item) => ({
          ...item,
          statusApproved: "", // Gunakan nilai default jika tidak ada
        }));
        setDataKoreksiAbsensiKaryawan(formattedData);
      } else {
        console.log("Tidak ada data");
        setDataKoreksiAbsensiKaryawan(data);
        setCurrentPage(0);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, id) => {
    const { value } = e.target;

    setDataKoreksiAbsensiKaryawan((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, statusApproved: value } : item
      )
    );
  };

  const handleCheckboxChange = (e, id) => {
    const { checked } = e.target;
    setSelectedRows((prevSelected) => {
      if (checked) {
        return [...prevSelected, id]; // Tambah id jika dicentang
      } else {
        return prevSelected.filter((itemId) => itemId !== id); // Hapus id jika tidak dicentang
      }
    });
  };
  const handleCheckAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(dataKoreksiAbsensiKaryawan.map((item) => item.id)); // Pilih semua
    } else {
      setSelectedRows([]); // Hapus semua
    }
  };

  const handleSubmit = () => {
    // Filter data yang dipilih berdasarkan selectedRows
    const selectedData = dataKoreksiAbsensiKaryawan.filter((item) =>
      selectedRows.includes(item.id)
    );

    // Cek apakah ada data yang statusApproved-nya masih kosong
    const hasEmptyStatus = selectedData.some(
      (item) => item.statusApproved === ""
    );

    if (hasEmptyStatus) {
      // Jika ada yang masih kosong, tampilkan modal error
      setModal({
        visible: true,
        type: "error",
        message: "Beberapa data memiliki action yang belum dipilih!",
      });
      return; // Hentikan proses lebih lanjut jika ada error
    }

    // Log data yang telah dipilih (akan diproses selanjutnya)
    console.log("Data yang dipilih:", selectedData);

    setModalConfirm({
      visible: true,
      message: "Apakah anda yakin ingin submit data koreksi absensi karyawan?",
      confirm: () => {
        prosesUpdate(selectedData);
        setModalConfirm({ ...modalConfirm, visible: false });
      },
    });
  };

  const prosesUpdate = async (selectedData) => {
    try {
      // Tunggu semua proses update selesai
      await Promise.all(selectedData.map((item) => callUdpateAttCor(item)));

      // Jika semua update berhasil, tampilkan modal sukses
      setModal({
        visible: true,
        type: "success",
        message: "Data berhasil disubmit!",
      });

      // Ambil data terbaru setelah update
      callGetDataKoreksiAbsensi();
    } catch (error) {
      // Jika ada error di salah satu proses, tampilkan modal error
      setModal({
        visible: true,
        type: "error",
        message: "Ada kesalahan saat memproses data.",
      });
      console.log("Error", error);
    }
  };

  const callUdpateAttCor = async (selectedData) => {
    setLoading(true);

    const now = new Date();
    const pad = (num) => num.toString().padStart(2, "0");

    const formattedDate = `${now.getFullYear()}-${pad(
      now.getMonth() + 1
    )}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
      now.getMinutes()
    )}:${pad(now.getSeconds())}`;

    try {
      const { error } = await supabase
        .from("attendance_corrections")
        .update({
          status: selectedData.statusApproved,
          approved_by: userId,
          approved_at: formattedDate,
        }) // Hanya update clock_out
        .eq("id", selectedData.id);

      if (error) throw new Error(error.message);

      if (selectedData.statusApproved === "Approved") {
        await callUdpateAtt(selectedData);
      }

      console.log("Berhasil update koreksi absensi", selectedData.id);
    } catch (error) {
      console.error("Error saat update koreksi absensi:", error.message);
      throw error; // Lempar error supaya bisa ditangani di prosesUpdate
    } finally {
      setLoading(false);
    }
  };

  const callUdpateAtt = async (selectedData) => {
    setLoading(true);

    const { error } = await supabase
      .from("attendance")
      .update({
        clock_in: selectedData.new_clock_in,
        clock_out: selectedData.new_clock_out,
      }) // Hanya update clock_out
      .eq("id", selectedData.attendance_id);

    setLoading(false);

    if (error) throw new Error(error.message);

    console.error("Behasil update ", selectedData.attendance_id);
  };

  const isAllChecked =
    dataKoreksiAbsensiKaryawan.length > 0 &&
    dataKoreksiAbsensiKaryawan.every((item) => selectedRows.includes(item.id));

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow mt-4">
              <CardHeader className="border-0">
                <h3 className="mb-0">Data Koreksi Absensi Karyawan</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">
                      <Input
                        type="checkbox"
                        checked={isAllChecked} // Cek apakah semua data di halaman sudah dipilih
                        onChange={handleCheckAll} // Pilih atau hapus semua
                        style={{
                          position: "static", // Membuat posisi mengikuti layout normal
                          marginLeft: "0", // Sesuaikan margin jika perlu
                          marginTop: "0", // Sesuaikan margin jika perlu
                          width: "20px", // Ukuran checkbox jika perlu
                          height: "20px", // Ukuran checkbox jika perlu
                        }}
                      />
                    </th>
                    <th scope="col">Email</th>
                    <th scope="col">Nama</th>
                    <th scope="col">Tanggal</th>
                    <th scope="col">Jam Masuk Sebelum</th>
                    <th scope="col">Jam Pulang Sebelum</th>
                    <th scope="col">Jam Masuk Sesudah</th>
                    <th scope="col">Jam Pulang Sesudah</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <span className="spinner-border spinner-border-sm"></span>
                      </td>
                    </tr>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id}>
                        <th scope="row">
                          <Input
                            type="checkbox"
                            checked={selectedRows.includes(item.id)}
                            onChange={(e) => handleCheckboxChange(e, item.id)}
                            style={{
                              position: "static", // Membuat posisi mengikuti layout normal
                              marginLeft: "0", // Sesuaikan margin jika perlu
                              marginTop: "0", // Sesuaikan margin jika perlu
                              width: "20px", // Ukuran checkbox jika perlu
                              height: "20px", // Ukuran checkbox jika perlu
                            }}
                          />
                        </th>

                        <td>{item.users.email}</td>
                        <td>{item.users.name}</td>
                        <td>
                          {moment(item.attendance.date).format("DD MMMM YYYY")}
                        </td>
                        <td>{item.old_clock_in}</td>
                        <td>{item.old_clock_out}</td>
                        <td>{item.new_clock_in}</td>
                        <td>{item.new_clock_out}</td>
                        <td>
                          <Input
                            type="select"
                            name="statusApproved"
                            value={item.statusApproved}
                            onChange={(e) => handleChange(e, item.id)}
                            style={{
                              width: "150px",
                            }}
                          >
                            <option value="">Pilih Action</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </Input>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <CardFooter className="d-flex justify-content-between align-items-center p-3 border-top">
                {/* Tombol Submit */}
                <div>
                  <Button
                    color="primary"
                    onClick={handleSubmit}
                    disabled={selectedRows.length === 0} // Disable jika tidak ada yang dipilih
                    className="rounded-pill"
                    style={{ marginRight: "20px" }}
                  >
                    Submit
                  </Button>
                  <span className="fw-bold text-muted me-3">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <div className="d-flex align-items-center">
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

export default Todolist;
