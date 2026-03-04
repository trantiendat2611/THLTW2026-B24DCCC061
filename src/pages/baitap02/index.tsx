import { Button, Card, Form, Input, List, Modal } from 'antd';
import { useEffect, useState } from 'react';

/* ===== TYPES ===== */
interface Subject {
  id: string;
  name: string;
}

interface Study {
  id: string;
  subjectId: string;
  time: string;
  duration: number;
  content: string;
  note?: string;
}

interface Goal {
  month: string;
  target: number;
}

/* ===== STORAGE ===== */
const LS = {
  subjects: 'subjects',
  studies: 'studies',
  goal: 'goal',
};

const load = (key: string, defaultValue: any) =>
  JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue));

const save = (key: string, data: any) =>
  localStorage.setItem(key, JSON.stringify(data));

export default function BaiTap02() {
  /* ===== STATE ===== */
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);

  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [editing, setEditing] = useState<any>(null);

  const [openSubject, setOpenSubject] = useState(false);
  const [openStudy, setOpenStudy] = useState(false);
  const [openGoal, setOpenGoal] = useState(false);

  const [subjectForm] = Form.useForm();
  const [studyForm] = Form.useForm();
  const [goalForm] = Form.useForm();

  /* ===== INIT ===== */
  useEffect(() => {
    const defaultSubjects = [
      { id: '1', name: 'Toán' },
      { id: '2', name: 'Văn' },
      { id: '3', name: 'Anh' },
      { id: '4', name: 'Khoa học' },
      { id: '5', name: 'Công nghệ' },
    ];
    setSubjects(load(LS.subjects, defaultSubjects));
    setStudies(load(LS.studies, []));
    setGoal(load(LS.goal, null));
  }, []);

  /* ===== SUBJECT CRUD ===== */
  const saveSubject = (values: any) => {
    const data = editing
      ? subjects.map(s => s.id === editing.id ? { ...s, ...values } : s)
      : [...subjects, { id: Date.now().toString(), ...values }];

    setSubjects(data);
    save(LS.subjects, data);
    setOpenSubject(false);
    setEditing(null);
    subjectForm.resetFields();
  };

  const removeSubject = (id: string) => {
    const s = subjects.filter(x => x.id !== id);
    const st = studies.filter(x => x.subjectId !== id);
    setSubjects(s);
    setStudies(st);
    save(LS.subjects, s);
    save(LS.studies, st);
    if (currentSubject?.id === id) setCurrentSubject(null);
  };

  /* ===== STUDY CRUD ===== */
  const saveStudy = (values: any) => {
    const data = editing
      ? studies.map(s => s.id === editing.id ? { ...s, ...values } : s)
      : [...studies, { id: Date.now().toString(), subjectId: currentSubject!.id, ...values }];

    setStudies(data);
    save(LS.studies, data);
    setOpenStudy(false);
    setEditing(null);
    studyForm.resetFields();
  };

  /* ===== GOAL ===== */
  const month = new Date().toISOString().slice(0, 7);
  const total = studies
    .filter(s => s.time.startsWith(month))
    .reduce((a, b) => a + Number(b.duration), 0);

  const saveGoal = (v: any) => {
    const g = { month: v.month, target: Number(v.target) };
    setGoal(g);
    save(LS.goal, g);
    setOpenGoal(false);
  };

  /* ===== UI ===== */
  return (
    <Card title="📘 Quản lý học tập" style={{ maxWidth: 900, margin: '24px auto' }}>
      {/* SUBJECT */}
      <Card title="Danh mục môn học" extra={<Button onClick={() => setOpenSubject(true)}>Thêm</Button>}>
        <List
          bordered
          dataSource={subjects}
          renderItem={s => (
            <List.Item
              onClick={() => setCurrentSubject(s)}
              style={{ cursor: 'pointer' }}
              actions={[
                <a onClick={(e) => {
                  e.stopPropagation();
                  setEditing(s);
                  subjectForm.setFieldsValue(s);
                  setOpenSubject(true);
                }}>Sửa</a>,
                <a onClick={(e) => {
                  e.stopPropagation();
                  removeSubject(s.id);
                }}>Xóa</a>,
              ]}
            >
              {s.name}
            </List.Item>
          )}
        />
      </Card>

      {/* STUDY */}
      {currentSubject && (
        <Card
          style={{ marginTop: 24 }}
          title={`📅 ${currentSubject.name}`}
          extra={<Button onClick={() => setOpenStudy(true)}>Thêm buổi học</Button>}
        >
          <List
            bordered
            dataSource={studies.filter(s => s.subjectId === currentSubject.id)}
            renderItem={s => (
              <List.Item
                actions={[
                  <a onClick={() => {
                    setEditing(s);
                    studyForm.setFieldsValue(s);
                    setOpenStudy(true);
                  }}>Sửa</a>,
                  <a onClick={() => {
                    const d = studies.filter(x => x.id !== s.id);
                    setStudies(d);
                    save(LS.studies, d);
                  }}>Xóa</a>,
                ]}
              >
                <div>
                  <b>{new Date(s.time).toLocaleString()}</b> – {s.duration} phút
                  <div>Nội dung: {s.content}</div>
                  {s.note && <div>Ghi chú: {s.note}</div>}
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* GOAL */}
      <Card
        style={{ marginTop: 24 }}
        title="🎯 Mục tiêu tháng"
        extra={<Button onClick={() => setOpenGoal(true)}>Thiết lập</Button>}
      >
        {goal ? (
          <>
            <p>Tháng: <b>{goal.month}</b></p>
            <p>Mục tiêu: <b>{goal.target} phút</b></p>
            <p>Đã học: <b>{total} phút</b></p>
            <b style={{ color: total >= goal.target ? 'green' : 'red' }}>
              {total >= goal.target ? '✅ Hoàn thành' : '❌ Chưa đạt'}
            </b>
          </>
        ) : (
          <p>Chưa có mục tiêu</p>
        )}
      </Card>

      {/* MODALS */}
      <Modal visible={openSubject} onOk={() => subjectForm.submit()} onCancel={() => setOpenSubject(false)}>
        <Form form={subjectForm} onFinish={saveSubject}>
          <Form.Item name="name" label="Tên môn" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal visible={openStudy} onOk={() => studyForm.submit()} onCancel={() => setOpenStudy(false)}>
        <Form form={studyForm} onFinish={saveStudy}>
          <Form.Item name="time" label="Thời gian" rules={[{ required: true }]}>
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal visible={openGoal} onOk={() => goalForm.submit()} onCancel={() => setOpenGoal(false)}>
        <Form form={goalForm} onFinish={saveGoal}>
          <Form.Item name="month" initialValue={month} label="Tháng">
            <Input type="month" />
          </Form.Item>
          <Form.Item name="target" label="Mục tiêu (phút)" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}