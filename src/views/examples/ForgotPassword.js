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
} from "reactstrap";
import supabase from "utils/supabaseClient";
import CustomModal from "../../components/CustomModal";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({
    visible: false,
    type: "",
    message: "",
  });

  const validate = () => {
    let newErrors = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Invalid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", form.email);

      if (checkError)
        throw new Error("Error checking email: " + checkError.message);

      if (existingUsers.length <= 0) {
        setModal({
          visible: true,
          type: "error",
          message: "Email is not registered!",
        });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(form.email);
      if (error) {
        setModal({
          visible: true,
          type: "error",
          message: error.message,
        });
      } else {
        setModal({
          visible: true,
          type: "info",
          message: "Link reset password telah dikirim ke email kamu.",
        });
      }
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
    <Col lg="5" md="7">
      <Card className="bg-secondary shadow border-0">
        <CardBody className="px-lg-5 py-lg-5">
          <div className="text-center text-muted mb-4">
            <small>Forgot Password</small>
          </div>
          <Form onSubmit={handleResetPassword}>
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
            <div className="text-center">
              <Button
                className="my-4"
                color="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  "Send"
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

export default Login;
