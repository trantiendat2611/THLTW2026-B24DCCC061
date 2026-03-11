import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  Popconfirm,
  InputNumber,
  message,
} from "antd";

const { Title } = Typography;

//////////////////////////////
// KHỐI KIẾN THỨC
//////////////////////////////

interface KnowledgeBlock {
  id: number;
  name: string;
}

//////////////////////////////
// MÔN HỌC
//////////////////////////////

interface Subject {
  id: number;
  code: string;
  name: string;
  credit: number;
}

//////////////////////////////
// CÂU HỎI
//////////////////////////////

interface Question {
  id: number;
  code: string;
  subject: string;
  block: string;
  difficulty: string;
  content: string;
}

//////////////////////////////
// ĐỀ THI
//////////////////////////////

interface Exam {
  id: number;
  subject: string;
  easy: number;
  medium: number;
  hard: number;
  veryHard: number;
  questions: Question[];
}

const Bai2: React.FC = () => {
  /////////////////////////////
  // STATE KHỐI KIẾN THỨC
  /////////////////////////////

  const [blocks, setBlocks] = useState<KnowledgeBlock[]>([]);
  const [visibleBlock, setVisibleBlock] = useState(false);
  const [editingBlock, setEditingBlock] = useState<KnowledgeBlock | null>(null);
  const [formBlock] = Form.useForm();

  /////////////////////////////
  // STATE MÔN HỌC
  /////////////////////////////

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [visibleSubject, setVisibleSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formSubject] = Form.useForm();

  /////////////////////////////
  // STATE CÂU HỎI
  /////////////////////////////

  const [questions, setQuestions] = useState<Question[]>([]);
  const [visibleQuestion, setVisibleQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formQuestion] = Form.useForm();

  const [filterSubject, setFilterSubject] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterBlock, setFilterBlock] = useState("");

  /////////////////////////////
  // STATE ĐỀ THI
  /////////////////////////////

  const [exams, setExams] = useState<Exam[]>([]);
  const [visibleExam, setVisibleExam] = useState(false);
  const [formExam] = Form.useForm();

  ////////////////////////////////////////
  // KHỐI KIẾN THỨC
  ////////////////////////////////////////

  const openAddBlock = () => {
    setEditingBlock(null);
    formBlock.resetFields();
    setVisibleBlock(true);
  };

  const openEditBlock = (record: KnowledgeBlock) => {
    setEditingBlock(record);
    formBlock.setFieldsValue(record);
    setVisibleBlock(true);
  };

  const deleteBlock = (id: number) => {
    setBlocks(blocks.filter((item) => item.id !== id));
  };

  const submitBlock = async () => {
    const values = await formBlock.validateFields();

    if (editingBlock) {
      setBlocks(
        blocks.map((item) =>
          item.id === editingBlock.id ? { ...item, name: values.name } : item
        )
      );
    } else {
      setBlocks([...blocks, { id: Date.now(), name: values.name }]);
    }

    setVisibleBlock(false);
  };

  ////////////////////////////////////////
  // MÔN HỌC
  ////////////////////////////////////////

  const openAddSubject = () => {
    setEditingSubject(null);
    formSubject.resetFields();
    setVisibleSubject(true);
  };

  const openEditSubject = (record: Subject) => {
    setEditingSubject(record);
    formSubject.setFieldsValue(record);
    setVisibleSubject(true);
  };

  const deleteSubject = (id: number) => {
    setSubjects(subjects.filter((item) => item.id !== id));
  };

  const submitSubject = async () => {
    const values = await formSubject.validateFields();

    if (editingSubject) {
      setSubjects(
        subjects.map((item) =>
          item.id === editingSubject.id ? { ...item, ...values } : item
        )
      );
    } else {
      setSubjects([...subjects, { id: Date.now(), ...values }]);
    }

    setVisibleSubject(false);
  };

  ////////////////////////////////////////
  // CÂU HỎI
  ////////////////////////////////////////

  const openAddQuestion = () => {
    setEditingQuestion(null);
    formQuestion.resetFields();
    setVisibleQuestion(true);
  };

  const openEditQuestion = (record: Question) => {
    setEditingQuestion(record);
    formQuestion.setFieldsValue(record);
    setVisibleQuestion(true);
  };

  const deleteQuestion = (id: number) => {
    setQuestions(questions.filter((item) => item.id !== id));
  };

  const submitQuestion = async () => {
    const values = await formQuestion.validateFields();

    if (editingQuestion) {
      setQuestions(
        questions.map((item) =>
          item.id === editingQuestion.id ? { ...item, ...values } : item
        )
      );
    } else {
      setQuestions([...questions, { id: Date.now(), ...values }]);
    }

    setVisibleQuestion(false);
  };

  ////////////////////////////////////////
  // FILTER
  ////////////////////////////////////////

  const filteredQuestions = questions.filter((q) => {
    return (
      (!filterSubject || q.subject.includes(filterSubject)) &&
      (!filterDifficulty || q.difficulty.includes(filterDifficulty)) &&
      (!filterBlock || q.block.includes(filterBlock))
    );
  });

  ////////////////////////////////////////
  // TẠO ĐỀ THI
  ////////////////////////////////////////

  const createExam = async () => {
    const values = await formExam.validateFields();

    const subjectQuestions = questions.filter(
      (q) => q.subject === values.subject
    );

    const easy = subjectQuestions.filter((q) => q.difficulty === "Dễ");
    const medium = subjectQuestions.filter((q) => q.difficulty === "Trung bình");
    const hard = subjectQuestions.filter((q) => q.difficulty === "Khó");
    const veryHard = subjectQuestions.filter((q) => q.difficulty === "Rất khó");

    if (
      easy.length < values.easy ||
      medium.length < values.medium ||
      hard.length < values.hard ||
      veryHard.length < values.veryHard
    ) {
      message.error("Không đủ câu hỏi để tạo đề!");
      return;
    }

    const selectedQuestions = [
      ...easy.slice(0, values.easy),
      ...medium.slice(0, values.medium),
      ...hard.slice(0, values.hard),
      ...veryHard.slice(0, values.veryHard),
    ];

    const newExam: Exam = {
      id: Date.now(),
      subject: values.subject,
      easy: values.easy,
      medium: values.medium,
      hard: values.hard,
      veryHard: values.veryHard,
      questions: selectedQuestions,
    };

    setExams([...exams, newExam]);

    message.success("Tạo đề thi thành công");

    setVisibleExam(false);
  };

  ////////////////////////////////////////
  // COLUMNS
  ////////////////////////////////////////

  const blockColumns: any[] = [
    {
      title: "STT",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tên khối kiến thức",
      dataIndex: "name",
    },
    {
      title: "Hành động",
      render: (_: any, record: KnowledgeBlock) => (
        <Space>
          <Button type="link" onClick={() => openEditBlock(record)}>
            Sửa
          </Button>

          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => deleteBlock(record.id)}
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const subjectColumns: any[] = [
    { title: "Mã môn", dataIndex: "code" },
    { title: "Tên môn", dataIndex: "name" },
    { title: "Số tín chỉ", dataIndex: "credit" },
  ];

  const questionColumns: any[] = [
    { title: "Mã câu hỏi", dataIndex: "code" },
    { title: "Môn học", dataIndex: "subject" },
    { title: "Khối kiến thức", dataIndex: "block" },
    { title: "Mức độ", dataIndex: "difficulty" },
    { title: "Nội dung", dataIndex: "content" },
  ];

  const examColumns: any[] = [
    { title: "Môn học", dataIndex: "subject" },
    { title: "Dễ", dataIndex: "easy" },
    { title: "Trung bình", dataIndex: "medium" },
    { title: "Khó", dataIndex: "hard" },
    { title: "Rất khó", dataIndex: "veryHard" },
    {
      title: "Tổng câu",
      render: (_: any, record: Exam) => record.questions.length,
    },
  ];

  return (
    <div style={{ padding: 30 }}>
      <Title level={2}>Quản lý khối kiến thức</Title>

      <Button type="primary" onClick={openAddBlock} style={{ marginBottom: 20 }}>
        Thêm khối kiến thức
      </Button>

      <Table dataSource={blocks} columns={blockColumns} rowKey="id" bordered />

      <Title level={2} style={{ marginTop: 50 }}>
        Quản lý môn học
      </Title>

      <Button
        type="primary"
        onClick={openAddSubject}
        style={{ marginBottom: 20 }}
      >
        Thêm môn học
      </Button>

      <Table dataSource={subjects} columns={subjectColumns} rowKey="id" bordered />

      <Title level={2} style={{ marginTop: 50 }}>
        Quản lý câu hỏi
      </Title>

      <Space style={{ marginBottom: 20 }}>
        <Input
          placeholder="Tìm môn học"
          onChange={(e) => setFilterSubject(e.target.value)}
        />
        <Input
          placeholder="Mức độ khó"
          onChange={(e) => setFilterDifficulty(e.target.value)}
        />
        <Input
          placeholder="Khối kiến thức"
          onChange={(e) => setFilterBlock(e.target.value)}
        />

        <Button type="primary" onClick={openAddQuestion}>
          Thêm câu hỏi
        </Button>
      </Space>

      <Table
        dataSource={filteredQuestions}
        columns={questionColumns}
        rowKey="id"
        bordered
      />

      <Title level={2} style={{ marginTop: 50 }}>
        Quản lý đề thi
      </Title>

      <Button type="primary" onClick={() => setVisibleExam(true)}>
        Tạo đề thi
      </Button>

      <Table
        dataSource={exams}
        columns={examColumns}
        rowKey="id"
        bordered
        style={{ marginTop: 20 }}
      />

      {/* MODAL KHỐI KIẾN THỨC */}
      <Modal
        title="Thêm khối kiến thức"
        visible={visibleBlock}
        onOk={submitBlock}
        onCancel={() => setVisibleBlock(false)}
      >
        <Form form={formBlock} layout="vertical">
          <Form.Item
            label="Tên khối kiến thức"
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL MÔN HỌC */}
      <Modal
        title="Thêm môn học"
        visible={visibleSubject}
        onOk={submitSubject}
        onCancel={() => setVisibleSubject(false)}
      >
        <Form form={formSubject} layout="vertical">
          <Form.Item label="Mã môn" name="code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Tên môn" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Số tín chỉ" name="credit" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL CÂU HỎI */}
      <Modal
        title="Thêm câu hỏi"
        visible={visibleQuestion}
        onOk={submitQuestion}
        onCancel={() => setVisibleQuestion(false)}
      >
        <Form form={formQuestion} layout="vertical">
          <Form.Item label="Mã câu hỏi" name="code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Môn học" name="subject" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Khối kiến thức" name="block" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Mức độ khó" name="difficulty" rules={[{ required: true }]}>
            <Input placeholder="Dễ / Trung bình / Khó / Rất khó" />
          </Form.Item>

          <Form.Item label="Nội dung câu hỏi" name="content" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL TẠO ĐỀ */}
      <Modal
        title="Tạo đề thi"
        visible={visibleExam}
        onOk={createExam}
        onCancel={() => setVisibleExam(false)}
      >
        <Form form={formExam} layout="vertical">
          <Form.Item label="Môn học" name="subject" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Số câu dễ" name="easy" initialValue={0}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Số câu trung bình" name="medium" initialValue={0}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Số câu khó" name="hard" initialValue={0}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Số câu rất khó" name="veryHard" initialValue={0}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Bai2;