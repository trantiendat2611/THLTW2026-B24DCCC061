import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tabs,
  Select,
  message,
  Card,
} from "antd";

const { TabPane } = Tabs;

const App = () => {
  const [clubs, setClubs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");

  // ===== FILTER =====
  const filteredClubs = clubs.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ===== ADD CLUB =====
  const addClub = (values: any) => {
    setClubs([...clubs, { ...values, id: Date.now() }]);
    setVisible(false);
    form.resetFields();
  };

  const deleteClub = (id: number) => {
    setClubs(clubs.filter((c) => c.id !== id));
  };

  // ===== ADD APPLICATION =====
  const addApplication = (values: any) => {
    setApplications([
      ...applications,
      {
        ...values,
        id: Date.now(),
        status: "Pending",
        history: [],
      },
    ]);
  };

  // ===== APPROVE =====
  const approve = () => {
    setApplications(
      applications.map((item) =>
        selectedRows.find((r) => r.id === item.id)
          ? {
              ...item,
              status: "Approved",
              history: [
                ...item.history,
                { action: "Approved", time: new Date().toLocaleString() },
              ],
            }
          : item
      )
    );
  };

  // ===== REJECT =====
  const reject = () => {
    let reason = "";
    Modal.confirm({
      title: "Nhập lý do",
      content: <Input onChange={(e) => (reason = e.target.value)} />,
      onOk() {
        if (!reason) return message.error("Phải nhập lý do");

        setApplications(
          applications.map((item) =>
            selectedRows.find((r) => r.id === item.id)
              ? {
                  ...item,
                  status: "Rejected",
                  note: reason,
                  history: [
                    ...item.history,
                    {
                      action: "Rejected",
                      reason,
                      time: new Date().toLocaleString(),
                    },
                  ],
                }
              : item
          )
        );
      },
    });
  };

  const deleteApplication = (id: number) => {
    setApplications(applications.filter((a) => a.id !== id));
  };

  const rowSelection = {
    onChange: (_: any, rows: any[]) => setSelectedRows(rows),
  };

  const members = applications.filter((i) => i.status === "Approved");

  // ===== CHANGE CLUB =====
  const changeClub = () => {
    let newClub = "";
    Modal.confirm({
      title: `Chuyển ${selectedRows.length} thành viên`,
      content: (
        <Select
          style={{ width: "100%" }}
          options={clubs.map((c) => ({ value: c.name, label: c.name }))}
          onChange={(v) => (newClub = v)}
        />
      ),
      onOk() {
        if (!newClub) return message.error("Chọn CLB");

        setApplications(
          applications.map((item) =>
            selectedRows.find((r) => r.id === item.id)
              ? { ...item, club: newClub }
              : item
          )
        );
      },
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <Tabs defaultActiveKey="1">

        {/* ===== CLB ===== */}
        <TabPane tab="CLB" key="1">
          <Input.Search
            placeholder="Tìm CLB..."
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 10 }}
          />

          <Button onClick={() => setVisible(true)}>Thêm CLB</Button>

          <Table
            dataSource={filteredClubs}
            rowKey="id"
            columns={[
              {
                title: "Ảnh",
                dataIndex: "avatar",
                render: (v) => <img src={v} width={50} />,
              },
              { title: "Tên", dataIndex: "name" },
              { title: "Ngày TL", dataIndex: "date" },
              { title: "Chủ nhiệm", dataIndex: "leader" },
              {
                title: "Mô tả",
                dataIndex: "desc",
                render: (v) => (
                  <div dangerouslySetInnerHTML={{ __html: v }} />
                ),
              },
              {
                title: "Hoạt động",
                dataIndex: "active",
                render: (v) => (v ? "Có" : "Không"),
              },
              {
                title: "Action",
                render: (_, r) => (
                  <>
                    <Button
                      onClick={() =>
                        Modal.info({
                          title: "Danh sách thành viên",
                          content: applications
                            .filter(
                              (a) =>
                                a.club === r.name &&
                                a.status === "Approved"
                            )
                            .map((m) => <p>{m.name}</p>),
                        })
                      }
                    >
                      Members
                    </Button>

                    <Button danger onClick={() => deleteClub(r.id)}>
                      Xóa
                    </Button>
                  </>
                ),
              },
            ]}
          />

          <Modal
            visible={visible}
            onCancel={() => setVisible(false)}
            onOk={() => form.submit()}
          >
            <Form form={form} onFinish={addClub} layout="vertical">
              <Form.Item name="avatar" label="Ảnh URL">
                <Input />
              </Form.Item>
              <Form.Item name="name" label="Tên CLB" required>
                <Input />
              </Form.Item>
              <Form.Item name="date" label="Ngày TL">
                <Input />
              </Form.Item>
              <Form.Item name="leader" label="Chủ nhiệm">
                <Input />
              </Form.Item>
              <Form.Item name="desc" label="Mô tả HTML">
                <Input />
              </Form.Item>
              <Form.Item name="active" label="Hoạt động">
                <Select
                  options={[
                    { value: true, label: "Có" },
                    { value: false, label: "Không" },
                  ]}
                />
              </Form.Item>
            </Form>
          </Modal>
        </TabPane>

        {/* ===== ĐƠN ===== */}
        <TabPane tab="Đơn đăng ký" key="2">
          <Form onFinish={addApplication} layout="inline">
            <Form.Item name="name" required>
              <Input placeholder="Tên" />
            </Form.Item>
            <Form.Item name="email">
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item name="phone">
              <Input placeholder="SĐT" />
            </Form.Item>
            <Form.Item name="gender">
              <Select
                style={{ width: 120 }}
                options={[{ value: "Nam" }, { value: "Nữ" }]}
              />
            </Form.Item>
            <Form.Item name="address">
              <Input placeholder="Địa chỉ" />
            </Form.Item>
            <Form.Item name="skill">
              <Input placeholder="Sở trường" />
            </Form.Item>
            <Form.Item name="reason">
              <Input placeholder="Lý do" />
            </Form.Item>
            <Form.Item name="club">
              <Select
                style={{ width: 120 }}
                options={clubs.map((c) => ({
                  value: c.name,
                  label: c.name,
                }))}
              />
            </Form.Item>
            <Button htmlType="submit">Thêm</Button>
          </Form>

          <br />

          <Button onClick={approve}>Duyệt ({selectedRows.length})</Button>
          <Button danger onClick={reject}>
            Từ chối ({selectedRows.length})
          </Button>

          <Table
            rowSelection={rowSelection}
            dataSource={applications}
            rowKey="id"
            columns={[
              { title: "Tên", dataIndex: "name" },
              { title: "Email", dataIndex: "email" },
              { title: "SĐT", dataIndex: "phone" },
              { title: "Giới tính", dataIndex: "gender" },
              { title: "CLB", dataIndex: "club" },
              { title: "Trạng thái", dataIndex: "status" },
              { title: "Ghi chú", dataIndex: "note" },
              {
                title: "Action",
                render: (_, r) => (
                  <>
                    <Button
                      onClick={() =>
                        Modal.info({
                          title: "History",
                          content: r.history.map((h) => (
                            <p>{h.action} - {h.time}</p>
                          )),
                        })
                      }
                    >
                      History
                    </Button>

                    <Button danger onClick={() => deleteApplication(r.id)}>
                      Xóa
                    </Button>
                  </>
                ),
              },
            ]}
          />
        </TabPane>

        {/* ===== MEMBERS ===== */}
        <TabPane tab="Thành viên" key="3">
          <Button onClick={changeClub}>
            Chuyển CLB ({selectedRows.length})
          </Button>

          <Table
            rowSelection={rowSelection}
            dataSource={members}
            rowKey="id"
            columns={[
              { title: "Tên", dataIndex: "name" },
              { title: "Email", dataIndex: "email" },
              { title: "CLB", dataIndex: "club" },
            ]}
          />
        </TabPane>

        {/* ===== DASHBOARD ===== */}
        <TabPane tab="Thống kê" key="4">
          <Card>Số CLB: {clubs.length}</Card>
          <Card>
            Pending:{" "}
            {applications.filter((i) => i.status === "Pending").length}
          </Card>
          <Card>
            Approved:{" "}
            {applications.filter((i) => i.status === "Approved").length}
          </Card>
          <Card>
            Rejected:{" "}
            {applications.filter((i) => i.status === "Rejected").length}
          </Card>
        </TabPane>

      </Tabs>
    </div>
  );
};

export default App;