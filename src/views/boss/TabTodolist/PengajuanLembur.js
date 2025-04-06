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
import CustomModal from "../../../components/CustomModal";
import CustomModalConfirm from "../../../components/CustomModalConfirm";

const PengajuanLembur = ({ onConfirm }) => {
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
  const [dataPengajuanLembur, setDataPengajuanLembur] = useState([]);

  const [cekUpdate, setCekUpdate] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [paginatedData, setPaginatedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); // State untuk menyimpan ID yang dipilih
  const itemsPerPage = 5; // Jumlah data per halaman

  // Hitung total halaman
  useEffect(() => {
    setTotalPages(
      dataPengajuanLembur.length === 0
        ? 0
        : Math.ceil(dataPengajuanLembur.length / itemsPerPage)
    );

    // Ambil data sesuai halaman
    setPaginatedData(
      dataPengajuanLembur.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    );
  }, [dataPengajuanLembur, currentPage]); // Tambahkan currentPage ke dependencies

  useEffect(() => {
    callGetDataPengajuanLembur();
  }, []);

  const callGetDataPengajuanLembur = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("overtime_requests")
        .select(
          "id, overtime_date, overtime_in, overtime_out, total_hours, reason, status, users:user_id(email, name)"
        )
        .eq("status", "Pending")
        .order("request_date", { ascending: false });

      if (error) {
        console.error(
          "Error saat mengambil data pengajuan lembur:",
          error.message
        );
      }

      if (data.length > 0) {
        const formattedData = data.map((item) => ({
          ...item,
          statusApproved: "", // Gunakan nilai default jika tidak ada
        }));
        setDataPengajuanLembur(formattedData);
      } else {
        console.log("Tidak ada data");
        setDataPengajuanLembur(data);
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

    setDataPengajuanLembur((prev) =>
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
      setSelectedRows(dataPengajuanLembur.map((item) => item.id)); // Pilih semua
    } else {
      setSelectedRows([]); // Hapus semua
    }
  };

  const handleSubmit = () => {
    // Filter data yang dipilih berdasarkan selectedRows
    const selectedData = dataPengajuanLembur.filter((item) =>
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
      message: "Apakah anda yakin ingin submit data pengajuan lembur karyawan?",
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
      onConfirm();
      // Ambil data terbaru setelah update
      callGetDataPengajuanLembur();
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
        .from("overtime_requests")
        .update({
          status: selectedData.statusApproved,
          approved_by: userId,
          approved_at: formattedDate,
        }) // Hanya update clock_out
        .eq("id", selectedData.id);

      if (error) throw new Error(error.message);

      console.log("Berhasil update pengajuan lembur", selectedData.id);
    } catch (error) {
      console.error("Error saat update pengajuan lembur:", error.message);
      throw error; // Lempar error supaya bisa ditangani di prosesUpdate
    } finally {
      setLoading(false);
    }
  };

  const isAllChecked =
    dataPengajuanLembur.length > 0 &&
    dataPengajuanLembur.every((item) => selectedRows.includes(item.id));

  return (
    <>
      {/* Page content */}
      <Row>
        <div className="col">
          <Card className="shadow mt-4">
            <CardHeader className="border-0">
              <h3 className="mb-0">Data Pengajuan Lembur Karyawan</h3>
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
                  <th scope="col">Jam Masuk Lembur</th>
                  <th scope="col">Jam Pulang Lembur</th>
                  <th scope="col">Total Jam</th>
                  <th scope="col">Alasan</th>
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
                        {moment(item.overtime_date).format("DD MMMM YYYY")}
                      </td>
                      <td>{item.overtime_in}</td>
                      <td>{item.overtime_out}</td>
                      <td>{item.total_hours}</td>
                      <td>{item.reason}</td>
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
            <CardFooter className="border-top p-3">
              <div className="row w-100">
                <div className="col-12 col-md-6 d-flex align-items-center mb-2 mb-md-0">
                  <Button
                    color="primary"
                    onClick={handleSubmit}
                    disabled={selectedRows.length === 0}
                    className="rounded-pill me-2"
                  >
                    Submit
                  </Button>
                  <span className="fw-bold text-muted">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <div className="col-12 col-md-6 d-flex justify-content-md-end">
                  <Button
                    color="outline-primary"
                    disabled={currentPage === 1 || totalPages === 0}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="rounded-pill me-2"
                  >
                    Previous
                  </Button>
                  <Button
                    color="outline-primary"
                    disabled={currentPage === totalPages || totalPages === 0}
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
    </>
  );
};

export default PengajuanLembur;
