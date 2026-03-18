import React, { useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  List,
  Modal,
  Select,
  TimePicker,
  DatePicker,
  Tag
} from "antd";
import moment from "moment";

const { Option } = Select;

/* ===== TYPES ===== */
interface Employee {
  id: string;
  name: string;
  maxPerDay: number;
  workTime: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Appointment {
  id: string;
  employeeId: string;
  serviceId: string;
  date: string;
  time: string;
  status: string;
}

interface Review {
  id: string;
  appointmentId: string;
  employeeId: string;
  rating: number;
  comment: string;
  reply?: string;
}

/* ===== APP ===== */
export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<"employee" | "service" | "appointment">("employee");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [reviewModal, setReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();
  // CHECK MAX KHÁCH / NGÀY
const isOverLimit = (employeeId: string, date: string) => {
  const employee = employees.find(e => e.id === employeeId);
  if (!employee) return false;

  const count = appointments.filter(
    a => a.employeeId === employeeId && a.date === date
  ).length;

  return count >= employee.maxPerDay;
};

  /* ===== CHECK TRÙNG ===== */
  const isDuplicate = (employeeId: string, date: string, time: string) => {
    return appointments.some(
      (a) =>
        a.employeeId === employeeId &&
        a.date === date &&
        a.time === time &&
        a.id !== editingId
    );
  };

  /* ===== ADD + UPDATE ===== */
  const handleAdd = () => {
    form.validateFields().then((values) => {
      const formattedTime = values.time?.format("HH:mm");
      const formattedDate = values.date?.format("YYYY-MM-DD");

      if (type === "appointment") {
  if (!formattedTime || !formattedDate) return;

  if (isDuplicate(values.employeeId, formattedDate, formattedTime)) {
    alert("Trùng lịch!");
    return;
  }

  if (isOverLimit(values.employeeId, formattedDate)) {
    alert("Nhân viên đã đủ khách trong ngày!");
    return;
  }
}

      if (editingId) {
        if (type === "employee") {
          setEmployees(employees.map(e => e.id === editingId ? { ...e, ...values } : e));
        }
        if (type === "service") {
          setServices(services.map(s => s.id === editingId ? { ...s, ...values } : s));
        }
        if (type === "appointment") {
          setAppointments(
            appointments.map(a =>
              a.id === editingId
                ? { ...a, ...values, time: formattedTime, date: formattedDate }
                : a
            )
          );
        }
        setEditingId(null);
      } else {
        const id = Date.now().toString();

        if (type === "employee") setEmployees([...employees, { id, ...values }]);
        if (type === "service") setServices([...services, { id, ...values }]);
        if (type === "appointment") {
          setAppointments([
            ...appointments,
            { id, ...values, time: formattedTime, date: formattedDate, status: "pending" }
          ]);
        }
      }

      form.resetFields();
      setVisible(false);
    });
  };

  /* ===== EDIT ===== */
  const handleEdit = (item: any, type: any) => {
    setType(type);
    setEditingId(item.id);
    setVisible(true);

    if (type === "appointment") {
      form.setFieldsValue({
        ...item,
        date: moment(item.date),
        time: moment(item.time, "HH:mm")
      });
    } else {
      form.setFieldsValue(item);
    }
  };

  /* ===== DELETE ===== */
  const handleDelete = (id: string, type: string) => {
    if (type === "employee") setEmployees(employees.filter(e => e.id !== id));
    if (type === "service") setServices(services.filter(s => s.id !== id));
    if (type === "appointment") setAppointments(appointments.filter(a => a.id !== id));
  };

  /* ===== STATUS ===== */
  const changeStatus = (id: string, status: string) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };

