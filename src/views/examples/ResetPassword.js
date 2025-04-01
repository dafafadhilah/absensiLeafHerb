import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import supabase from "utils/supabaseClient";
import CustomModal from "../../components/CustomModal";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    password: "",
    passwordDup: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    text: "Weak",
    color: "text-danger",
  });
  const [modal, setModal] = useState({
    visible: false,
    type: "",
    message: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordDup, setShowPasswordDup] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  useEffect(() => {
    const handleSession = async () => {
      if (!token) return;
      try {
        const { error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token, // refresh token biasanya tidak ada di URL, tapi coba ini dulu
        });

        if (error) throw new Error("Token tidak valid atau expired.");
      } catch (err) {
        setModal({ visible: true, type: "error", message: err.message });
      }
    };
    handleSession();
  }, [token]);

  const togglePasswordVisibility = (key) => {
    if (key === 1) {
      setShowPassword((prev) => !prev);
    } else if (key === 2) {
      setShowPasswordDup((prev) => !prev);
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = "Weak";
    let strengthColor = "text-danger";
    if (password.length >= 8) {
      if (
        /[A-Z]/.test(password) &&
        /\d/.test(password) &&
        /[@$!%*?&]/.test(password)
      ) {
        strength = "Strong";
        strengthColor = "text-success";
      } else if (
        /[A-Z]/.test(password) ||
        /\d/.test(password) ||
        /[@$!%*?&]/.test(password)
      ) {
        strength = "Medium";
        strengthColor = "text-warning";
      }
    }
    setPasswordStrength({ text: strength, color: strengthColor });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const validate = () => {
    let newErrors = {};
    if (
      !form.password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      newErrors.password =
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    if (!token) {
      setModal({
        visible: true,
        type: "error",
        message: "Token tidak ditemukan atau tidak valid!",
      });
      setLoading(false);
      return;
    }
    if (form.password !== form.passwordDup) {
      setModal({
        visible: true,
        type: "warning",
        message: "New password doesn't match.",
      });
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: form.password,
      });
      if (error) throw new Error(error.message);
      setModal({
        visible: true,
        type: "success",
        message: "Password berhasil diubah!",
      });
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (error) {
      setModal({ visible: true, type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Col lg="6" md="8">
      <Card className="bg-secondary shadow border-0">
        <CardBody className="px-lg-5 py-lg-5">
          <div className="text-center text-muted mb-4">
            <small>Reset Password</small>
          </div>
          <Form role="form" onSubmit={handleResetPassword}>
            <FormGroup>
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-lock-circle-open" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
                <InputGroupAddon addonType="append">
                  <InputGroupText
                    style={{ cursor: "pointer" }}
                    onClick={() => togglePasswordVisibility(1)}
                  >
                    {showPassword ? (
                      <i className="fa fa-eye-slash" />
                    ) : (
                      <i className="fa fa-eye" />
                    )}
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {errors.password && (
                <small className="text-danger">{errors.password}</small>
              )}
            </FormGroup>
            <FormGroup>
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-lock-circle-open" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Password"
                  type={showPasswordDup ? "text" : "password"}
                  name="passwordDup"
                  value={form.passwordDup}
                  onChange={handleChange}
                />
                <InputGroupAddon addonType="append">
                  <InputGroupText
                    style={{ cursor: "pointer" }}
                    onClick={() => togglePasswordVisibility(2)}
                  >
                    {showPasswordDup ? (
                      <i className="fa fa-eye-slash" />
                    ) : (
                      <i className="fa fa-eye" />
                    )}
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </FormGroup>
            <div className="text-muted font-italic">
              <small>
                password strength:{" "}
                <span className={`font-weight-700 ${passwordStrength.color}`}>
                  {passwordStrength.text}
                </span>
              </small>
            </div>
            <div className="text-center">
              <Button
                className="mt-4"
                color="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
      <CustomModal
        visible={modal.visible}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal({ ...modal, visible: false })}
      />
    </Col>
  );
};

export default Register;
