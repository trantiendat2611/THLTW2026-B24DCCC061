import React, { useState, useEffect } from 'react';
import { Card, Pagination, Input, Tag, Button, Avatar, Typography, Space, Table, Form, Modal, Popconfirm, Select, message, Tabs } from 'antd';
import { SearchOutlined, EyeOutlined, CalendarOutlined, UserOutlined, ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// --- MOCK DATA BAN ĐẦU ---
const initialPosts = [
  {
    id: 1,
    title: 'Giới thiệu về React',
    slug: 'gioi-thieu-ve-react',
    content: `# Giới thiệu về React\nReact là một thư viện JavaScript...`,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80',
    tags: ['React', 'Frontend'],
    author: 'Nguyễn Văn A',
    date: '2023-10-01',
    status: 'published',
    views: 150,
  },
  {
    id: 2,
    title: 'Học TypeScript với React',
    slug: 'hoc-typescript-voi-react',
    content: `# Học TypeScript với React\nTypeScript mang lại type safety...`,
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500&q=80',
    tags: ['TypeScript', 'React'],
    author: 'Trần Thị B',
    date: '2023-10-05',
    status: 'published',
    views: 200,
  },
  {
    id: 4,
    title: 'CSS Grid Layout',
    slug: 'css-grid-layout',
    content: `# CSS Grid Layout\nCSS Grid là một hệ thống layout mạnh mẽ...`,
    image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=500&q=80',
    tags: ['CSS', 'Layout'],
    author: 'Phạm Thị D',
    date: '2023-10-15',
    status: 'published',
    views: 120,
  },
];

const TH07 = () => {
  const [currentView, setCurrentView] = useState('home'); 
  const [posts, setPosts] = useState(initialPosts);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Modal states
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postForm] = Form.useForm();

  const postsPerPage = 9;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  const getTagsData = () => {
    const tagMap = {}; 
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });
    });
    return Object.keys(tagMap).map((name, index) => ({
      id: index,
      name,
      count: tagMap[name]
    }));
  };
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                          post.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    const isPublished = currentView === 'home' ? post.status === 'published' : true;
    return matchesSearch && matchesTag && isPublished;
  });

  const paginatedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  // --- HANDLERS ---
  const handleViewPost = (post) => {
    const updatedPosts = posts.map(p => p.id === post.id ? { ...p, views: p.views + 1 } : p);
    setPosts(updatedPosts);
    setSelectedPost({ ...post, views: post.views + 1 });
    setCurrentView('detail');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentView('home');
    setSelectedPost(null);
  };

  const handlePostSubmit = (values) => {
    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost.id ? { ...p, ...values } : p));
      message.success('Cập nhật thành công!');
    } else {
      const newPost = { ...values, id: Date.now(), date: new Date().toLocaleDateString('en-CA'), views: 0, author: 'Admin' };
      setPosts([newPost, ...posts]);
      message.success('Thêm bài mới thành công!');
    }
    setIsPostModalVisible(false);
    postForm.resetFields();
  };
  const renderHome = () => (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>BLOG CÁ NHÂN</Title>
      
      <Space style={{ marginBottom: 24, justifyContent: 'space-between', display: 'flex' }}>
        <Input
          placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 400 }}
          allowClear
        />
        <Space>
          <Button onClick={() => setCurrentView('managePosts')}>Quản lý Blog</Button>
          <Button type="primary" onClick={() => setCurrentView('about')}>Giới thiệu</Button>
        </Space>
      </Space>

      {selectedTag && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>Đang lọc thẻ: </Text>
          <Tag color="blue" closable onClose={() => setSelectedTag(null)}>{selectedTag}</Tag>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {paginatedPosts.map(post => (
          <Card
            key={post.id}
            hoverable
            cover={<img alt={post.title} src={post.image} style={{ height: 200, objectFit: 'cover' }} />}
            onClick={() => handleViewPost(post)}
          >
            <Card.Meta
              title={post.title}
              description={
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Paragraph ellipsis={{ rows: 2 }} type="secondary">
                    {post.content.replace(/[#*`]/g, '').substring(0, 100)}...
                  </Paragraph>
                  <Space split={<Text type="secondary">|</Text>}>
                    {/* SỬA LỖI: Thay size="small" bằng style fontSize */}
                    <Text style={{ fontSize: '12px' }}><CalendarOutlined /> {post.date}</Text>
                    <Text style={{ fontSize: '12px' }}><UserOutlined /> {post.author}</Text>
                  </Space>
                  <div style={{ marginTop: 8 }}>
                    {post.tags.map(tag => (
                      <Tag key={tag} color="blue" onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); }}>{tag}</Tag>
                    ))}
                  </div>
                </Space>
              }
            />
          </Card>
        ))}
      </div>

      <Pagination
        current={currentPage}
        total={filteredPosts.length}
        pageSize={postsPerPage}
        onChange={setCurrentPage}
        style={{ marginTop: 40, textAlign: 'center' }}
        hideOnSinglePage
      />
    </div>
  );
  const renderDetail = () => {
    const relatedPosts = posts.filter(p => 
      p.id !== selectedPost?.id && 
      p.status === 'published' &&
      p.tags.some(t => selectedPost?.tags.includes(t))
    ).slice(0, 3);

    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 20 }}>Quay lại</Button>
        <Card bordered={false}>
          <Title level={1}>{selectedPost?.title}</Title>
          <Space size="large" style={{ marginBottom: 24 }}>
            <Text type="secondary"><UserOutlined /> {selectedPost?.author}</Text>
            <Text type="secondary"><CalendarOutlined /> {selectedPost?.date}</Text>
            <Text type="secondary"><EyeOutlined /> {selectedPost?.views} lượt xem</Text>
          </Space>
          <div style={{ marginBottom: 24 }}>
            {selectedPost?.tags.map(tag => <Tag key={tag} color="geekblue">{tag}</Tag>)}
          </div>
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedPost?.content || ''}</ReactMarkdown>
          </div>
        </Card>

        {relatedPosts.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <Title level={4}>Bài viết liên quan</Title>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {relatedPosts.map(p => (
                <Card key={p.id} hoverable onClick={() => handleViewPost(p)} size="small">
                  <Text strong ellipsis>{p.title}</Text>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  const renderManage = () => {
    const postColumns = [
      { title: 'Tiêu đề', dataIndex: 'title', key: 'title', width: '30%' },
      { title: 'Trạng thái', dataIndex: 'status', key: 'status', 
        render: s => <Tag color={s === 'published' ? 'green' : 'orange'}>{s === 'published' ? 'Đã đăng' : 'Nháp'}</Tag> 
      },
      { title: 'Thẻ', dataIndex: 'tags', render: tags => tags.map(t => <Tag key={t}>{t}</Tag>) },
      { title: 'Xem', dataIndex: 'views', sorter: (a, b) => a.views - b.views },
      { title: 'Hành động', key: 'action', render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setEditingPost(record); postForm.setFieldsValue(record); setIsPostModalVisible(true); }} />
          <Popconfirm title="Xóa bài viết này?" onConfirm={() => setPosts(posts.filter(p => p.id !== record.id))}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      )},
    ];

    const tagColumns = [
      { title: 'Tên thẻ', dataIndex: 'name' },
      { title: 'Số bài viết sử dụng', dataIndex: 'count' },
    ];

    return (
      <div>
        <Button onClick={handleBack} style={{ marginBottom: 20 }}>Quay lại Trang chủ</Button>
        {/* SỬA LỖI: Sử dụng cấu trúc Tabs.TabPane cho AntD v4 */}
        <Tabs defaultActiveKey="1" type="card">
          <Tabs.TabPane tab="Quản lý bài viết" key="1">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingPost(null); postForm.resetFields(); setIsPostModalVisible(true); }} style={{ marginBottom: 16 }}>
              Thêm bài viết
            </Button>
            <Table dataSource={posts} columns={postColumns} rowKey="id" pagination={{ pageSize: 5 }} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Quản lý thẻ" key="2">
            <Table dataSource={getTagsData()} columns={tagColumns} rowKey="name" />
          </Tabs.TabPane>
        </Tabs>

        <Modal
          title={editingPost ? 'Sửa bài viết' : 'Thêm bài viết'}
          visible={isPostModalVisible}
          onCancel={() => setIsPostModalVisible(false)}
          onOk={() => postForm.submit()}
          width={800}
        >
          <Form form={postForm} onFinish={handlePostSubmit} layout="vertical">
            <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="content" label="Nội dung (Markdown)" rules={[{ required: true }]}><TextArea rows={6} /></Form.Item>
            <Form.Item name="image" label="URL ảnh đại diện"><Input /></Form.Item>
            <Form.Item name="tags" label="Thẻ tag" rules={[{ required: true }]}>
              <Select mode="tags" placeholder="Chọn hoặc gõ tag mới"></Select>
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" initialValue="published">
              <Select>
                <Option value="published">Đã đăng</Option>
                <Option value="draft">Nháp</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };
  const renderAbout = () => (
    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <Button onClick={handleBack} style={{ marginBottom: 20 }}>Quay lại</Button>
      <Card bordered={false}>
        <Avatar size={120} src="https://via.placeholder.com/150" style={{ marginBottom: 20 }} />
        <Title level={2}>Nguyễn Văn A</Title>
        <Text type="secondary">Fullstack Developer | Content Creator</Text>
        <Paragraph style={{ marginTop: 20 }}>
          Chào mừng bạn đến với blog cá nhân của mình. Nơi mình chia sẻ những kiến thức về React, Ant Design và Malware Analysis.
        </Paragraph>
        <Title level={4}>Kỹ năng</Title>
        <Space wrap style={{ justifyContent: 'center' }}>
          <Tag color="cyan">React</Tag><Tag color="blue">TypeScript</Tag><Tag color="purple">Node.js</Tag>
        </Space>
        <div style={{ marginTop: 30 }}>
          <Button type="link" href="#">GitHub</Button>
          <Button type="link" href="#">LinkedIn</Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div style={{ padding: '40px 20px', background: '#f0f2f5', minHeight: '100vh' }}>
      {currentView === 'home' && renderHome()}
      {currentView === 'detail' && renderDetail()}
      {currentView === 'managePosts' && renderManage()}
      {currentView === 'about' && renderAbout()}
    </div>
  );
};

export default TH07;