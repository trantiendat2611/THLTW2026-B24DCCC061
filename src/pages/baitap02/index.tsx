import React, { useState, useMemo } from 'react';
import {
  Table,
  Tabs,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Badge,
  DatePicker,
} from 'antd';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

/* ===================== TYPE ===================== */
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface OrderItem {
  productId: number;
  quantity: number;
}

interface Order {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

/* ===================== DATA ===================== */
const initialProducts: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
  { id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
  { id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
  { id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
  { id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
  { id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
  { id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

export default function Index() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);

  /* ===================== FILTER ===================== */
  const [searchProduct, setSearchProduct] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  const [searchOrder, setSearchOrder] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState<string | undefined>();
  const [filterDate, setFilterDate] = useState<any>();

  /* ===================== MODAL ===================== */
  const [openCreateOrder, setOpenCreateOrder] = useState(false);
  const [openEditProduct, setOpenEditProduct] = useState(false);
  const [openOrderDetail, setOpenOrderDetail] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const [orderForm] = Form.useForm();
  const [productForm] = Form.useForm();

  /* ===================== DASHBOARD ===================== */
  const dashboard = useMemo(() => {
    const revenue = orders
      .filter((o) => o.status === 'Hoàn thành')
      .reduce((s, o) => s + o.total, 0);

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalInventoryValue: products.reduce((s, p) => s + p.price * p.quantity, 0),
      revenue,
      statusCount: {
        'Chờ xử lý': orders.filter((o) => o.status === 'Chờ xử lý').length,
        'Đang giao': orders.filter((o) => o.status === 'Đang giao').length,
        'Hoàn thành': orders.filter((o) => o.status === 'Hoàn thành').length,
        'Đã hủy': orders.filter((o) => o.status === 'Đã hủy').length,
      },
    };
  }, [products, orders]);

  /* ===================== FILTER DATA ===================== */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const status =
        p.quantity > 10 ? 'Còn hàng' : p.quantity > 0 ? 'Sắp hết' : 'Hết hàng';

      return (
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
        (!filterCategory || p.category === filterCategory) &&
        (!filterStatus || status === filterStatus)
      );
    });
  }, [products, searchProduct, filterCategory, filterStatus]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchText =
        o.customerName.toLowerCase().includes(searchOrder.toLowerCase()) ||
        o.id.toString().includes(searchOrder);

      const matchStatus = filterOrderStatus ? o.status === filterOrderStatus : true;

      const matchDate = filterDate
        ? new Date(o.createdAt) >= filterDate[0].toDate() &&
          new Date(o.createdAt) <= filterDate[1].toDate()
        : true;

      return matchText && matchStatus && matchDate;
    });
  }, [orders, searchOrder, filterOrderStatus, filterDate]);

  /* ===================== CREATE ORDER ===================== */
  const onCreateOrder = (values: any) => {
    const items: OrderItem[] = values.products.map((pid: number) => ({
      productId: pid,
      quantity: values.quantities[pid],
    }));

    const total = items.reduce((s, i) => {
      const p = products.find((x) => x.id === i.productId)!;
      return s + p.price * i.quantity;
    }, 0);

    setOrders([
      ...orders,
      {
        id: Date.now(),
        customerName: values.customerName,
        phone: values.phone,
        address: values.address,
        items,
        total,
        status: 'Chờ xử lý',
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ]);

    message.success('Tạo đơn hàng thành công');
    setOpenCreateOrder(false);
    orderForm.resetFields();
  };

  /* ===================== CHANGE ORDER STATUS ===================== */
  const changeOrderStatus = (order: Order, status: string) => {
    if (order.status === status) return;

    const newProducts = [...products];

    if (status === 'Hoàn thành') {
      order.items.forEach((i) => {
        const p = newProducts.find((x) => x.id === i.productId);
        if (p) p.quantity -= i.quantity;
      });
    }

    if (status === 'Đã hủy' && order.status === 'Hoàn thành') {
      order.items.forEach((i) => {
        const p = newProducts.find((x) => x.id === i.productId);
        if (p) p.quantity += i.quantity;
      });
    }

    setProducts(newProducts);
    setOrders(orders.map((o) => (o.id === order.id ? { ...o, status } : o)));
  };

  /* ===================== COLUMNS ===================== */
  const productColumns = [
    { title: 'STT', render: (_: any, __: any, i: number) => i + 1 },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
    },
    { title: 'Danh mục', dataIndex: 'category' },
    {
      title: 'Giá',
      dataIndex: 'price',
      sorter: (a: Product, b: Product) => a.price - b.price,
      render: (v: number) => v.toLocaleString() + ' đ',
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      sorter: (a: Product, b: Product) => a.quantity - b.quantity,
    },
    {
      title: 'Trạng thái',
      render: (_: any, r: Product) =>
        r.quantity > 10 ? (
          <Tag color="green">Còn hàng</Tag>
        ) : r.quantity > 0 ? (
          <Tag color="orange">Sắp hết</Tag>
        ) : (
          <Tag color="red">Hết hàng</Tag>
        ),
    },
    {
      title: 'Thao tác',
      render: (_: any, r: Product) => (
        <Button
          size="small"
          onClick={() => {
            setEditingProduct(r);
            productForm.setFieldsValue(r);
            setOpenEditProduct(true);
          }}
        >
          Sửa
        </Button>
      ),
    },
  ];

  const orderColumns = [
    { title: 'Mã đơn', dataIndex: 'id' },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    { title: 'Số SP', render: (_: any, r: Order) => r.items.length },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      sorter: (a: Order, b: Order) => a.total - b.total,
      render: (v: number) => v.toLocaleString() + ' đ',
    },
    {
      title: 'Trạng thái',
      render: (_: any, r: Order) => (
        <Select value={r.status} style={{ width: 130 }} onChange={(v) => changeOrderStatus(r, v)}>
          <Option value="Chờ xử lý">Chờ xử lý</Option>
          <Option value="Đang giao">Đang giao</Option>
          <Option value="Hoàn thành">Hoàn thành</Option>
          <Option value="Đã hủy">Đã hủy</Option>
        </Select>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      sorter: (a: Order, b: Order) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Thao tác',
      render: (_: any, r: Order) => (
        <Button size="small" onClick={() => { setViewOrder(r); setOpenOrderDetail(true); }}>
          Chi tiết
        </Button>
      ),
    },
  ];

  /* ===================== UI ===================== */
  return (
    <>
      {/* DASHBOARD */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="Tổng sản phẩm" value={dashboard.totalProducts} /></Card></Col>
        <Col span={6}><Card><Statistic title="Giá trị tồn kho" value={dashboard.totalInventoryValue} formatter={(v) => Number(v).toLocaleString() + ' đ'} /></Card></Col>
        <Col span={6}><Card><Statistic title="Tổng đơn hàng" value={dashboard.totalOrders} /></Card></Col>
        <Col span={6}><Card><Statistic title="Doanh thu" value={dashboard.revenue} formatter={(v) => Number(v).toLocaleString() + ' đ'} /></Card></Col>
      </Row>

      <Tabs>
        <TabPane tab="Quản lý Sản phẩm" key="1">
          <Input placeholder="Tìm sản phẩm" style={{ width: 200, marginRight: 8 }} onChange={(e) => setSearchProduct(e.target.value)} />
          <Select placeholder="Danh mục" allowClear style={{ width: 160, marginRight: 8 }} onChange={setFilterCategory}>
            <Option value="Laptop">Laptop</Option>
            <Option value="Điện thoại">Điện thoại</Option>
            <Option value="Phụ kiện">Phụ kiện</Option>
            <Option value="Máy tính bảng">Máy tính bảng</Option>
          </Select>
          <Select placeholder="Trạng thái" allowClear style={{ width: 150 }} onChange={setFilterStatus}>
            <Option value="Còn hàng">Còn hàng</Option>
            <Option value="Sắp hết">Sắp hết</Option>
            <Option value="Hết hàng">Hết hàng</Option>
          </Select>

          <Table rowKey="id" columns={productColumns} dataSource={filteredProducts} pagination={{ pageSize: 5 }} />
        </TabPane>

        <TabPane tab="Quản lý Đơn hàng" key="2">
          <Input placeholder="Tìm KH / mã đơn" style={{ width: 200, marginRight: 8 }} onChange={(e) => setSearchOrder(e.target.value)} />
          <Select placeholder="Trạng thái" allowClear style={{ width: 150, marginRight: 8 }} onChange={setFilterOrderStatus}>
            <Option value="Chờ xử lý">Chờ xử lý</Option>
            <Option value="Đang giao">Đang giao</Option>
            <Option value="Hoàn thành">Hoàn thành</Option>
            <Option value="Đã hủy">Đã hủy</Option>
          </Select>
          <RangePicker onChange={setFilterDate} />

          <br /><br />
          <Button type="primary" onClick={() => setOpenCreateOrder(true)}>Tạo đơn hàng</Button>

          <Table rowKey="id" columns={orderColumns} dataSource={filteredOrders} style={{ marginTop: 16 }} />
        </TabPane>
      </Tabs>

      {/* CREATE ORDER */}
      <Modal visible={openCreateOrder} title="Tạo đơn hàng" onCancel={() => setOpenCreateOrder(false)} onOk={() => orderForm.submit()}>
        <Form form={orderForm} layout="vertical" onFinish={onCreateOrder}>
          <Form.Item name="customerName" label="Tên KH" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="SĐT" rules={[{ required: true }, { pattern: /^[0-9]{10,11}$/ }]}><Input /></Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="products" label="Sản phẩm" rules={[{ required: true }]}>
            <Select mode="multiple">
              {products.map((p) => <Option key={p.id} value={p.id}>{p.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item shouldUpdate>
            {() =>
              (orderForm.getFieldValue('products') || []).map((pid: number) => {
                const p = products.find((x) => x.id === pid)!;
                return (
                  <Form.Item key={pid} name={['quantities', pid]} label={`Số lượng - ${p.name}`} rules={[{ required: true }]}>
                    <InputNumber min={1} max={p.quantity} />
                  </Form.Item>
                );
              })
            }
          </Form.Item>
        </Form>
      </Modal>

      {/* EDIT PRODUCT */}
      <Modal visible={openEditProduct} title="Sửa sản phẩm" onCancel={() => setOpenEditProduct(false)} onOk={() => {
        productForm.validateFields().then((v) => {
          setProducts(products.map((p) => p.id === editingProduct!.id ? { ...p, ...v } : p));
          setOpenEditProduct(false);
        });
      }}>
        <Form form={productForm} layout="vertical">
          <Form.Item name="name" label="Tên SP" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="quantity" label="Tồn kho" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      {/* ORDER DETAIL */}
      <Modal visible={openOrderDetail} title="Chi tiết đơn hàng" footer={null} onCancel={() => setOpenOrderDetail(false)}>
        {viewOrder && (
          <>
            <p><b>Khách hàng:</b> {viewOrder.customerName}</p>
            <p><b>SĐT:</b> {viewOrder.phone}</p>
            <p><b>Địa chỉ:</b> {viewOrder.address}</p>
            <Table
              pagination={false}
              rowKey="productId"
              dataSource={viewOrder.items}
              columns={[
                {
                  title: 'Sản phẩm',
                  render: (_: any, r: OrderItem) =>
                    products.find((p) => p.id === r.productId)?.name,
                },
                { title: 'Số lượng', dataIndex: 'quantity' },
              ]}
            />
          </>
        )}
      </Modal>
    </>
  );
}
