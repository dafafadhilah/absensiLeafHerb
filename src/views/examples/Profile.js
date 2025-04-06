// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
} from "reactstrap";
// core components
import UserHeader from "components/Headers/UserHeader.js";
import { useState, useEffect, useRef } from "react";
import supabase from "utils/supabaseClient";
import CustomModal from "../../components/CustomModal";
import CustomModalConfirm from "../../components/CustomModalConfirm";
import moment from "moment";
import "moment/locale/id";
import { DatePicker, Spin } from "antd";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
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
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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
    const fetchUserData = async () => {
      setLoading(true);
      if (!userId) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      setLoading(false);

      if (error) {
        console.error("Gagal mengambil data user:", error.message);
        return;
      }

      setUser(data); // Simpan data user ke state
    };

    fetchUserData();
  }, [userId]);

  const getImageUrl = (path) => {
    const { data } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleDateChange = (field, date, dateString) => {
    setUser((prev) => ({
      ...prev,
      [field]: date ? date.format("YYYY-MM-DD") : null, // standar ISO
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const prosesUpdate = () => {
    setModalConfirm({
      visible: true,
      message: "Apakah anda yakin ingin submit profile?",
      confirm: () => {
        callUpdateProfile();
        setModalConfirm({ ...modalConfirm, visible: false });
      },
    });
  };

  const callUpdateProfile = async () => {
    setLoading(true);

    try {
      console.log(user);

      let profilePictureUrl = user.profile_picture;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `profile_pictures/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile-pictures") // ganti dengan nama bucket kamu
          .upload(filePath, selectedFile, {
            contentType: selectedFile.type,
          });

        if (uploadError) {
          throw new Error("Gagal upload gambar: " + uploadError.message);
        }

        // ambil URL publik file
        const { data: publicUrlData } = supabase.storage
          .from("profile-pictures")
          .getPublicUrl(filePath);

        profilePictureUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from("users")
        .update({
          email: user.email,
          name: user.name,
          phone_number: user.phone_number,
          date_of_birth: user.date_of_birth,
          marital_status: user.marital_status,
          address: user.address,
          city: user.city,
          province: user.province,
          country: user.country,
          about_me: user.about_me,
          profile_picture: profilePictureUrl,
        })
        .eq("id", userId);

      if (error) {
        setModal({
          visible: true,
          type: "error",
          message: error.message,
        });
      } else {
        console.log("Berhasil update data karyawan", userId);

        setModal({
          visible: true,
          type: "success",
          message: "Data berhasil diupdate!",
          onOk: () => {
            setEdit(false);
            setModal((prev) => ({ ...prev, visible: false }));
          },
        });
      }
    } catch (error) {
      console.error("Error saat update koreksi absensi:", error.message);
      setModal({
        visible: true,
        type: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserHeader dataUser={user} />
      <Spin spinning={loading} size="large">
        {/* Page content */}
        <Container className="mt--7" fluid>
          <Row>
            {edit ? (
              <Col className="order-xl-1" xl="12">
                <Card className="bg-secondary shadow">
                  <CardHeader className="bg-white border-0">
                    <Row className="align-items-center">
                      <Col xs="8">
                        <h3 className="mb-0">My Profile</h3>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        prosesUpdate();
                      }}
                    >
                      <h6 className="heading-small text-muted mb-4">
                        User information
                      </h6>
                      <div className="pl-lg-4">
                        <Row>
                          <Col lg="12">
                            <FormGroup>
                              <label
                                htmlFor="profile_picture"
                                className="form-control-label"
                              >
                                Profile Picture
                              </label>
                              <Input
                                type="file"
                                name="profile_picture"
                                id="profile_picture"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e)}
                                className="form-control-alternative"
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-username"
                              >
                                Username
                              </label>
                              <Input
                                className="form-control-alternative"
                                name="name"
                                id="name"
                                placeholder="Username"
                                type="text"
                                value={user?.name || ""}
                                onChange={handleChange}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-email"
                              >
                                Email address
                              </label>
                              <Input
                                className="form-control-alternative"
                                id="email"
                                name="email"
                                placeholder="Email"
                                type="email"
                                value={user?.email || ""}
                                onChange={handleChange}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg="4">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-first-name"
                              >
                                Phone Number
                              </label>
                              <Input
                                className="form-control-alternative"
                                id="phone_number"
                                name="phone_number"
                                placeholder="Phone Number"
                                type="number"
                                value={user?.phone_number || ""}
                                onChange={handleChange}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="4">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-date-of-birth"
                              >
                                Date of Birth
                              </label>

                              <Input
                                innerRef={inputRef}
                                className="form-control-alternative"
                                id="date_of_birth"
                                name="date_of_birth"
                                placeholder="Date of Birth"
                                type="date"
                                value={user?.date_of_birth || ""}
                                onChange={handleChange}
                                onClick={handleClick}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="4">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-marital-status"
                              >
                                Marital Status
                              </label>
                              <Input
                                className="form-control-alternative"
                                id="marital_status"
                                name="marital_status"
                                placeholder="Marital Status"
                                type="select"
                                value={user?.marital_status || ""}
                                onChange={handleChange}
                              >
                                <option value="">Pilih Status</option>
                                <option value="Lajang">Lajang</option>
                                <option value="Menikah">Menikah</option>
                                <option value="Janda/duda">Janda/duda</option>
                                <option value="Bercerai">Bercerai</option>
                                <option value="Berpisah">Berpisah</option>
                                <option value="Kemitraan terdaftar">
                                  Kemitraan terdaftar
                                </option>
                                <option value="Cerai mati">Cerai mati</option>
                              </Input>
                            </FormGroup>
                          </Col>
                        </Row>
                      </div>
                      <hr className="my-4" />
                      {/* Address */}
                      <h6 className="heading-small text-muted mb-4">
                        Contact information
                      </h6>
                      <div className="pl-lg-4">
                        <Row>
                          <Col md="12">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-address"
                              >
                                Address
                              </label>
                              <Input
                                className="form-control-alternative"
                                id="address"
                                name="address"
                                placeholder="Home Address"
                                type="text"
                                value={user?.address || ""}
                                onChange={handleChange}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg="4">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-city"
                              >
                                City
                              </label>
                              <Input
                                className="form-control-alternative"
                                id="city"
                                name="city"
                                placeholder="City"
                                type="text"
                                value={user?.city || ""}
                                onChange={handleChange}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="4">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-province"
                              >
                                Province
                              </label>
                              <Input
                                className="form-control-alternative"
                                id="province"
                                name="province"
                                placeholder="Province"
                                type="text"
                                value={user?.province || ""}
                                onChange={handleChange}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="4">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-country"
                              >
                                Country
                              </label>
                              <Input
                                className="form-control-alternative"
                                id="country"
                                name="country"
                                placeholder="Country"
                                type="text"
                                value={user?.country || ""}
                                onChange={handleChange}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </div>
                      <hr className="my-4" />
                      {/* Description */}
                      <h6 className="heading-small text-muted mb-4">
                        About me
                      </h6>
                      <div className="pl-lg-4">
                        <FormGroup>
                          <label>About Me</label>
                          <Input
                            className="form-control-alternative"
                            placeholder="A few words about you ..."
                            rows="4"
                            type="textarea"
                            id="about_me"
                            name="about_me"
                            value={user?.about_me || ""}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </div>
                      <hr className="my-4" />
                      <div className="d-flex justify-content-end">
                        <Button
                          color="warning"
                          onClick={() => {
                            setModalConfirm({
                              visible: true,
                              message:
                                "Apakah anda yakin ingin membatalkan perubahan ini?",
                              confirm: () => {
                                setEdit(false);
                                setModalConfirm((prev) => ({
                                  ...prev,
                                  visible: false,
                                }));
                              },
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button color="primary" type="submit">
                          {loading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            "Submit"
                          )}
                        </Button>
                      </div>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            ) : (
              <Col className="order-xl-2 mb-5 mb-xl-0" xl="12">
                <Card className="card-profile shadow">
                  <Row className="justify-content-center">
                    <Col className="order-lg-2" lg="3">
                      <div className="card-profile-image">
                        <img
                          alt="..."
                          className="rounded-circle"
                          src={
                            user?.profile_picture ||
                            require("../../assets/img/theme/default-image.jpg")
                          }
                        />
                      </div>
                    </Col>
                  </Row>
                  <CardHeader className="text-center border-0 pt-8 pt-md-4 pb-0 pb-md-4">
                    <div className="d-flex justify-content-between"></div>
                  </CardHeader>
                  <CardBody className="pt-0 pt-md-4">
                    <Row>
                      <div className="col">
                        <div className="card-profile-stats d-flex justify-content-center mt-md-5"></div>
                      </div>
                    </Row>
                    <div className="text-center">
                      <h3>
                        {user?.name || ""}
                        <span className="font-weight-light">
                          {user?.date_of_birth
                            ? `, ${
                                new Date().getFullYear() -
                                new Date(user.date_of_birth).getFullYear()
                              } Tahun`
                            : ""}
                        </span>
                      </h3>
                      {user?.phone_number || user?.marital_status ? (
                        <div className="h5 font-weight-300">
                          <i className="ni location_pin mr-2" />
                          {user?.phone_number ? user?.phone_number || "" : ""}
                          {user?.marital_status
                            ? " - " + user?.marital_status || ""
                            : ""}
                        </div>
                      ) : (
                        ""
                      )}
                      <div className="h5 mt-4">
                        <i className="ni business_briefcase-24 mr-2" />
                        {user?.job_code.toUpperCase() || ""} - LeafHerb
                      </div>
                      {user?.city || user?.province || user?.country ? (
                        <div>
                          <i className="ni education_hat mr-2" />
                          {user?.city ? user?.city || "" : ""}
                          {user?.province ? ", " + user?.province || "" : ""}
                          {user?.country ? ", " + user?.country || "" : ""}
                        </div>
                      ) : (
                        ""
                      )}
                      <hr className="my-4" />
                      <p>{user?.address || ""}</p>
                      <Button color="info" onClick={() => setEdit(true)}>
                        Edit profile
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            )}
          </Row>
          <CustomModal
            visible={modal.visible}
            type={modal.type}
            message={modal.message}
            onClose={() => setModal({ ...modal, visible: false })}
            onOk={modal.onOk}
          />
          <CustomModalConfirm
            visible={modalConfirm.visible}
            message={modalConfirm.message}
            onClose={() => setModalConfirm({ ...modalConfirm, visible: false })}
            onConfirm={modalConfirm.confirm}
          />
        </Container>
      </Spin>
    </>
  );
};

export default Profile;
