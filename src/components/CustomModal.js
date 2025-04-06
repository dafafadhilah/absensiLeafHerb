import { Modal, Button } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const CustomModal = ({ visible, type, message, onClose, onOk }) => {
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="ok" type="primary" onClick={onOk || onClose}>
          OK
        </Button>,
      ]}
    >
      <div style={{ textAlign: "center", padding: "20px" }}>
        {type === "success" ? (
          <CheckCircleOutlined style={{ fontSize: "50px", color: "#52c41a" }} />
        ) : type === "info" ? (
          <InfoCircleOutlined style={{ fontSize: "50px", color: "#1890ff" }} />
        ) : (
          <ExclamationCircleOutlined
            style={{ fontSize: "50px", color: "#ff4d4f" }}
          />
        )}
        <h3 style={{ marginTop: "15px" }}>{message}</h3>
      </div>
    </Modal>
  );
};

export default CustomModal;
