import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { Title, Text } = Typography;

const customers = [
  { id: 1, name: 'Trần Văn Chiến' },
  { id: 2, name: 'Trần Văn Chất Chất' },
  { id: 3, name: 'Lê Văn C' },
  { id: 4, name: 'Phạm Thị D' },
];

const products = [
  { id: 1, name: 'Áo thun', price: 120000 },
  { id: 2, name: 'Quần jeans', price: 250000 },
  { id: 3, name: 'Giày thể thao', price: 450000 },
  { id: 4, name: 'Mũ lưỡi trai', price: 90000 },
  { id: 5, name: 'Ba lô', price: 280000 },
];

const orderStatuses = ['Chờ xác nhận', 'Đang giao', 'Hoàn thành', 'Hủy'] as const;

type OrderStatus = (typeof orderStatuses)[number];

type OrderProduct = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: number;
  code: string;
  customerId: number;
  customer: string;
  orderDate: string;
  status: OrderStatus;
  products: OrderProduct[];
  total: number;
};

const initialOrders: Order[] = [
  {
    id: 1,
    code: 'DH001',
    customerId: 1,
    customer: 'Trần Văn Chiến ',
    orderDate: '2026-04-10',
    status: 'Chờ xác nhận',
    products: [
      { id: 1, name: 'Áo thun', price: 120000, quantity: 2 },
      { id: 4, name: 'Mũ lưỡi trai', price: 90000, quantity: 1 },
    ],
    total: 330000,
  },
  {
    id: 2,
    code: 'DH002',
    customerId: 2,
    customer: 'Trần Văn Chất Chất',
    orderDate: '2026-04-12',
    status: 'Đang giao',
    products: [
      { id: 2, name: 'Quần jeans', price: 250000, quantity: 1 },
      { id: 5, name: 'Ba lô', price: 280000, quantity: 1 },
    ],
    total: 530000,
  },
];

const statusColors: Record<OrderStatus, string> = {
  'Chờ xác nhận': 'orange',
  'Đang giao': 'blue',
  'Hoàn thành': 'green',
  'Hủy': 'red',
};

const DonHangPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productQuantities, setProductQuantities] = useState<Record<number, number>>({});

  const [form] = Form.useForm();

  const selectedProducts = useMemo(
    () =>
      selectedProductIds
        .map((id) => products.find((product) => product.id === id))
        .filter((item): item is { id: number; name: string; price: number } => !!item),
    [selectedProductIds],
  );

  const computedTotal = useMemo(() => {
    return selectedProducts.reduce((sum, item) => {
      const quantity = productQuantities[item.id] || 1;
      return sum + item.price * quantity;
    }, 0);
  }, [selectedProducts, productQuantities]);

  const totalOrders = orders.length;
  const waitingOrders = orders.filter((order) => order.status === 'Chờ xác nhận').length;
  const deliveringOrders = orders.filter((order) => order.status === 'Đang giao').length;
  const completedOrders = orders.filter((order) => order.status === 'Hoàn thành').length;

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const text = searchText.trim().toLowerCase();
        return (
          !text ||
          order.code.toLowerCase().includes(text) ||
          order.customer.toLowerCase().includes(text)
        );
      })
      .filter((order) => statusFilter === 'all' || order.status === statusFilter);
  }, [orders, searchText, statusFilter]);

  const openModal = (order?: Order) => {
    if (order) {
      setIsEditing(true);
      setEditingOrder(order);
      setSelectedProductIds(order.products.map((item) => item.id));
      setProductQuantities(
        order.products.reduce((acc, current) => {
          acc[current.id] = current.quantity;
          return acc;
        }, {} as Record<number, number>),
      );
      form.setFieldsValue({
        code: order.code,
        customerId: order.customerId,
        orderDate: moment(order.orderDate, 'YYYY-MM-DD'),
        status: order.status,
        products: order.products.map((product) => product.id),
      });
    } else {
      setIsEditing(false);
      setEditingOrder(null);
      setSelectedProductIds([]);
      setProductQuantities({});
      form.resetFields();
      form.setFieldsValue({ status: 'Chờ xác nhận' });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    form.resetFields();
    setSelectedProductIds([]);
    setProductQuantities({});
    setEditingOrder(null);
  };

  const validateUniqueCode = async (_: any, value: string) => {
    if (!value) return Promise.resolve();
    const exists = orders.some(
      (order) => order.code === value && order.id !== editingOrder?.id,
    );
    if (exists) {
      return Promise.reject(new Error('Mã đơn hàng đã tồn tại'));
    }
    return Promise.resolve();
  };

  const handleProductSelect = (value: number[]) => {
    setSelectedProductIds(value);
    setProductQuantities((prev) => {
      const next = { ...prev };
      value.forEach((id) => {
        if (!next[id]) {
          next[id] = 1;
        }
      });
      Object.keys(next).forEach((key) => {
        const id = Number(key);
        if (!value.includes(id)) {
          delete next[id];
        }
      });
      return next;
    });
  };

  const handleQuantityChange = (id: number, value: number | null) => {
    setProductQuantities((prev) => ({
      ...prev,
      [id]: value && value > 0 ? value : 1,
    }));
  };

  const handleSave = (values: any) => {
    const selectedProductsWithDetails = selectedProducts.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: productQuantities[item.id] || 1,
    }));

    if (!selectedProductsWithDetails.length) {
      message.error('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    const total = selectedProductsWithDetails.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const orderData: Order = {
      id: editingOrder ? editingOrder.id : Date.now(),
      code: values.code,
      customerId: values.customerId,
      customer: customers.find((customer) => customer.id === values.customerId)?.name || '',
      orderDate: values.orderDate.format('YYYY-MM-DD'),
      status: values.status,
      products: selectedProductsWithDetails,
      total,
    };

    if (editingOrder) {
      setOrders((prev) => prev.map((item) => (item.id === editingOrder.id ? orderData : item)));
      message.success('Cập nhật đơn hàng thành công');
    } else {
      setOrders((prev) => [orderData, ...prev]);
      message.success('Thêm đơn hàng thành công');
    }
    closeModal();
  };

  const handleCancelOrder = (order: Order) => {
    setOrders((prev) =>
      prev.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status: 'Hủy',
            }
          : item,
      ),
    );
    message.success('Đơn hàng đã được hủy');
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
      key: 'code',
      width: 140,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      width: 180,
    },
    {
      title: 'Ngày đặt hàng',
      dataIndex: 'orderDate',
      key: 'orderDate',
      sorter: (a: Order, b: Order) =>
        new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
      render: (value: string) => moment(value, 'YYYY-MM-DD').format('DD/MM/YYYY'),
      width: 160,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      sorter: (a: Order, b: Order) => a.total - b.total,
      render: (value: number) => value.toLocaleString('vi-VN') + ' đ',
      align: 'right' as const,
      width: 150,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={statusColors[status]}>{status}</Tag>
      ),
      width: 160,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center' as const,
      fixed: 'right' as const,
      width: 220,
      render: (_: any, record: Order) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Chỉ hủy được khi đơn đang ở trạng thái Chờ xác nhận. Bạn có muốn hủy đơn không?"
            onConfirm={() => handleCancelOrder(record)}
            disabled={record.status !== 'Chờ xác nhận'}
          >
            <Button
              type="link"
              danger
              icon={<StopOutlined />}
              disabled={record.status !== 'Chờ xác nhận'}
            >
              Hủy
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: 24, background: 'linear-gradient(180deg, #eef2ff 0%, #f8fbff 100%)' }}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: 28,
          boxShadow: '0 18px 48px rgba(16, 24, 40, 0.08)',
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý đơn hàng
            </Title>
            <Text type="secondary">
              Dashboard đơn hàng với tìm kiếm, lọc và quản lý trạng thái trực quan.
            </Text>
          </Col>
          <Col>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openModal()}>
              Thêm đơn hàng
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ borderRadius: 18, background: '#f7f9ff' }}>
              <Text type="secondary">Tổng đơn</Text>
              <Title level={3} style={{ margin: 0 }}>{totalOrders}</Title>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ borderRadius: 18, background: '#fff7e6' }}>
              <Text type="secondary">Chờ xác nhận</Text>
              <Title level={3} style={{ margin: 0 }}>{waitingOrders}</Title>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ borderRadius: 18, background: '#e6f7ff' }}>
              <Text type="secondary">Đang giao</Text>
              <Title level={3} style={{ margin: 0 }}>{deliveringOrders}</Title>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ borderRadius: 18, background: '#f6ffed' }}>
              <Text type="secondary">Hoàn thành</Text>
              <Title level={3} style={{ margin: 0 }}>{completedOrders}</Title>
            </Card>
          </Col>
        </Row>

        <div
          style={{
            marginTop: 24,
            padding: 24,
            borderRadius: 20,
            background: '#f5f7ff',
            boxShadow: 'inset 0 0 0 1px rgba(162, 180, 255, 0.16)',
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={10}>
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Tìm mã đơn hàng hoặc khách hàng"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                style={{ borderRadius: 12, boxShadow: '0 6px 20px rgba(102, 126, 234, 0.08)' }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                style={{ width: '100%', borderRadius: 12, boxShadow: '0 6px 20px rgba(102, 126, 234, 0.08)' }}
                placeholder="Lọc theo trạng thái"
              >
                <Option value="all">Tất cả</Option>
                {orderStatuses.map((status) => (
                  <Option key={status} value={status}>
                    {status}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          style={{ marginTop: 24, borderRadius: 20, overflow: 'hidden', background: '#ffffff' }}
          dataSource={filteredOrders}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 900 }}
          bordered
        />
      </div>

      <Modal
        title={isEditing ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng'}
        visible={modalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        width={900}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} preserve={false}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="code"
                label="Mã đơn hàng"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã đơn hàng' },
                  { validator: validateUniqueCode },
                ]}
              >
                <Input placeholder="VD: DH001" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="customerId"
                label="Khách hàng"
                rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
              >
                <Select placeholder="Chọn khách hàng">
                  {customers.map((customer) => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="orderDate"
                label="Ngày đặt hàng"
                rules={[{ required: true, message: 'Vui lòng chọn ngày đặt' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="status"
                label="Trạng thái đơn hàng"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  {orderStatuses.map((status) => (
                    <Option key={status} value={status}>
                      {status}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={16}>
              <Form.Item
                name="products"
                label="Sản phẩm trong đơn"
                rules={[
                  { required: true, message: 'Vui lòng chọn sản phẩm' },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn sản phẩm"
                  options={products.map((product) => ({
                    label: `${product.name} - ${product.price.toLocaleString('vi-VN')} đ`,
                    value: product.id,
                  }))}
                  onChange={handleProductSelect}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle">
            <Col xs={24} md={12}>
              <div
                style={{
                  padding: 16,
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  background: '#fafafa',
                }}
              >
                <Text strong>Tổng tiền đơn hàng</Text>
                <div style={{ marginTop: 12 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {computedTotal.toLocaleString('vi-VN')} đ
                  </Title>
                </div>
              </div>
            </Col>
          </Row>

          {selectedProducts.length > 0 && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 12,
                border: '1px solid #f0f0f0',
                background: '#ffffff',
              }}
            >
              <Text strong>Chi tiết sản phẩm</Text>
              <Divider style={{ margin: '12px 0' }} />
              {selectedProducts.map((product) => (
                <Row
                  key={product.id}
                  gutter={[16, 16]}
                  align="middle"
                  style={{ marginBottom: 12 }}
                >
                  <Col xs={24} sm={10}>
                    <Text>{product.name}</Text>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Text>{product.price.toLocaleString('vi-VN')} đ</Text>
                  </Col>
                  <Col xs={24} sm={6}>
                    <InputNumber
                      min={1}
                      value={productQuantities[product.id] || 1}
                      onChange={(value) => handleQuantityChange(product.id, value)}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col xs={24} sm={2}>
                    <Text type="secondary">
                      {(product.price * (productQuantities[product.id] || 1)).toLocaleString('vi-VN')} đ
                    </Text>
                  </Col>
                </Row>
              ))}
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default DonHangPage;
