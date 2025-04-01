import { Modal, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const CustomModalConfirm = ({ visible, message, onClose, onConfirm }) => {
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="ok" type="primary" onClick={onConfirm}>
          OK
        </Button>,
      ]}
    >
      <div style={{ textAlign: "center", padding: "20px" }}>
        <ExclamationCircleOutlined
          style={{ fontSize: "50px", color: "#faad14" }}
        />
        <h3 style={{ marginTop: "15px" }}>{message}</h3>
      </div>
    </Modal>
  );
};

export default CustomModalConfirm;
