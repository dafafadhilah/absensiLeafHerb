import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Tabs, Card, Badge } from "antd";
import KoreksiAbsensi from "./TabTodolist/KoreksiAbsensi";
import PengajuanLembur from "./TabTodolist/PengajuanLembur";
import { Container, Row } from "reactstrap";
import supabase from "utils/supabaseClient";
import { useDispatch } from "react-redux";
import { fetchNotificationCount } from "../../redux/action/notification";

import Header from "components/Headers/Header.js";

const TodoList = () => {
  const [count, setCount] = useState({
    ka: 0,
    pl: 0,
  });
  const dispatch = useDispatch();

  const notificationCount = useSelector((state) => state.notification.count);

  useEffect(() => {
    setCount({
      ka: notificationCount.KoreksiAbsensi,
      pl: notificationCount.PengajuanLembur,
    });
  }, [notificationCount]);

  const updateNotif = () => {
    dispatch(fetchNotificationCount());
  };

  return (
    <>
      <Header menuName={"TODOLIST"} />
      <Container
        className={"mt-n7"}
        // style={{ marginTop: window.innerWidth > 768 ? "-7px" : "-9px" }}
        fluid
      >
        <Row style={{ marginTop: window.innerWidth > 768 ? "30px" : "-170px" }}>
          <div className="col">
            <div style={{ position: "relative", paddingTop: "27px" }}>
              <Tabs
                defaultActiveKey="1"
                type="card"
                tabBarStyle={{
                  fontWeight: "bold",
                  background: "white",
                  borderRadius: "12px 12px 0 0",
                  padding: "10px 20px",
                  zIndex: 10,
                  ...(window.innerWidth > 768
                    ? {
                        position: "absolute",
                        top: "-9px",
                        left: "15px",
                        fontSize: "16px",
                      } // **Desktop**
                    : {
                        position: "relative",
                        top: "0px",
                        fontSize: "12px",
                        top: "43px",
                      }), // **Mobile**
                }}
              >
                <Tabs.TabPane
                  tab={
                    <>
                      Koreksi Absensi
                      <Badge count={count.ka} className="ml-1 mb-1"></Badge>
                    </>
                  }
                  key="1"
                >
                  <KoreksiAbsensi onConfirm={() => updateNotif()} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <>
                      Pengajuan Lembur
                      <Badge count={count.pl} className="ml-1 mb-1"></Badge>
                    </>
                  }
                  key="2"
                >
                  <PengajuanLembur onConfirm={() => updateNotif()} />
                </Tabs.TabPane>
              </Tabs>
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default TodoList;
