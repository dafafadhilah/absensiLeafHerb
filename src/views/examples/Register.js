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

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Invalid email";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true); // Mulai loading

    try {
      // Cek apakah email sudah terdaftar di tabel users
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", form.email);

      if (checkError)
        throw new Error("Error checking email: " + checkError.message);

      if (existingUsers.length > 0) {
        setModal({
          visible: true,
          type: "info",
          message: "Email already registered!",
        });
        return;
      }

      // Buat user di Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) throw new Error(error.message);

      // Ambil user_id yang baru dibuat
      const userId = data.user?.id;
      if (!userId) throw new Error("Error: User ID not found.");

      // Insert user ke tabel users
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: userId,
          email: form.email,
          name: form.name,
          job_code: "crew",
        },
      ]);

      if (insertError) {
        throw new Error("Error inserting user: " + insertError.message);
      }

      setModal({
        visible: true,
        type: "success",
        message: "Registrasi berhasil!",
      });
    } catch (error) {
      setModal({
        visible: true,
        type: "error",
        message: error.message,
      });
    } finally {
      setLoading(false); // Selesai loading
    }
  };

  return (
    <Col lg="6" md="8">
      <Card className="bg-secondary shadow border-0">
        <CardBody className="px-lg-5 py-lg-5">
          <div className="text-center text-muted mb-4">
            <small>Sign up with credentials</small>
          </div>
          <Form role="form" onSubmit={handleSubmit}>
            <FormGroup>
              <InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-hat-3" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </InputGroup>
              {errors.name && (
                <small className="text-danger">{errors.name}</small>
              )}
            </FormGroup>
            <FormGroup>
              <InputGroup className="input-group-alternative mb-3">
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
                  "Create account"
                )}
              </Button>
            </div>
          </Form>
          <Row className="mt-3">
            <Col xs="6"></Col>
            <Col className="text-right" xs="6">
              <a className="text-light" href="/auth/login">
                <small>Already have an account?</small>
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
        onOk={() => {
          navigate("/auth/login");
        }}
      />
    </Col>
  );
};

export default Register;
