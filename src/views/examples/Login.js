import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Row,
} from "reactstrap";
import supabase from "utils/supabaseClient";
import CustomModal from "../../components/CustomModal";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({
    visible: false,
    type: "",
    message: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    let newErrors = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Invalid email";
    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/admin/index"); // Redirect jika sudah login
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setModal({
        visible: true,
        type: "error",
        message: error.message.includes("Invalid login credentials")
          ? "Email atau password salah!"
          : "Terjadi kesalahan. Coba lagi!",
      });
      return;
    }

    // Simpan token dan waktu kedaluwarsa
    localStorage.setItem("token", data.session.access_token);
    localStorage.setItem("tokenExpire", Date.now() + 60 * 60 * 1000); // 1 jam
    localStorage.setItem("userId", data.user.id); // Simpan ID user

    navigate("/admin/index"); // Arahkan ke dashboard setelah login
  };

  return (
    <Col lg="5" md="7">
      <Card className="bg-secondary shadow border-0">
        <CardBody className="px-lg-5 py-lg-5">
          <div className="text-center text-muted mb-4">
            <small>Sign in with credentials</small>
          </div>
          <Form onSubmit={handleLogin}>
            <FormGroup className="mb-3">
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-email-83" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </InputGroup>
              {errors.email && (
                <small className="text-danger">{errors.email}</small>
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
                <InputGroupAddon addonType="append">
                  <InputGroupText
                    style={{ cursor: "pointer" }}
                    onClick={togglePasswordVisibility}
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
            <div className="text-center">
              <Button className="my-4" color="primary" type="submit">
                Sign in
              </Button>
            </div>
          </Form>
          <Row className="mt-3">
            <Col xs="6">
              <a className="text-light" href="/auth/forgotPassword">
                <small>Forgot password?</small>
              </a>
            </Col>
            <Col className="text-right" xs="6">
              <a className="text-light" href="/auth/register">
                <small>Create new account</small>
              </a>
            </Col>
          </Row>
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

export default Login;
