import React, { useMemo } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Avatar, Button, Col, Descriptions, Progress, Row, Space, Statistic, Tag, Timeline, theme } from 'antd';
import { EditOutlined, CrownOutlined, SafetyCertificateOutlined, TrophyOutlined, RocketOutlined, SettingOutlined } from '@ant-design/icons';
import { useModel, history } from '@umijs/max';

const CenterPage: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const user = initialState?.currentUser;

  const completion = useMemo(() => 82, []);

  return (
    <PageContainer>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <ProCard>
          <Row gutter={24} align="middle">
            <Col flex="96px">
              <Avatar size={96} src={user?.avatar} style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }} />
            </Col>
            <Col flex="auto">
              <Space direction="vertical" size={8}>
                <Space size={12} align="center">
                  <span style={{ fontSize: 22, fontWeight: 700 }}>{user?.name || '未登录用户'}</span>
                  <Tag color="green" icon={<CrownOutlined />}>黄金会员</Tag>
                  <Tag color="blue" icon={<SafetyCertificateOutlined />}>实名认证</Tag>
                </Space>
                <Descriptions column={3} size="small">
                  <Descriptions.Item label="用户名">{user?.username || '-'}</Descriptions.Item>
                  <Descriptions.Item label="角色">{user?.access || 'user'}</Descriptions.Item>
                  <Descriptions.Item label="部门">{user?.group || '科研部门'}</Descriptions.Item>
                </Descriptions>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button icon={<EditOutlined />} onClick={() => history.push('/account/settings')}>编辑资料</Button>
                <Button type="primary" icon={<SettingOutlined />} onClick={() => history.push('/account/settings')}>账号设置</Button>
              </Space>
            </Col>
          </Row>
        </ProCard>

        <Row gutter={16}>
          <Col xs={24} lg={16}>
            <ProCard title="活跃度与成就" split="horizontal">
              <ProCard>
                <Row gutter={24}>
                  <Col span={8}><Statistic title="本周活跃" value={28} suffix="次" prefix={<RocketOutlined style={{ color: token.colorPrimary }} />} /></Col>
                  <Col span={8}><Statistic title="累计会话" value={356} suffix="次" prefix={<TrophyOutlined style={{ color: token.colorWarning }} />} /></Col>
                  <Col span={8}><Statistic title="知识库草稿" value={12} suffix="条" /></Col>
                </Row>
              </ProCard>
              <ProCard layout="center">
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <div style={{ fontWeight: 600 }}>资料完善度</div>
                  <Progress type="dashboard" percent={completion} strokeColor={token.colorPrimary} />
                  <div style={{ color: token.colorTextTertiary }}>完善资料可解锁更多AI能力与额度</div>
                </Space>
              </ProCard>
            </ProCard>
          </Col>
          <Col xs={24} lg={8}>
            <ProCard title="最近动态">
              <Timeline
                items={[
                  { children: '完成了“病虫害影像识别”模型训练', dot: <TrophyOutlined style={{ color: token.colorWarning }} /> },
                  { children: '导入了 120 条种质资源数据', color: 'green' },
                  { children: '完善了个人简介与研究方向', color: 'blue' },
                  { children: '升级至黄金会员', dot: <CrownOutlined style={{ color: token.colorGold }} /> },
                ]}
              />
            </ProCard>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <ProCard title="我的应用" split="vertical">
              <ProCard ghost>
                <Space direction="vertical">
                  <Button type="link">AI 小助手对话历史</Button>
                  <Button type="link">我的模型与推理任务</Button>
                  <Button type="link">我的数据集</Button>
                </Space>
              </ProCard>
              <ProCard ghost>
                <Space direction="vertical">
                  <Button type="link">留种记录管理</Button>
                  <Button type="link">播种计划与执行</Button>
                  <Button type="link">图片识别批处理</Button>
                </Space>
              </ProCard>
            </ProCard>
          </Col>
          <Col xs={24} lg={12}>
            <ProCard title="安全状态">
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div>登录保护：<Tag color="green">已开启</Tag></div>
                <div>二次验证：<Tag color="blue">建议开启</Tag></div>
                <div>令牌有效期：<Tag>7 天</Tag></div>
                <Button type="primary" icon={<SafetyCertificateOutlined />}>一键体检</Button>
              </Space>
            </ProCard>
          </Col>
        </Row>
      </Space>
    </PageContainer>
  );
};

export default CenterPage;


