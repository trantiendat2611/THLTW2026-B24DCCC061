import React, { useState } from "react";
import {
  Table, Button, Form, Input, DatePicker, Select,
  Card, Row, Col, message, Modal, Divider, Tag
} from "antd";

interface QuyetDinh {
  id: number;
  soQD: string;
  ngayBanHanh: string;
  trichYeu: string;
  nam: number;
  luotTraCuu: number;
}
interface FieldConfig {
  id: number;
  tenTruong: string;
  kieuDuLieu: string;
}
interface VanBang {
  id: number;
  soVaoSo: number;
  soHieu: string;
  maSV: string;
  hoTen: string;
  ngaySinh: string;
  nam: number;
  quyetDinhId: number;
  extra: any;
}
const App: React.FC = () => {

  const [soTheoNam, setSoTheoNam] = useState<{ [year: number]: number }>({});
  const [qdList, setQdList] = useState<QuyetDinh[]>([]);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [vbList, setVbList] = useState<VanBang[]>([]);

  const [searchResult, setSearchResult] = useState<VanBang[]>([]);
  const [detail, setDetail] = useState<VanBang | null>(null);

  const [formQD] = Form.useForm();
  const [formField] = Form.useForm();
  const [formVB] = Form.useForm();
  const [formSearch] = Form.useForm();

  const handleAddQD = (v: any) => {
    setQdList([...qdList, {
      id: Date.now(),
      soQD: v.soQD,
      ngayBanHanh: v.ngayBanHanh.format("DD/MM/YYYY"),
      trichYeu: v.trichYeu,
      nam: v.nam,
      luotTraCuu: 0
    }]);
    formQD.resetFields();
    message.success("Thêm quyết định thành công");
  };

  const handleAddField = (v: any) => {
    setFields([...fields, { id: Date.now(), ...v }]);
    formField.resetFields();
  };

  const handleDeleteField = (id: number) => {
    setFields(fields.filter(f => f.id !== id));
  };
  const handleAddVB = (v: any) => {
    const year = v.nam;
    const newSo = (soTheoNam[year] || 0) + 1;
    setSoTheoNam({ ...soTheoNam, [year]: newSo });

    const extra: any = {};
    fields.forEach(f => {
      extra[f.tenTruong] =
        f.kieuDuLieu === "Date"
          ? v[f.tenTruong]?.format("DD/MM/YYYY")
          : v[f.tenTruong];
    });

    setVbList([...vbList, {
      id: Date.now(),
      soVaoSo: newSo,
      soHieu: v.soHieu,
      maSV: v.maSV,
      hoTen: v.hoTen,
      ngaySinh: v.ngaySinh.format("DD/MM/YYYY"),
      nam: year,
      quyetDinhId: v.quyetDinhId,
      extra
    }]);

    formVB.resetFields();
    message.success("Thêm văn bằng thành công");
  };
  const handleSearch = (v: any) => {
    const filled = Object.values(v).filter(x => x);
    if (filled.length < 2) {
      message.error("Nhập ít nhất 2 điều kiện!");
      return;
    }
    const result = vbList.filter(item =>
      (!v.soHieu || item.soHieu.includes(v.soHieu)) &&
      (!v.soVaoSo || item.soVaoSo == v.soVaoSo) &&
      (!v.maSV || item.maSV.includes(v.maSV)) &&
      (!v.hoTen || item.hoTen.toLowerCase().includes(v.hoTen.toLowerCase())) &&
      (!v.ngaySinh || item.ngaySinh === v.ngaySinh.format("DD/MM/YYYY"))
    );
    const qdIds = new Set(result.map(r => r.quyetDinhId));
    setQdList(qdList.map(q =>
      qdIds.has(q.id) ? { ...q, luotTraCuu: q.luotTraCuu + 1 } : q
    ));

    setSearchResult(result);
  };
  const renderField = (f: FieldConfig) => {
    if (f.kieuDuLieu === "Number") return <Input type="number" />;
    if (f.kieuDuLieu === "Date") return <DatePicker style={{ width: "100%" }} />;
    return <Input />;
  };
  const columns: any = [
    { title: "Số vào sổ", dataIndex: "soVaoSo" },
    { title: "Số hiệu", dataIndex: "soHieu" },
    { title: "Mã SV", dataIndex: "maSV" },
    { title: "Họ tên", dataIndex: "hoTen" },
    {
      title: "QĐ",
      render: (_: any, r: VanBang) => {
        const qd = qdList.find(q => q.id === r.quyetDinhId);
        return <Tag color="blue">{qd?.soQD}</Tag>;
      }
    },
    {
      title: "Chi tiết",
      render: (_: any, r: VanBang) => (
        <Button type="link" onClick={() => setDetail(r)}>Xem</Button>
      )
    }
  ];

  fields.forEach(f => {
    columns.push({
      title: f.tenTruong,
      render: (_: any, r: VanBang) => r.extra[f.tenTruong]
    });
  });

  return (
    <div style={{ padding: 24, background: "#f5f7fa", minHeight: "100vh" }}>

      <h2 style={{ marginBottom: 20 }}>🎓 Hệ thống quản lý văn bằng</h2>

      <Row gutter={20}>
        <Col span={8}>
          <Card title="📄 Quyết định" bordered={false}>
            <Form form={formQD} layout="vertical" onFinish={handleAddQD}>
              <Form.Item name="soQD" label="Số QĐ"><Input /></Form.Item>
              <Form.Item name="ngayBanHanh" label="Ngày ban hành">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="trichYeu" label="Trích yếu"><Input /></Form.Item>
              <Form.Item name="nam" label="Năm">
                <Select>
                  {[2022,2023,2024,2025,2026].map(y=>(
                    <Select.Option key={y} value={y}>{y}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Button type="primary" block htmlType="submit">Thêm</Button>
            </Form>

            <Divider />

            <Table
              size="small"
              dataSource={qdList}
              rowKey="id"
              pagination={false}
              columns={[
                { title: "Số QĐ", dataIndex: "soQD" },
                { title: "Năm", dataIndex: "nam" },
                { title: "Lượt tra cứu", dataIndex: "luotTraCuu" }
              ]}
            />
          </Card>
        </Col>

        {/* FIELD */}
        <Col span={8}>
          <Card title="⚙️ Cấu hình field" bordered={false}>
            <Form form={formField} layout="vertical" onFinish={handleAddField}>
              <Form.Item name="tenTruong" label="Tên"><Input /></Form.Item>
              <Form.Item name="kieuDuLieu" label="Kiểu">
                <Select>
                  <Select.Option value="String">String</Select.Option>
                  <Select.Option value="Number">Number</Select.Option>
                  <Select.Option value="Date">Date</Select.Option>
                </Select>
              </Form.Item>
              <Button type="dashed" block htmlType="submit">Thêm field</Button>
            </Form>

            <Divider />

            <Table
              size="small"
              dataSource={fields}
              rowKey="id"
              pagination={false}
              columns={[
                { title: "Tên", dataIndex: "tenTruong" },
                { title: "Kiểu", dataIndex: "kieuDuLieu" },
                {
                  title: "Xóa",
                  render: (_: any, r: FieldConfig) => (
                    <Button danger size="small" onClick={() => handleDeleteField(r.id)}>X</Button>
                  )
                }
              ]}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="🎓 Thêm văn bằng" bordered={false}>
            <Form form={formVB} layout="vertical" onFinish={handleAddVB}>
              <Form.Item name="soHieu" label="Số hiệu"><Input /></Form.Item>
              <Form.Item name="maSV" label="Mã SV"><Input /></Form.Item>
              <Form.Item name="hoTen" label="Họ tên"><Input /></Form.Item>
              <Form.Item name="ngaySinh" label="Ngày sinh">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="nam" label="Năm">
                <Select>
                  {[2022,2023,2024,2025,2026].map(y=>(
                    <Select.Option key={y} value={y}>{y}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="quyetDinhId" label="Quyết định">
                <Select placeholder="Chọn QĐ">
                  {qdList.map(q=>(
                    <Select.Option key={q.id} value={q.id}>{q.soQD}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {fields.map(f => (
                <Form.Item key={f.id} name={f.tenTruong} label={f.tenTruong}>
                  {renderField(f)}
                </Form.Item>
              ))}

              <Button type="primary" block htmlType="submit">Thêm</Button>
            </Form>
          </Card>
        </Col>

      </Row>

      <Card title="🔍 Tra cứu văn bằng" style={{ marginTop: 25 }} bordered={false}>
        <Form form={formSearch} onFinish={handleSearch}>
          <Row gutter={16}>
            <Col span={6}><Form.Item name="soHieu"><Input placeholder="Số hiệu" /></Form.Item></Col>
            <Col span={6}><Form.Item name="soVaoSo"><Input placeholder="Số vào sổ" /></Form.Item></Col>
            <Col span={6}><Form.Item name="maSV"><Input placeholder="Mã SV" /></Form.Item></Col>
            <Col span={6}><Form.Item name="hoTen"><Input placeholder="Họ tên" /></Form.Item></Col>
            <Col span={6}><Form.Item name="ngaySinh"><DatePicker style={{ width: "100%" }} /></Form.Item></Col>
          </Row>
          <Button type="primary">Tra cứu</Button>
        </Form>

        <Table
          style={{ marginTop: 20 }}
          dataSource={searchResult}
          columns={columns}
          rowKey="id"
        />
      </Card>
      <Modal open={!!detail} onCancel={()=>setDetail(null)} footer={null}>
        {detail && (
          <>
            <h3>Chi tiết văn bằng</h3>
            <p><b>Họ tên:</b> {detail.hoTen}</p>
            <p><b>Số hiệu:</b> {detail.soHieu}</p>
            <p><b>Mã SV:</b> {detail.maSV}</p>
            <p><b>Ngày sinh:</b> {detail.ngaySinh}</p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default App;