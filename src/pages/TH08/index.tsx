import React, { useEffect, useMemo, useState } from 'react';
import {
  Layout,
  Card,
  Statistic,
  Button,
  Modal,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Table,
  Tag,
  Space,
  Row,
  Col,
  Typography,
  message,
  Timeline,
  Progress,
  Segmented,
  Popconfirm,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  type: 'Cardio' | 'Strength' | 'Yoga' | 'HIIT' | 'Other';
  duration: number;
  calories: number;
  notes: string;
  status: 'Hoàn thành' | 'Bỏ lỡ';
}

interface HealthRecord {
  id: string;
  date: string;
  weight: number;
  height: number;
  restingHeartRate: number;
  sleepHours: number;
}

interface Goal {
  id: string;
  title: string;
  type: 'Giảm cân' | 'Tăng cơ' | 'Cải thiện sức bền' | 'Khác';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: 'Đang thực hiện' | 'Đã đạt' | 'Đã hủy';
}

interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  description: string;
  caloriesPerHour: number;
}

const initialWorkouts: WorkoutSession[] = [
  {
    id: 'w1',
    date: moment().subtract(1, 'days').format('YYYY-MM-DD'),
    name: 'Chạy bộ',
    type: 'Cardio',
    duration: 40,
    calories: 350,
    notes: 'Tập ngoài trời',
    status: 'Hoàn thành',
  },
  {
    id: 'w2',
    date: moment().subtract(2, 'days').format('YYYY-MM-DD'),
    name: 'Tập ngực',
    type: 'Strength',
    duration: 55,
    calories: 420,
    notes: 'Bench press + dumbbell fly',
    status: 'Hoàn thành',
  },
  {
    id: 'w3',
    date: moment().subtract(3, 'days').format('YYYY-MM-DD'),
    name: 'Yoga thư giãn',
    type: 'Yoga',
    duration: 45,
    calories: 190,
    notes: 'Tập thở và kéo giãn',
    status: 'Hoàn thành',
  },
  {
    id: 'w4',
    date: moment().subtract(5, 'days').format('YYYY-MM-DD'),
    name: 'HIIT toàn thân',
    type: 'HIIT',
    duration: 30,
    calories: 320,
    notes: '6 hiệp',
    status: 'Hoàn thành',
  },
  {
    id: 'w5',
    date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    name: 'Tập chân',
    type: 'Strength',
    duration: 50,
    calories: 400,
    notes: 'Squat + lunges',
    status: 'Bỏ lỡ',
  },
];

const initialHealthRecords: HealthRecord[] = [
  {
    id: 'h1',
    date: moment().subtract(14, 'days').format('YYYY-MM-DD'),
    weight: 70,
    height: 172,
    restingHeartRate: 64,
    sleepHours: 7,
  },
  {
    id: 'h2',
    date: moment().subtract(10, 'days').format('YYYY-MM-DD'),
    weight: 69.4,
    height: 172,
    restingHeartRate: 63,
    sleepHours: 7.5,
  },
  {
    id: 'h3',
    date: moment().subtract(6, 'days').format('YYYY-MM-DD'),
    weight: 68.9,
    height: 172,
    restingHeartRate: 62,
    sleepHours: 7,
  },
  {
    id: 'h4',
    date: moment().subtract(2, 'days').format('YYYY-MM-DD'),
    weight: 68.6,
    height: 172,
    restingHeartRate: 61,
    sleepHours: 8,
  },
];

const initialGoals: Goal[] = [
  {
    id: 'g1',
    title: 'Giảm 3kg trong 1 tháng',
    type: 'Giảm cân',
    targetValue: 3,
    currentValue: 1.5,
    unit: 'kg',
    deadline: moment().add(10, 'days').format('YYYY-MM-DD'),
    status: 'Đang thực hiện',
  },
  {
    id: 'g2',
    title: 'Nâng tạ 100kg',
    type: 'Tăng cơ',
    targetValue: 100,
    currentValue: 80,
    unit: 'kg',
    deadline: moment().add(20, 'days').format('YYYY-MM-DD'),
    status: 'Đang thực hiện',
  },
  {
    id: 'g3',
    title: 'Tăng sức bền chạy 5km',
    type: 'Cải thiện sức bền',
    targetValue: 5,
    currentValue: 3.8,
    unit: 'km',
    deadline: moment().add(14, 'days').format('YYYY-MM-DD'),
    status: 'Đang thực hiện',
  },
];

