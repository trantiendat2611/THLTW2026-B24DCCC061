import { Button, Card, Form, Input, List, Modal } from 'antd';
import { useEffect, useState } from 'react';

/* ================== INTERFACE ================== */
interface Subject {
  id: string;
  name: string;
}

interface StudySession {
  id: string;
  subjectId: string;
  time: string;      // yyyy-mm-ddThh:mm
  duration: number;  // phút
  content: string;
  note?: string;
}

interface MonthlyGoal {
  month: string; // yyyy-mm
  targetMinutes: number;
}

/* ================== STORAGE KEY ================== */
const SUBJECT_KEY = 'subjects';
const STUDY_KEY = 'study_sessions';
const GOAL_KEY = 'monthly_goal';

export default function BaiTap02() {
  /* ================== STATE ================== */
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goal, setGoal] = useState<MonthlyGoal | null>(null);

  const [openSubjectModal, setOpenSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [openStudyModal, setOpenStudyModal] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  const [openGoalModal, setOpenGoalModal] = useState(false);

  const [subjectForm] = Form.useForm();
  const [studyForm] = Form.useForm();
  const [goalForm] = Form.useForm();

  /* ================== LOAD LOCALSTORAGE ================== */
  useEffect(() => {
    const subjectData = localStorage.getItem(SUBJECT_KEY);
    const studyData = localStorage.getItem(STUDY_KEY);
    const goalData = localStorage.getItem(GOAL_KEY);

    if (subjectData) {
      setSubjects(JSON.parse(subjectData));
    } else {
      const defaultSubjects: Subject[] = [
        { id: '1', name: 'Toán' },
        { id: '2', name: 'Văn' },
        { id: '3', name: 'Anh' },
        { id: '4', name: 'Khoa học' },
        { id: '5', name: 'Công nghệ' },
      ];
      setSubjects(defaultSubjects);
      localStorage.setItem(SUBJECT_KEY, JSON.stringify(defaultSubjects));
    }

    if (studyData) {
      setSessions(JSON.parse(studyData));
    }

    if (goalData) {
      setGoal(JSON.parse(goalData));
    }
  }, []);

  /* ================== SAVE ================== */
  const saveSubjects = (data: Subject[]) => {
    setSubjects(data);
    localStorage.setItem(SUBJECT_KEY, JSON.stringify(data));
  };

  const saveSessions = (data: StudySession[]) => {
    setSessions(data);
    localStorage.setItem(STUDY_KEY, JSON.stringify(data));
  };

  const saveGoal = (data: MonthlyGoal) => {
    setGoal(data);
    localStorage.setItem(GOAL_KEY, JSON.stringify(data));
  };

  /* ================== SUBJECT CRUD ================== */
  const submitSubject = () => {
    subjectForm.validateFields().then((values) => {
      let data = [...subjects];

      if (editingSubject) {
        data = data.map((s) =>
          s.id === editingSubject.id ? { ...s, name: values.name } : s,
        );
      } else {
        data.push({
          id: Date.now().toString(),
          name: values.name,
        });
      }

      saveSubjects(data);
      setOpenSubjectModal(false);
      setEditingSubject(null);
      subjectForm.resetFields();
    });
  };

  const removeSubject = (id: string) => {
    saveSubjects(subjects.filter((s) => s.id !== id));
    saveSessions(sessions.filter((ss) => ss.subjectId !== id));
    if (selectedSubject?.id === id) setSelectedSubject(null);
  };

  /* ================== STUDY CRUD ================== */
  const submitStudy = () => {
    studyForm.validateFields().then((values) => {
      let data = [...sessions];

      if (editingSession) {
        data = data.map((s) =>
          s.id === editingSession.id ? { ...s, ...values } : s,
        );
      } else {
        data.push({
          id: Date.now().toString(),
          subjectId: selectedSubject!.id,
          ...values,
        });
      }

      saveSessions(data);
      setOpenStudyModal(false);
      setEditingSession(null);
      studyForm.resetFields();
    });
  };

  /* ================== GOAL ================== */
  const currentMonth = new Date().toISOString().slice(0, 7);

  const totalMinutesThisMonth = sessions
    .filter((s) => s.time.startsWith(currentMonth))
    .reduce((sum, s) => sum + Number(s.duration), 0);

  const submitGoal = () => {
    goalForm.validateFields().then((values) => {
      saveGoal({
        month: values.month,
        targetMinutes: Number(values.targetMinutes),
      });
      setOpenGoalModal(false);
      goalForm.resetFields();
    });
  };

  /* ================== RENDER ================== */
  return (
    <Card title="📘 Quản lý học tập" style={{ maxWidth: 900, margin: '24px auto' }}>
      {/* ===== SUBJECT ===== */}
      <Card
        title="Danh mục môn học"
        extra={<Button onClick={() => setOpenSubjectModal(true)}>Thêm môn</Button>}
      >
        <List
          bordered
          dataSource={subjects}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedSubject(item)}
              actions={[
                <a
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSubject(item);
                    subjectForm.setFieldsValue(item);
                    setOpenSubjectModal(true);
                  }}
                >
                  Sửa
                </a>,
                <a
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSubject(item.id);
                  }}
                >
                  Xóa
                </a>,
              ]}
            >
              {item.name}
            </List.Item>
          )}
        />
      </Card>

      {/* ===== STUDY SESSION ===== */}
      {selectedSubject && (
        <Card
          title={`📅 Tiến độ học: ${selectedSubject.name}`}
          style={{ marginTop: 24 }}
          extra={
            <Button type="primary" onClick={() => setOpenStudyModal(true)}>
              Thêm buổi học
            </Button>
          }
        >
          <List
            bordered
            dataSource={sessions.filter(
              (s) => s.subjectId === selectedSubject.id,
            )}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <a
                    onClick={() => {
                      setEditingSession(item);
                      studyForm.setFieldsValue(item);
                      setOpenStudyModal(true);
                    }}
                  >
                    Sửa
                  </a>,
                  <a
                    onClick={() =>
                      saveSessions(sessions.filter((s) => s.id !== item.id))
                    }
                  >
                    Xóa
                  </a>,
                ]}
              >
                <div>
                  <b>{new Date(item.time).toLocaleString()}</b> – {item.duration} phút
                  <div>Nội dung: {item.content}</div>
                  {item.note && <div>Ghi chú: {item.note}</div>}
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* ===== MONTHLY GOAL ===== */}
      <Card
        title="🎯 Mục tiêu học tập hàng tháng"
        style={{ marginTop: 24 }}
        extra={<Button onClick={() => setOpenGoalModal(true)}>Thiết lập</Button>}
      >
        {goal ? (
          <>
            <p>📅 Tháng: <b>{goal.month}</b></p>
            <p>🎯 Mục tiêu: <b>{goal.targetMinutes} phút</b></p>
            <p>⏱ Đã học: <b>{totalMinutesThisMonth} phút</b></p>
            <p>
              Trạng thái:{' '}
              {totalMinutesThisMonth >= goal.targetMinutes ? (
                <span style={{ color: 'green', fontWeight: 'bold' }}>
                  ✅ Hoàn thành
                </span>
              ) : (
                <span style={{ color: 'red', fontWeight: 'bold' }}>
                  ❌ Chưa đạt
                </span>
              )}
            </p>
          </>
        ) : (
          <p>Chưa thiết lập mục tiêu</p>
        )}
      </Card>

      {/* ===== MODALS ===== */}
      <Modal
        title={editingSubject ? 'Sửa môn học' : 'Thêm môn học'}
        visible={openSubjectModal}
        onOk={submitSubject}
        onCancel={() => {
          setOpenSubjectModal(false);
          setEditingSubject(null);
          subjectForm.resetFields();
        }}
      >
        <Form form={subjectForm} layout="vertical">
          <Form.Item name="name" label="Tên môn học" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingSession ? 'Sửa buổi học' : 'Thêm buổi học'}
        visible={openStudyModal}
        onOk={submitStudy}
        onCancel={() => {
          setOpenStudyModal(false);
          setEditingSession(null);
          studyForm.resetFields();
        }}
      >
        <Form form={studyForm} layout="vertical">
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
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thiết lập mục tiêu học tập"
        visible={openGoalModal}
        onOk={submitGoal}
        onCancel={() => {
          setOpenGoalModal(false);
          goalForm.resetFields();
        }}
      >
        <Form form={goalForm} layout="vertical">
          <Form.Item name="month" label="Tháng" initialValue={currentMonth} rules={[{ required: true }]}>
            <Input type="month" />
          </Form.Item>
          <Form.Item name="targetMinutes" label="Mục tiêu (phút)" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}