  /* ===== REVIEW ===== */
  const openReview = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    reviewForm.resetFields();
    setReviewModal(true);
  };

  const submitReview = () => {
    reviewForm.validateFields().then((values) => {
      if (!selectedAppointment) return;

      setReviews([
        ...reviews,
        {
          id: Date.now().toString(),
          appointmentId: selectedAppointment.id,
          employeeId: selectedAppointment.employeeId,
          rating: values.rating,
          comment: values.comment
        }
      ]);

      setReviewModal(false);
    });
  };

  const replyReview = (id: string, reply: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, reply } : r));
  };

  const getAvgRating = (employeeId: string) => {
    const list = reviews.filter(r => r.employeeId === employeeId);
    if (!list.length) return "Chưa có";
    return (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1);
  };

  /* ===== STATS ===== */
  const statsByDate = () => {
    const result: any = {};
    appointments.forEach(a => {
      result[a.date] = (result[a.date] || 0) + 1;
    });
    return result;
  };

  const revenueByService = () => {
    const result: any = {};
    appointments.filter(a => a.status === "done").forEach(a => {
      const service = services.find(s => s.id === a.serviceId);
      if (!service) return;
      result[service.name] = (result[service.name] || 0) + service.price;
    });
    return result;
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý lịch hẹn</h2>

      <Button onClick={() => { setType("employee"); setVisible(true); }}>Thêm nhân viên</Button>
      <Button onClick={() => { setType("service"); setVisible(true); }} style={{ marginLeft: 10 }}>Thêm dịch vụ</Button>
      <Button onClick={() => { setType("appointment"); setVisible(true); }} style={{ marginLeft: 10 }}>Đặt lịch</Button>

      {/* EMPLOYEE */}
      <Card title="Nhân viên" style={{ marginTop: 20 }}>
        <List
          dataSource={employees}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button onClick={() => handleEdit(item, "employee")}>Sửa</Button>,
                <Button danger onClick={() => handleDelete(item.id, "employee")}>Xóa</Button>
              ]}
            >
              {item.name} - {item.maxPerDay} khách/ngày - {item.workTime}
              <br />⭐ {getAvgRating(item.id)}
            </List.Item>
          )}
        />
      </Card>

      {/* SERVICE */}
      <Card title="Dịch vụ" style={{ marginTop: 20 }}>
        <List
          dataSource={services}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button onClick={() => handleEdit(item, "service")}>Sửa</Button>,
                <Button danger onClick={() => handleDelete(item.id, "service")}>Xóa</Button>
              ]}
            >
              {item.name} - {item.price}đ - {item.duration} phút
            </List.Item>
          )}
        />
      </Card>

      {/* APPOINTMENT */}
      <Card title="Lịch hẹn" style={{ marginTop: 20 }}>
        <List
          dataSource={appointments}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Select value={item.status} style={{ width: 120 }} onChange={(v) => changeStatus(item.id, v)}>
                  <Option value="pending">Chờ duyệt</Option>
                  <Option value="confirmed">Xác nhận</Option>
                  <Option value="done">Hoàn thành</Option>
                  <Option value="cancel">Hủy</Option>
                </Select>,
                <Button onClick={() => handleEdit(item, "appointment")}>Sửa</Button>,
                <Button danger onClick={() => handleDelete(item.id, "appointment")}>Xóa</Button>,
                item.status === "done" && !reviews.find(r => r.appointmentId === item.id) && (
                  <Button onClick={() => openReview(item)}>Đánh giá</Button>
                )
              ]}
            >
              {item.date} {item.time} | <Tag>{item.status}</Tag>
            </List.Item>
          )}
        />
      </Card>

      {/* REVIEW */}
      <Card title="Đánh giá" style={{ marginTop: 20 }}>
        <List
          dataSource={reviews}
          renderItem={(item) => (
            <List.Item>
              ⭐ {item.rating} - {item.comment}
              <div>
                {item.reply ? (
                  <Tag color="blue">{item.reply}</Tag>
                ) : (
                  <Button onClick={() => {
                    const r = prompt("Nhập phản hồi");
                    if (r) replyReview(item.id, r);
                  }}>Phản hồi</Button>
                )}
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* STATS */}
      <Card title="Thống kê" style={{ marginTop: 20 }}>
        <h4>Số lịch theo ngày</h4>
        {Object.entries(statsByDate()).map(([date, count]) => (
          <div key={date}>{date}: {count} lịch</div>
        ))}

        <h4>Doanh thu</h4>
        {Object.entries(revenueByService()).map(([name, money]) => (
          <div key={name}>{name}: {money}đ</div>
        ))}
      </Card>

      {/* MODAL */}
      <Modal visible={visible} onCancel={() => setVisible(false)} onOk={handleAdd}>
        <Form form={form} layout="vertical">
          {type === "employee" && (
            <>
              <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="maxPerDay" label="Số khách/ngày"><Input /></Form.Item>
              <Form.Item name="workTime" label="Giờ làm"><Input /></Form.Item>
            </>
          )}

          {type === "service" && (
            <>
              <Form.Item name="name" label="Tên"><Input /></Form.Item>
              <Form.Item name="price" label="Giá"><Input /></Form.Item>
              <Form.Item name="duration" label="Thời gian (phút)"><Input /></Form.Item>
            </>
          )}

          {type === "appointment" && (
            <>
              <Form.Item name="employeeId" label="Nhân viên">
                <Select>{employees.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}</Select>
              </Form.Item>
              <Form.Item name="serviceId" label="Dịch vụ">
                <Select>{services.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select>
              </Form.Item>
              <Form.Item name="date"><DatePicker /></Form.Item>
              <Form.Item name="time"><TimePicker /></Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* REVIEW MODAL */}
      <Modal visible={reviewModal} onCancel={() => setReviewModal(false)} onOk={submitReview}>
        <Form form={reviewForm}>
          <Form.Item name="rating" label="Số sao" rules={[{ required: true }]}>
            <Select>
              <Option value={1}>1</Option>
              <Option value={2}>2</Option>
              <Option value={3}>3</Option>
              <Option value={4}>4</Option>
              <Option value={5}>5</Option>
            </Select>
          </Form.Item>
          <Form.Item name="comment" label="Nhận xét" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}