const initialExercises: ExerciseItem[] = [
  {
    id: 'e1',
    name: 'Push-up',
    muscleGroup: 'Chest',
    difficulty: 'Dễ',
    description: 'Bài tập đẩy ngực cơ bản, không cần dụng cụ.',
    caloriesPerHour: 450,
  },
  {
    id: 'e2',
    name: 'Squat',
    muscleGroup: 'Legs',
    difficulty: 'Trung bình',
    description: 'Tập chân, mông và core bằng squat với trọng lượng cơ thể hoặc tạ.',
    caloriesPerHour: 500,
  },
  {
    id: 'e3',
    name: 'Plank',
    muscleGroup: 'Core',
    difficulty: 'Trung bình',
    description: 'Giữ thân thẳng, tăng sức mạnh cơ lõi.',
    caloriesPerHour: 210,
  },
  {
    id: 'e4',
    name: 'Burpee',
    muscleGroup: 'Full Body',
    difficulty: 'Khó',
    description: 'Bài tập cardio toàn thân với bật nhảy và chống đẩy.',
    caloriesPerHour: 700,
  },
  {
    id: 'e5',
    name: 'Dumbbell Row',
    muscleGroup: 'Back',
    difficulty: 'Trung bình',
    description: 'Kéo tạ đơn tập lưng và bắp tay sau.',
    caloriesPerHour: 440,
  },
];

const getBMI = (weight: number, height: number) => {
  const heightMeter = height / 100;
  return parseFloat((weight / (heightMeter * heightMeter)).toFixed(1));
};

const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) {
    return { label: 'Thiếu cân', color: 'geekblue' };
  }
  if (bmi < 25) {
    return { label: 'Bình thường', color: 'green' };
  }
  if (bmi < 30) {
    return { label: 'Thừa cân', color: 'gold' };
  }
  return { label: 'Béo phì', color: 'red' };
};

const workoutTypes = ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Other'] as const;
const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'] as const;
const difficultyLevels = ['Dễ', 'Trung bình', 'Khó'] as const;

