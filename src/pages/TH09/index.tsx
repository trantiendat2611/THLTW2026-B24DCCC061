import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Statistic, Button, Modal, Form, Input, Select, DatePicker, Table, Tag, Space, Row, Col, Typography, message } from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Header, Content, Sider } = Layout;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  tags: string[];
  status: 'Cần làm' | 'Đang làm' | 'Hoàn thành';
}

const statusList: Task['status'][] = ['Cần làm', 'Đang làm', 'Hoàn thành'];
const priorityColors = {
  Cao: 'red',
  'Trung bình': 'orange',
  Thấp: 'green',
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'kanban' | 'list'>('dashboard');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('th09_tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch {
      localStorage.removeItem('th09_tasks');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('th09_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    setEditingTask(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      deadline: moment(task.deadline),
      tags: task.tags.join(', '),
    });
    setIsModalVisible(true);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    message.success('Task đã được xóa');
  };

  const handleFormSubmit = (values: any) => {
    const newTask: Task = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      title: values.title,
      description: values.description || '',
      deadline: values.deadline.format('YYYY-MM-DD'),
      priority: values.priority,
      tags: values.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag),
      status: editingTask ? editingTask.status : 'Cần làm',
    };

    setTasks(prev => (editingTask ? prev.map(task => (task.id === editingTask.id ? newTask : task)) : [...prev, newTask]));
    message.success(editingTask ? 'Task đã được cập nhật' : 'Task mới đã được thêm');
    setIsModalVisible(false);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as Task['status'];
    setTasks(prev => prev.map(task => (task.id === taskId ? { ...task, status: newStatus } : task)));
  };

  const getTasksByStatus = (status: Task['status']) => tasks.filter(task => task.status === status);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Hoàn thành').length;
  const overdueTasks = tasks.filter(task => moment(task.deadline).isBefore(moment(), 'day') && task.status !== 'Hoàn thành').length;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { title: 'Tên', dataIndex: 'title', key: 'title', sorter: (a: Task, b: Task) => a.title.localeCompare(b.title) },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      sorter: (a: Task, b: Task) => moment(a.deadline).unix() - moment(b.deadline).unix(),
      render: (value: string) => moment(value).format('DD/MM/YYYY'),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      filters: [
        { text: 'Cao', value: 'Cao' },
        { text: 'Trung bình', value: 'Trung bình' },
        { text: 'Thấp', value: 'Thấp' },
      ],
      onFilter: (value: any, record: Task) => record.priority === value,
      render: (value: string) => <Tag color={priorityColors[value as keyof typeof priorityColors]}>{value}</Tag>,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => tags.map(tag => <Tag key={tag}>{tag}</Tag>),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: statusList.map(value => ({ text: value, value })),
      onFilter: (value: any, record: Task) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Task) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEditTask(record)}>
            <EditOutlined />
          </Button>
          <Button type="link" danger onClick={() => handleDeleteTask(record.id)}>
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const renderDashboard = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={12} lg={8}>
        <Card bordered={false} style={{ borderRadius: 12, minHeight: 140, background: '#fff' }}>
          <Statistic title="Tổng số task" value={totalTasks} />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <Card bordered={false} style={{ borderRadius: 12, minHeight: 140, background: '#fff' }}>
          <Statistic title="Task hoàn thành" value={completedTasks} />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <Card bordered={false} style={{ borderRadius: 12, minHeight: 140, background: '#fff' }}>
          <Statistic title="Task quá hạn" value={overdueTasks} />
        </Card>
      </Col>
    </Row>
  );

  const renderKanban = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {statusList.map(status => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  minHeight: 520,
                  padding: 20,
                  background: snapshot.isDraggingOver ? '#e6f7ff' : '#fafafa',
                  borderRadius: 12,
                  border: '1px solid #f0f0f0',
                }}
              >
                <Title level={5} style={{ marginBottom: 20 }}>{status}</Title>
                {getTasksByStatus(status).map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        size="small"
                        style={{
                          marginBottom: 16,
                          boxShadow: snapshot.isDragging ? '0 10px 24px rgba(0,0,0,0.12)' : undefined,
                          borderRadius: 10,
                        }}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Title level={5} style={{ margin: 0 }}>{task.title}</Title>
                          <Text type="secondary">{task.description || 'Không có mô tả'}</Text>
                          <Space wrap>
                            <Tag color={priorityColors[task.priority]}>{task.priority}</Tag>
                            <Tag>{moment(task.deadline).format('DD/MM/YYYY')}</Tag>
                          </Space>
                          <div>{task.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</div>
                        </Space>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );

  const renderList = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={14} md={10}>
          <Input
            placeholder="Tìm kiếm theo tên"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={10} md={6}>
          <Select
            placeholder="Lọc theo trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: '100%' }}
          >
            {statusList.map(status => (
              <Option key={status} value={status}>{status}</Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Table columns={columns} dataSource={filteredTasks} rowKey="id" pagination={{ pageSize: 8 }} />
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: '#fff' }}>
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>TH09</Title>
          <Text type="secondary">Theo dõi công việc</Text>
        </div>
        <Menu mode="inline" selectedKeys={[currentView]} onClick={({ key }) => setCurrentView(key as any)}>
          <Menu.Item key="dashboard">Dashboard</Menu.Item>
          <Menu.Item key="kanban">Kanban Board</Menu.Item>
          <Menu.Item key="list">Danh sách Task</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>Ứng dụng quản lý công việc</Title>
            <Text type="secondary">Dashboard, Kanban, danh sách và lưu localStorage</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTask}>
            Thêm Task
          </Button>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f5f7fa' }}>
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'kanban' && renderKanban()}
          {currentView === 'list' && renderList()}
        </Content>
      </Layout>

      <Modal
        title={editingTask ? 'Chỉnh sửa Task' : 'Thêm Task'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          <Form.Item name="title" label="Tên task" rules={[{ required: true, message: 'Vui lòng nhập tên task' }]}>
            <Input placeholder="Nhập tên công việc" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả ngắn gọn" />
          </Form.Item>
          <Form.Item name="deadline" label="Deadline" rules={[{ required: true, message: 'Vui lòng chọn deadline' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="priority" label="Mức độ ưu tiên" rules={[{ required: true, message: 'Vui lòng chọn ưu tiên' }]}>
            <Select placeholder="Chọn mức độ ưu tiên">
              <Option value="Cao">Cao</Option>
              <Option value="Trung bình">Trung bình</Option>
              <Option value="Thấp">Thấp</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tags" label="Tags" rules={[{ required: true, message: 'Vui lòng nhập tags' }]}>
            <Input placeholder="Nhập tags cách nhau bằng dấu phẩy" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingTask ? 'Cập nhật' : 'Thêm'} task
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default App;
