import React, { useState, useMemo } from 'react';
import { 
  Layout, Menu, Card, Row, Col, Select, Table, Button, 
  Form, Input, InputNumber, Tabs, Statistic, 
  Alert, Progress, Rate, Tag, Divider, Typography, Space, Tooltip, Upload 
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, DashboardOutlined, 
  CompassOutlined, CalendarOutlined, PieChartOutlined,
  EnvironmentOutlined, RocketOutlined, UploadOutlined
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const { Header, Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text } = Typography;

// --- DỮ LIỆU KHỞI TẠO ---
const initialDestinations = [
  { id: 1, name: 'Vịnh Hạ Long', type: 'biển', price: 2000000, rating: 5, img: 'https://picsum.photos/id/1015/400/300', food: 500000, stay: 1000000, transport: 500000, time: 2, desc: 'Kỳ quan thiên nhiên thế giới' },
  { id: 2, name: 'Đà Lạt', type: 'núi', price: 1500000, rating: 4.5, img: 'https://picsum.photos/id/1016/400/300', food: 400000, stay: 700000, transport: 400000, time: 3, desc: 'Thành phố ngàn hoa' },
  { id: 3, name: 'Hà Nội', type: 'thành phố', price: 1000000, rating: 4, img: 'https://picsum.photos/id/1033/400/300', food: 300000, stay: 500000, transport: 200000, time: 1, desc: 'Thủ đô nghìn năm văn hiến' },
];

const TravelApp = () => {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [budgetLimit, setBudgetLimit] = useState(5000000);
  const [currentTab, setCurrentTab] = useState('1');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [uploadedImage, setUploadedImage] = useState<string>('');

  // --- LOGIC TÍNH TOÁN ---
  const totalCost = useMemo(() => itinerary.reduce((sum, item) => sum + item.price, 0), [itinerary]);
  const totalDays = useMemo(() => itinerary.reduce((sum, item) => sum + item.time, 0), [itinerary]);
  
  const budgetBreakdown = useMemo(() => {
    return itinerary.reduce((acc, item) => {
      acc.food += item.food || 0;
      acc.stay += item.stay || 0;
      acc.transport += item.transport || 0;
      return acc;
    }, { food: 0, stay: 0, transport: 0 });
  }, [itinerary]);

  const filteredDestinations = useMemo(() => {
    let filtered = destinations.filter(d => filterType === 'all' || d.type === filterType);
    if (sortBy === 'price') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'rating') {
      filtered = filtered.sort((a, b) => b.rating - a.rating);
    } else {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [destinations, filterType, sortBy]);

  // --- HÀNH ĐỘNG ---
  const addToItinerary = (item: any) => setItinerary([...itinerary, { ...item, key: Date.now() }]);
  const removeFromItinerary = (key: any) => setItinerary(itinerary.filter(i => i.key !== key));

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(itinerary);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setItinerary(items);
  };

  const onFinishAdmin = (values: any) => {
    const newDest = { 
        ...values, 
        id: Date.now(), 
        img: uploadedImage || 'https://picsum.photos/400/300',
        rating: values.rating || 5
    };
    setDestinations([...destinations, newDest]);
    setUploadedImage('');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'fixed', zIndex: 10, width: '100%', display: 'flex', alignItems: 'center', padding: '0 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ color: 'white', fontWeight: 'bold', marginRight: 40, fontSize: 18 }}>TRAVEL.GO</div>
        <Menu theme="dark" mode="horizontal" selectedKeys={[currentTab]} onClick={(e) => setCurrentTab(e.key)} style={{ flex: 1 }}>
          <Menu.Item key="1" icon={<CompassOutlined />}>Khám phá</Menu.Item>
          <Menu.Item key="2" icon={<CalendarOutlined />}>Lịch trình</Menu.Item>
          <Menu.Item key="3" icon={<PieChartOutlined />}>Ngân sách</Menu.Item>
          <Menu.Item key="4" icon={<DashboardOutlined />}>Quản trị (Admin)</Menu.Item>
        </Menu>
      </Header>

      <Content style={{ marginTop: 80, padding: '0 20px', paddingBottom: 40, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, minHeight: '85vh', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginTop: 20 }}>
          
          {/* 1. TRANG CHỦ - KHÁM PHÁ (Sửa: Thêm Responsive chuẩn) */}
          {currentTab === '1' && (
            <>
              <Title level={4}>Khám phá điểm đến nổi bật</Title>
              <Space style={{ marginBottom: 20 }}>
                <Text strong>Lọc theo:</Text>
                <Select defaultValue="all" style={{ width: 150 }} onChange={setFilterType}>
                  <Option value="all">Tất cả</Option>
                  <Option value="biển">Vùng biển</Option>
                  <Option value="núi">Vùng núi</Option>
                  <Option value="thành phố">Thành phố</Option>
                </Select>
                <Text strong>Sắp xếp:</Text>
                <Select defaultValue="name" style={{ width: 150 }} onChange={setSortBy}>
                  <Option value="name">Tên A-Z</Option>
                  <Option value="price">Giá thấp-cao</Option>
                  <Option value="rating">Đánh giá cao-thấp</Option>
                </Select>
              </Space>
              
              <Row gutter={[20, 20]}>
                {filteredDestinations.map(item => (
                  <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                    <Card
                      hoverable
                      cover={<img alt={item.name} src={item.img} style={{ height: 180, objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />}
                      actions={[
                        <Button type="link" icon={<PlusOutlined />} onClick={() => addToItinerary(item)} style={{ color: '#667eea' }}>Lên lịch</Button>
                      ]}
                      style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    >
                      <Card.Meta 
                        title={item.name} 
                        description={<div><EnvironmentOutlined /> {item.type}</div>} 
                      />
                      <div style={{ marginTop: 12 }}>
                        <Rate disabled defaultValue={item.rating} style={{ fontSize: 12 }} />
                        <div style={{ fontWeight: 'bold', color: '#f5222d', fontSize: 17, marginTop: 5 }}>
                          {(item.price || 0).toLocaleString()} đ
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}

          {/* 2. TẠO LỊCH TRÌNH (Sửa: Thêm tính toán thời gian di chuyển) */}
          {currentTab === '2' && (
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Title level={4}>Lịch trình du lịch của bạn</Title>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="itinerary">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {itinerary.map((item, index) => (
                          <Draggable key={item.key} draggableId={item.key.toString()} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ marginBottom: 10, ...provided.draggableProps.style }}>
                                <Card size="small" style={{ cursor: 'grab' }}>
                                  <Row align="middle" gutter={16}>
                                    <Col><Text strong>{index + 1}. {item.name}</Text></Col>
                                    <Col><Tag color="blue">{item.time} ngày</Tag></Col>
                                    <Col><Text>{(item.price || 0).toLocaleString()} đ</Text></Col>
                                    <Col><Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromItinerary(item.key)} /></Col>
                                  </Row>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Tóm tắt hành trình" bordered={false} className="summary-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <Statistic title={<span style={{ color: 'white' }}>Tổng ngân sách dự kiến</span>} value={totalCost} suffix="VNĐ" valueStyle={{ color: 'white' }} />
                  <Statistic title={<span style={{ color: 'white' }}>Tổng thời gian</span>} value={totalDays} suffix="Ngày" style={{ marginTop: 20 }} valueStyle={{ color: 'white' }} />
                  <Divider style={{ borderColor: 'rgba(255,255,255,0.3)' }} />
                  <Text style={{ color: 'white' }}>Gợi ý: Thời gian di chuyển trung bình giữa các điểm là 4-6 tiếng.</Text>
                  <br />
                  <Text style={{ color: 'white' }}>Thời gian di chuyển ước tính: {(itinerary.length - 1) * 5} giờ</Text>
                </Card>
              </Col>
            </Row>
          )}

          {/* 3. QUẢN LÝ NGÂN SÁCH (Sửa: Alert rõ ràng và Progress chi tiết) */}
          {currentTab === '3' && (
            <Row gutter={[24, 24]}>
              <Col xs={24} md={14}>
                <Title level={4}>Biểu đồ phân bổ ngân sách</Title>
                <div style={{ padding: '20px', border: '1px solid #f0f0f0', borderRadius: 8, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                  <div style={{ marginBottom: 20 }}>
                    <Text>Ăn uống: {budgetBreakdown.food.toLocaleString()} đ</Text>
                    <Progress percent={Math.round((budgetBreakdown.food / (totalCost || 1)) * 100)} status="active" strokeColor="#ff7875" />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <Text>Lưu trú: {budgetBreakdown.stay.toLocaleString()} đ</Text>
                    <Progress percent={Math.round((budgetBreakdown.stay / (totalCost || 1)) * 100)} strokeColor="#52c41a" />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <Text>Di chuyển: {budgetBreakdown.transport.toLocaleString()} đ</Text>
                    <Progress percent={Math.round((budgetBreakdown.transport / (totalCost || 1)) * 100)} strokeColor="#1890ff" />
                  </div>
                </div>
              </Col>
              <Col xs={24} md={10}>
                <Card title="Cảnh báo ngân sách" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <Text>Hạn mức tối đa (đ):</Text>
                  <InputNumber 
                    style={{ width: '100%', margin: '10px 0 20px' }} 
                    value={budgetLimit} 
                    onChange={(v) => setBudgetLimit(v || 0)}
                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Progress 
                        type="dashboard" 
                        percent={Math.round((totalCost / budgetLimit) * 100)} 
                        strokeColor={totalCost > budgetLimit ? '#ff4d4f' : '#3f8600'}
                    />
                  </div>
                  {totalCost > budgetLimit && (
                    <Alert 
                      message="Cảnh báo: Bạn đã vượt quá ngân sách cho phép!" 
                      description={`Vượt ${ (totalCost - budgetLimit).toLocaleString() } đ`}
                      type="error" 
                      showIcon 
                      action={<Button size="small" danger onClick={() => setItinerary([])}>Xóa hết</Button>}
                    />
                  )}
                </Card>
              </Col>
            </Row>
          )}

          {/* 4. ADMIN (Sửa: Đầy đủ Form fields và Thống kê theo bảng) */}
          {currentTab === '4' && (
            <Tabs defaultActiveKey="admin-1" type="card">
              <TabPane tab={<span><PlusOutlined />Quản lý điểm đến</span>} key="admin-1">
                <div style={{ marginBottom: 30, padding: 20, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: 8 }}>
                  <Title level={5}>Thêm điểm đến mới</Title>
                  <Form layout="vertical" onFinish={onFinishAdmin}>
                    <Row gutter={16}>
                      <Col xs={24} md={6}><Form.Item name="name" label="Tên địa danh" rules={[{required: true}]}><Input /></Form.Item></Col>
                      <Col xs={24} md={6}><Form.Item name="type" label="Loại hình"><Select>
                        <Option value="biển">Biển</Option><Option value="núi">Núi</Option><Option value="thành phố">Thành phố</Option>
                      </Select></Form.Item></Col>
                      <Col xs={24} md={6}><Form.Item name="price" label="Tổng mức chi (đ)"><InputNumber style={{width: '100%'}} /></Form.Item></Col>
                      <Col xs={24} md={6}><Form.Item name="time" label="Thời gian (ngày)"><InputNumber style={{width: '100%'}} /></Form.Item></Col>
                    </Row>
                    <Row gutter={16}>
                      <Col xs={8} md={4}><Form.Item name="food" label="Chi ăn uống"><InputNumber style={{width: '100%'}} /></Form.Item></Col>
                      <Col xs={8} md={4}><Form.Item name="stay" label="Chi lưu trú"><InputNumber style={{width: '100%'}} /></Form.Item></Col>
                      <Col xs={8} md={4}><Form.Item name="transport" label="Chi đi lại"><InputNumber style={{width: '100%'}} /></Form.Item></Col>
                      <Col xs={24} md={6}><Form.Item name="desc" label="Mô tả"><Input.TextArea rows={2} /></Form.Item></Col>
                      <Col xs={24} md={6}>
                        <Form.Item label="Hình ảnh">
                          <Upload
                            listType="picture-card"
                            maxCount={1}
                            beforeUpload={(file) => {
                              const reader = new FileReader();
                              reader.onload = (e) => setUploadedImage(e.target?.result as string);
                              reader.readAsDataURL(file);
                              return false;
                            }}
                          >
                            <div>
                              <UploadOutlined />
                              <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}><Form.Item><Button type="primary" htmlType="submit" block icon={<RocketOutlined />}>Lưu hệ thống</Button></Form.Item></Col>
                    </Row>
                  </Form>
                </div>
                
                <Table 
                  dataSource={destinations} 
                  rowKey="id" 
                  scroll={{ x: 800 }}
                  columns={[
                    { title: 'Hình', dataIndex: 'img', render: (src) => <img src={src} width={50} style={{borderRadius: 4}} /> },
                    { title: 'Tên', dataIndex: 'name', strong: true },
                    { title: 'Ăn uống', dataIndex: 'food', render: (v) => v?.toLocaleString() },
                    { title: 'Lưu trú', dataIndex: 'stay', render: (v) => v?.toLocaleString() },
                    { title: 'Di chuyển', dataIndex: 'transport', render: (v) => v?.toLocaleString() },
                    { title: 'Rating', dataIndex: 'rating', render: (v) => <Rate disabled defaultValue={v} style={{fontSize: 10}} /> },
                    { title: 'Thao tác', render: (_, r) => <Button danger size="small" onClick={() => setDestinations(destinations.filter(d => d.id !== r.id))}>Xóa</Button> }
                  ]} 
                />
              </TabPane>
              
              <TabPane tab={<span><PieChartOutlined />Thống kê doanh thu</span>} key="admin-2">
                <Row gutter={16} style={{ marginBottom: 20 }}>
                  <Col xs={12} md={6}><Card><Statistic title="Số lịch trình" value={itinerary.length} prefix={<CalendarOutlined />} /></Card></Col>
                  <Col xs={12} md={6}><Card><Statistic title="Lượt xem" value={destinations.length * 100} precision={0} /></Card></Col>
                  <Col xs={12} md={6}><Card><Statistic title="Doanh thu dự tính" value={totalCost} suffix="đ" /></Card></Col>
                  <Col xs={12} md={6}><Card><Statistic title="Địa điểm HOT" value={destinations[0]?.name || 'N/A'} valueStyle={{fontSize: 14, color: '#cf1322'}} /></Card></Col>
                </Row>
                <div style={{ padding: '20px', border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 20, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                  <Title level={5}>Thống kê chi phí theo hạng mục</Title>
                  <div style={{ marginBottom: 20 }}>
                    <Text>Ăn uống: {budgetBreakdown.food.toLocaleString()} đ</Text>
                    <Progress percent={Math.round((budgetBreakdown.food / (totalCost || 1)) * 100)} strokeColor="#ff7875" />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <Text>Lưu trú: {budgetBreakdown.stay.toLocaleString()} đ</Text>
                    <Progress percent={Math.round((budgetBreakdown.stay / (totalCost || 1)) * 100)} strokeColor="#52c41a" />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <Text>Di chuyển: {budgetBreakdown.transport.toLocaleString()} đ</Text>
                    <Progress percent={Math.round((budgetBreakdown.transport / (totalCost || 1)) * 100)} strokeColor="#1890ff" />
                  </div>
                </div>
                <Alert message="Dữ liệu thống kê được cập nhật theo thời gian thực từ các lịch trình người dùng đã tạo." type="info" showIcon />
              </TabPane>
            </Tabs>
          )}

        </div>
      </Content>
      <footer style={{ textAlign: 'center', padding: '20px', color: '#888', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        PTIT - Thực hành 06 - Lập kế hoạch du lịch ©2026
      </footer>
    </Layout>
  );
};

export default TravelApp;