const TH08: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workout' | 'health' | 'goals' | 'library'>('dashboard');
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(initialWorkouts);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(initialHealthRecords);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [exercises, setExercises] = useState<ExerciseItem[]>(initialExercises);

  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutSession | null>(null);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [editingHealth, setEditingHealth] = useState<HealthRecord | null>(null);
  const [goalDrawerOpen, setGoalDrawerOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseItem | null>(null);
  const [exerciseDetail, setExerciseDetail] = useState<ExerciseItem | null>(null);

  const [workoutSearch, setWorkoutSearch] = useState('');
  const [workoutTypeFilter, setWorkoutTypeFilter] = useState<string | undefined>(undefined);
  const [workoutDateRange, setWorkoutDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [goalsStatusFilter, setGoalsStatusFilter] = useState<string | undefined>('Đang thực hiện');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exerciseGroupFilter, setExerciseGroupFilter] = useState<string | undefined>(undefined);
  const [exerciseDifficultyFilter, setExerciseDifficultyFilter] = useState<string | undefined>(undefined);

  const [workoutForm] = Form.useForm();
  const [healthForm] = Form.useForm();
  const [goalForm] = Form.useForm();
  const [exerciseForm] = Form.useForm();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('th08_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        setWorkouts(parsed.workouts || initialWorkouts);
        setHealthRecords(parsed.healthRecords || initialHealthRecords);
        setGoals(parsed.goals || initialGoals);
        setExercises(parsed.exercises || initialExercises);
      }
    } catch {
      localStorage.removeItem('th08_state');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'th08_state',
      JSON.stringify({ workouts, healthRecords, goals, exercises }),
    );
  }, [workouts, healthRecords, goals, exercises]);

  const monthWorkouts = useMemo(
    () => workouts.filter(item => moment(item.date).isSame(moment(), 'month')),
    [workouts],
  );

  const totalWorkoutsMonth = monthWorkouts.length;
  const totalCaloriesMonth = monthWorkouts.reduce((sum, item) => sum + item.calories, 0);

  const streak = useMemo(() => {
    const dates = new Set(workouts.map(item => moment(item.date).format('YYYY-MM-DD')));
    let count = 0;
    let day = moment();
    while (dates.has(day.format('YYYY-MM-DD'))) {
      count += 1;
      day = day.subtract(1, 'day');
    }
    return count;
  }, [workouts]);

  const completionPercent = useMemo(() => {
    if (!goals.length) return 0;
    const total = goals.reduce((sum, goal) => {
      const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
      return sum + progress;
    }, 0);
    return Math.round(total / goals.length);
  }, [goals]);

  const weeklyWorkoutData = useMemo(() => {
    const weeks = [
      { week: 'Tuần 1', count: 0 },
      { week: 'Tuần 2', count: 0 },
      { week: 'Tuần 3', count: 0 },
      { week: 'Tuần 4', count: 0 },
      { week: 'Tuần 5', count: 0 },
    ];
    monthWorkouts.forEach(item => {
      const day = moment(item.date).date();
      const index = Math.min(4, Math.floor((day - 1) / 7));
      weeks[index].count += 1;
    });
    return weeks;
  }, [monthWorkouts]);

  const weightChartData = useMemo(
    () => healthRecords
      .slice()
      .sort((a, b) => moment(a.date).diff(moment(b.date)))
      .map(record => ({ date: moment(record.date).format('DD/MM'), weight: record.weight })),
    [healthRecords],
  );

  const recentWorkouts = useMemo(
    () => workouts
      .slice()
      .sort((a, b) => moment(b.date).diff(moment(a.date)))
      .slice(0, 5),
    [workouts],
  );

  const workoutDataFiltered = useMemo(() => {
    return workouts.filter(item => {
      const matchesName = item.name.toLowerCase().includes(workoutSearch.toLowerCase());
      const matchesType = !workoutTypeFilter || item.type === workoutTypeFilter;
      const matchesRange = workoutDateRange
        ? moment(item.date).isBetween(workoutDateRange[0], workoutDateRange[1], 'day', '[]')
        : true;
      return matchesName && matchesType && matchesRange;
    });
  }, [workouts, workoutSearch, workoutTypeFilter, workoutDateRange]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(item => {
      const matchesName = item.name.toLowerCase().includes(exerciseSearch.toLowerCase());
      const matchesGroup = !exerciseGroupFilter || item.muscleGroup === exerciseGroupFilter;
      const matchesDiff = !exerciseDifficultyFilter || item.difficulty === exerciseDifficultyFilter;
      return matchesName && matchesGroup && matchesDiff;
    });
  }, [exercises, exerciseSearch, exerciseGroupFilter, exerciseDifficultyFilter]);

  const healthColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: HealthRecord, b: HealthRecord) => moment(a.date).unix() - moment(b.date).unix(),
      render: (value: string) => moment(value).format('DD/MM/YYYY'),
    },
    { title: 'Cân nặng (kg)', dataIndex: 'weight', key: 'weight' },
    { title: 'Chiều cao (cm)', dataIndex: 'height', key: 'height' },
    {
      title: 'BMI',
      key: 'bmi',
      render: (_: any, record: HealthRecord) => {
        const bmi = getBMI(record.weight, record.height);
        const category = getBMICategory(bmi);
        return (
          <Space>
            <Text>{bmi}</Text>
            <Tag color={category.color}>{category.label}</Tag>
          </Space>
        );
      },
    },
    { title: 'Nhịp tim (bpm)', dataIndex: 'restingHeartRate', key: 'restingHeartRate' },
    { title: 'Giờ ngủ', dataIndex: 'sleepHours', key: 'sleepHours' },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: HealthRecord) => (
        <Space>
          <Button type="link" onClick={() => openEditHealth(record)}>
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa bản ghi này?"
            onConfirm={() => handleDeleteHealth(record.id)}
          >
            <Button type="link" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const workoutColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: WorkoutSession, b: WorkoutSession) => moment(a.date).unix() - moment(b.date).unix(),
      render: (value: string) => moment(value).format('DD/MM/YYYY'),
    },
    { title: 'Tên bài tập', dataIndex: 'name', key: 'name' },
    { title: 'Loại bài tập', dataIndex: 'type', key: 'type' },
    { title: 'Thời lượng (phút)', dataIndex: 'duration', key: 'duration' },
    { title: 'Calo đốt', dataIndex: 'calories', key: 'calories' },
    { title: 'Ghi chú', dataIndex: 'notes', key: 'notes', ellipsis: true },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => (
        <Tag color={value === 'Hoàn thành' ? 'green' : 'volcano'}>{value}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: WorkoutSession) => (
        <Space>
          <Button type="link" onClick={() => openEditWorkout(record)}>
            <EditOutlined />
          </Button>
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDeleteWorkout(record.id)}>
            <Button type="link" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const goalGrid = goals.filter(goal => !goalsStatusFilter || goal.status === goalsStatusFilter);

  const openEditWorkout = (workout: WorkoutSession) => {
    setEditingWorkout(workout);
    workoutForm.setFieldsValue({
      ...workout,
      date: moment(workout.date),
    });
    setWorkoutModalOpen(true);
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(item => item.id !== id));
    message.success('Đã xóa buổi tập');
  };

  const openEditHealth = (record: HealthRecord) => {
    setEditingHealth(record);
    healthForm.setFieldsValue({
      ...record,
      date: moment(record.date),
    });
    setHealthModalOpen(true);
  };

  const handleDeleteHealth = (id: string) => {
    setHealthRecords(prev => prev.filter(item => item.id !== id));
    message.success('Đã xóa chỉ số');
  };

  const openEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    goalForm.setFieldsValue({
      ...goal,
      deadline: moment(goal.deadline),
    });
    setGoalDrawerOpen(true);
  };

  const handleGoalDelete = (id: string) => {
    setGoals(prev => prev.filter(item => item.id !== id));
    message.success('Đã xóa mục tiêu');
  };

  const openExerciseDetail = (item: ExerciseItem) => {
    setExerciseDetail(item);
  };

  const openEditExercise = (item: ExerciseItem) => {
    setEditingExercise(item);
    exerciseForm.setFieldsValue(item);
    setExerciseModalOpen(true);
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(prev => prev.filter(item => item.id !== id));
    message.success('Đã xóa bài tập');
  };

  const handleWorkoutSubmit = (values: any) => {
    const newWorkout: WorkoutSession = {
      id: editingWorkout ? editingWorkout.id : Date.now().toString(),
      date: values.date.format('YYYY-MM-DD'),
      name: values.name,
      type: values.type,
      duration: values.duration,
      calories: values.calories,
      notes: values.notes || '',
      status: values.status,
    };
    setWorkouts(prev =>
      editingWorkout ? prev.map(item => (item.id === editingWorkout.id ? newWorkout : item)) : [newWorkout, ...prev],
    );
    setWorkoutModalOpen(false);
    setEditingWorkout(null);
    workoutForm.resetFields();
    message.success(editingWorkout ? 'Đã cập nhật buổi tập' : 'Đã thêm buổi tập');
  };

  const handleHealthSubmit = (values: any) => {
    const newRecord: HealthRecord = {
      id: editingHealth ? editingHealth.id : Date.now().toString(),
      date: values.date.format('YYYY-MM-DD'),
      weight: values.weight,
      height: values.height,
      restingHeartRate: values.restingHeartRate,
      sleepHours: values.sleepHours,
    };
    setHealthRecords(prev =>
      editingHealth ? prev.map(item => (item.id === editingHealth.id ? newRecord : item)) : [newRecord, ...prev],
    );
    setHealthModalOpen(false);
    setEditingHealth(null);
    healthForm.resetFields();
    message.success(editingHealth ? 'Đã cập nhật chỉ số' : 'Đã thêm chỉ số');
  };

  const handleGoalSubmit = (values: any) => {
    const newGoal: Goal = {
      id: editingGoal ? editingGoal.id : Date.now().toString(),
      title: values.title,
      type: values.type,
      targetValue: values.targetValue,
      currentValue: values.currentValue,
      unit: values.unit,
      deadline: values.deadline.format('YYYY-MM-DD'),
      status: values.status,
    };
    setGoals(prev => (editingGoal ? prev.map(item => (item.id === editingGoal.id ? newGoal : item)) : [newGoal, ...prev]));
    setGoalDrawerOpen(false);
    setEditingGoal(null);
    goalForm.resetFields();
    message.success(editingGoal ? 'Đã cập nhật mục tiêu' : 'Đã thêm mục tiêu');
  };

  const handleExerciseSubmit = (values: any) => {
    const newExercise: ExerciseItem = {
      id: editingExercise ? editingExercise.id : Date.now().toString(),
      name: values.name,
      muscleGroup: values.muscleGroup,
      difficulty: values.difficulty,
      description: values.description,
      caloriesPerHour: values.caloriesPerHour,
    };
    setExercises(prev =>
      editingExercise ? prev.map(item => (item.id === editingExercise.id ? newExercise : item)) : [newExercise, ...prev],
    );
    setExerciseModalOpen(false);
    setEditingExercise(null);
    exerciseForm.resetFields();
    message.success(editingExercise ? 'Đã cập nhật bài tập' : 'Đã thêm bài tập');
  };

  const renderDashboard = () => (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Tổng buổi tập tháng" value={totalWorkoutsMonth} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Tổng calo đã đốt" value={totalCaloriesMonth} suffix="kcal" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Ngày tập liên tiếp" value={streak} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Mục tiêu hoàn thành" value={`${completionPercent}%`} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Buổi tập theo tuần" bordered={false} style={{ borderRadius: 12 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {weeklyWorkoutData.map(item => (
                <Row key={item.week} justify="space-between" style={{ padding: '8px 0' }}>
                  <Col>{item.week}</Col>
                  <Col>{item.count} buổi</Col>
                </Row>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Cân nặng theo thời gian" bordered={false} style={{ borderRadius: 12 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {weightChartData.map(item => (
                <Row key={item.date} justify="space-between" style={{ padding: '8px 0' }}>
                  <Col>{item.date}</Col>
                  <Col>{item.weight} kg</Col>
                </Row>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
      <Card title="5 buổi tập gần nhất" style={{ marginTop: 16, borderRadius: 12 }} bordered={false}>
        <Timeline>
          {recentWorkouts.map(session => (
            <Timeline.Item key={session.id} color={session.status === 'Hoàn thành' ? 'green' : 'red'}>
              <Space direction="vertical">
                <Text strong>{session.name}</Text>
                <Text type="secondary">{moment(session.date).format('DD/MM/YYYY')} • {session.type} • {session.duration} phút • {session.calories} kcal</Text>
              </Space>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </>
  );

  const renderWorkoutSection = () => (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Tìm theo tên bài tập"
            prefix={<SearchOutlined />}
            value={workoutSearch}
            onChange={e => setWorkoutSearch(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            placeholder="Lọc theo loại"
            value={workoutTypeFilter}
            onChange={setWorkoutTypeFilter}
            allowClear
            style={{ width: '100%' }}
          >
            {workoutTypes.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={8} style={{ display: 'flex', gap: 8 }}>
          <RangePicker
            style={{ width: '100%' }}
            value={workoutDateRange as any}
            onChange={dates => setWorkoutDateRange(dates as any)}
          />
        </Col>
      </Row>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingWorkout(null); workoutForm.resetFields(); setWorkoutModalOpen(true); }}>
            Thêm buổi tập
          </Button>
        </Col>
      </Row>
      <Table columns={workoutColumns} dataSource={workoutDataFiltered} rowKey="id" pagination={{ pageSize: 8 }} />
    </>
  );

  const renderHealthSection = () => (
    <>
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingHealth(null); healthForm.resetFields(); setHealthModalOpen(true); }}>
          Thêm chỉ số
        </Button>
      </Row>
      <Table columns={healthColumns} dataSource={healthRecords} rowKey="id" pagination={{ pageSize: 8 }} />
    </>
  );

  const renderGoalsSection = () => (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Segmented
            options={['Đang thực hiện', 'Đã đạt', 'Đã hủy']}
            value={goalsStatusFilter}
            onChange={value => setGoalsStatusFilter(value as any)}
          />
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingGoal(null); goalForm.resetFields(); setGoalDrawerOpen(true); }}>
            Thêm mục tiêu
          </Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        {goalGrid.map(goal => {
          const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
          return (
            <Col xs={24} sm={12} lg={8} key={goal.id}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Title level={5} style={{ margin: 0 }}>{goal.title}</Title>
                    <Tag>{goal.type}</Tag>
                  </Space>
                  <Text>Giá trị mục tiêu: {goal.targetValue} {goal.unit}</Text>
                  <Space>
                    <Text>Hiện tại:</Text>
                    <InputNumber
                      min={0}
                      value={goal.currentValue}
                      onChange={value => {
                        if (typeof value === 'number') {
                          setGoals(prev => prev.map(item => item.id === goal.id ? { ...item, currentValue: value } : item));
                        }
                      }}
                    />
                    <Text>{goal.unit}</Text>
                  </Space>
                  <Progress percent={percent} status={goal.status === 'Đã hủy' ? 'exception' : percent === 100 ? 'success' : 'active'} />
                  <Text>Deadline: {moment(goal.deadline).format('DD/MM/YYYY')}</Text>
                  <Text>Trạng thái: <Tag color={goal.status === 'Đã đạt' ? 'green' : goal.status === 'Đã hủy' ? 'volcano' : 'blue'}>{goal.status}</Tag></Text>
                  <Space>
                    <Button type="link" onClick={() => openEditGoal(goal)}><EditOutlined /> Sửa</Button>
                    <Popconfirm title="Xác nhận xóa mục tiêu?" onConfirm={() => handleGoalDelete(goal.id)}>
                      <Button type="link" danger><DeleteOutlined /> Xóa</Button>
                    </Popconfirm>
                  </Space>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );

  const renderLibrarySection = () => (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Tìm theo tên bài tập"
            prefix={<SearchOutlined />}
            value={exerciseSearch}
            onChange={e => setExerciseSearch(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select placeholder="Lọc nhóm cơ" allowClear style={{ width: '100%' }} value={exerciseGroupFilter} onChange={setExerciseGroupFilter}>
            {muscleGroups.map(group => (
              <Option key={group} value={group}>{group}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select placeholder="Lọc độ khó" allowClear style={{ width: '100%' }} value={exerciseDifficultyFilter} onChange={setExerciseDifficultyFilter}>
            {difficultyLevels.map(level => (
              <Option key={level} value={level}>{level}</Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingExercise(null); exerciseForm.resetFields(); setExerciseModalOpen(true); }}>
          Thêm bài tập
        </Button>
      </Row>
      <Row gutter={[16, 16]}>
        {filteredExercises.map(item => (
          <Col xs={24} sm={12} lg={8} key={item.id}>
            <Card
              title={item.name}
              hoverable
              style={{ borderRadius: 12 }}
              actions={[
                <Button type="link" key="detail" onClick={() => openExerciseDetail(item)}><InfoCircleOutlined /> Chi tiết</Button>,
                <Button type="link" key="edit" onClick={() => openEditExercise(item)}><EditOutlined /> Sửa</Button>,
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Tag>{item.muscleGroup}</Tag>
                  <Tag color={item.difficulty === 'Khó' ? 'volcano' : item.difficulty === 'Trung bình' ? 'gold' : 'green'}>{item.difficulty}</Tag>
                </Space>
                <Text>{item.description}</Text>
                <Text strong>{item.caloriesPerHour} kcal/giờ</Text>
                <Popconfirm title="Xác nhận xóa bài tập?" onConfirm={() => handleDeleteExercise(item.id)}>
                  <Button type="link" danger>Xóa</Button>
                </Popconfirm>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>TH08 - Ứng dụng thể dục & sức khỏe</Title>
            <Text type="secondary">Dashboard, nhật ký tập luyện, chỉ số sức khỏe, mục tiêu và thư viện bài tập</Text>
          </Col>
          <Col>
            <Space>
              <Button type={activeTab === 'dashboard' ? 'primary' : 'default'} onClick={() => setActiveTab('dashboard')}>Dashboard</Button>
              <Button type={activeTab === 'workout' ? 'primary' : 'default'} onClick={() => setActiveTab('workout')}>Nhật ký tập luyện</Button>
              <Button type={activeTab === 'health' ? 'primary' : 'default'} onClick={() => setActiveTab('health')}>Chỉ số sức khỏe</Button>
              <Button type={activeTab === 'goals' ? 'primary' : 'default'} onClick={() => setActiveTab('goals')}>Mục tiêu</Button>
              <Button type={activeTab === 'library' ? 'primary' : 'default'} onClick={() => setActiveTab('library')}>Thư viện</Button>
            </Space>
          </Col>
        </Row>
      </Header>
      <Content style={{ margin: '24px', padding: '24px', background: '#f5f7fa' }}>
        <Card bordered={false} style={{ borderRadius: 12, minHeight: 640 }}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'workout' && renderWorkoutSection()}
          {activeTab === 'health' && renderHealthSection()}
          {activeTab === 'goals' && renderGoalsSection()}
          {activeTab === 'library' && renderLibrarySection()}
        </Card>
      </Content>

      <Modal
        title={editingWorkout ? 'Chỉnh sửa buổi tập' : 'Thêm buổi tập'}
        visible={workoutModalOpen}
        onCancel={() => { setWorkoutModalOpen(false); setEditingWorkout(null); workoutForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={workoutForm} layout="vertical" onFinish={handleWorkoutSubmit} initialValues={{ status: 'Hoàn thành', type: 'Cardio' }}>
          <Form.Item name="date" label="Ngày tập" rules={[{ required: true, message: 'Vui lòng chọn ngày tập' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="name" label="Tên bài tập" rules={[{ required: true, message: 'Vui lòng nhập tên bài tập' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Loại bài tập" rules={[{ required: true, message: 'Vui lòng chọn loại' }]}>
            <Select>
              {workoutTypes.map(type => <Option key={type} value={type}>{type}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="calories" label="Calo đốt" rules={[{ required: true, message: 'Vui lòng nhập calo' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select>
              <Option value="Hoàn thành">Hoàn thành</Option>
              <Option value="Bỏ lỡ">Bỏ lỡ</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>{editingWorkout ? 'Cập nhật' : 'Thêm'} buổi tập</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingHealth ? 'Chỉnh sửa chỉ số' : 'Thêm chỉ số sức khỏe'}
        visible={healthModalOpen}
        onCancel={() => { setHealthModalOpen(false); setEditingHealth(null); healthForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={healthForm} layout="vertical" onFinish={handleHealthSubmit} initialValues={{ weight: 0, height: 0, restingHeartRate: 60, sleepHours: 7 }}>
          <Form.Item name="date" label="Ngày" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="weight" label="Cân nặng (kg)" rules={[{ required: true, message: 'Vui lòng nhập cân nặng' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="height" label="Chiều cao (cm)" rules={[{ required: true, message: 'Vui lòng nhập chiều cao' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="restingHeartRate" label="Nhịp tim lúc nghỉ (bpm)" rules={[{ required: true, message: 'Vui lòng nhập nhịp tim' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="sleepHours" label="Giờ ngủ" rules={[{ required: true, message: 'Vui lòng nhập giờ ngủ' }]}>
            <InputNumber style={{ width: '100%' }} min={0} max={24} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>{editingHealth ? 'Cập nhật' : 'Thêm'} chỉ số</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={editingGoal ? 'Chỉnh sửa mục tiêu' : 'Thêm mục tiêu'}
        placement="right"
        width={420}
        onClose={() => { setGoalDrawerOpen(false); setEditingGoal(null); goalForm.resetFields(); }}
        visible={goalDrawerOpen}
        destroyOnClose
      >
        <Form form={goalForm} layout="vertical" onFinish={handleGoalSubmit} initialValues={{ type: 'Giảm cân', status: 'Đang thực hiện', unit: 'kg', currentValue: 0 }}>
          <Form.Item name="title" label="Tên mục tiêu" rules={[{ required: true, message: 'Vui lòng nhập tên mục tiêu' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Loại" rules={[{ required: true, message: 'Vui lòng chọn loại' }]}>
            <Select>
              <Option value="Giảm cân">Giảm cân</Option>
              <Option value="Tăng cơ">Tăng cơ</Option>
              <Option value="Cải thiện sức bền">Cải thiện sức bền</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item name="targetValue" label="Giá trị mục tiêu" rules={[{ required: true, message: 'Vui lòng nhập giá trị mục tiêu' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="currentValue" label="Giá trị hiện tại" rules={[{ required: true, message: 'Vui lòng nhập giá trị hiện tại' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="unit" label="Đơn vị" rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="deadline" label="Deadline" rules={[{ required: true, message: 'Vui lòng chọn deadline' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select>
              <Option value="Đang thực hiện">Đang thực hiện</Option>
              <Option value="Đã đạt">Đã đạt</Option>
              <Option value="Đã hủy">Đã hủy</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>{editingGoal ? 'Cập nhật' : 'Thêm'} mục tiêu</Button>
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title={editingExercise ? 'Chỉnh sửa bài tập' : exerciseDetail ? exerciseDetail.name : 'Chi tiết bài tập'}
        visible={exerciseModalOpen || !!exerciseDetail}
        onCancel={() => {
          setExerciseModalOpen(false);
          setEditingExercise(null);
          setExerciseDetail(null);
          exerciseForm.resetFields();
        }}
        footer={exerciseModalOpen ? null : undefined}
        destroyOnClose
      >
        {exerciseModalOpen ? (
          <Form form={exerciseForm} layout="vertical" onFinish={handleExerciseSubmit} initialValues={{ difficulty: 'Dễ' }}>
            <Form.Item name="name" label="Tên bài tập" rules={[{ required: true, message: 'Vui lòng nhập tên bài tập' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="muscleGroup" label="Nhóm cơ" rules={[{ required: true, message: 'Vui lòng chọn nhóm cơ' }]}>
              <Select>
                {muscleGroups.map(group => <Option key={group} value={group}>{group}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="difficulty" label="Độ khó" rules={[{ required: true, message: 'Vui lòng chọn độ khó' }]}>
              <Select>
                {difficultyLevels.map(level => <Option key={level} value={level}>{level}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item name="caloriesPerHour" label="Calo đốt trung bình/giờ" rules={[{ required: true, message: 'Vui lòng nhập calo' }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>{editingExercise ? 'Cập nhật' : 'Thêm'} bài tập</Button>
            </Form.Item>
          </Form>
        ) : exerciseDetail ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Nhóm cơ: {exerciseDetail.muscleGroup}</Text>
            <Text strong>Độ khó: {exerciseDetail.difficulty}</Text>
            <Text>{exerciseDetail.description}</Text>
            <Text strong>Calo: {exerciseDetail.caloriesPerHour} kcal/giờ</Text>
          </Space>
        ) : null}
      </Modal>
    </Layout>
  );
};

export default TH08;
