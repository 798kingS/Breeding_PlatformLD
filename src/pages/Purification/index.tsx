//自交系纯化页面
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { useLocation } from '@umijs/max';
import { Button, Modal, message, Upload, Form, Input, InputNumber, DatePicker, Alert } from 'antd';
import { DeleteOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';

interface LocationState {
  purificationRecord?: PurificationRecord;
}

// PurificationRecord类型加索引签名
type PurificationRecord = {
  key: number;
  // 引种记录字段
  code: string;           // 编号
  name: string;          // 引种名称
  method: string;       // 引种方式
  type: string;         // 品种类型
  isRegular: string;    // 是否常规
  generation: string;   // 世代
  // 自交系纯化字段
  plantingCode: string;    // 种植编号
  sowingAmount: number;   // 播种数量
  sowingTime: string;    // 播种时间
  introductionTime: string; // 引种时间
  [key: string]: any; // 允许任意字段索引
};

const PurificationList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const location = useLocation();
  const [dataSource, setDataSource] = useState<PurificationRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [sowingModalVisible, setSowingModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<PurificationRecord | null>(null);
  const [form] = Form.useForm();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem('token');

  // 页面加载时从后端获取自交系纯化数据
  useEffect(() => {
    const fetchPurificationRecords = async () => {
      try {
        const response = await fetch('/api/Selfing/getSelfingSeed', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        );
        if (!response.ok) throw new Error('网络错误');
        const result = await response.json();
        // console.log('获取自交系纯化数据:', result);
        if (Array.isArray(result.data)) {
          // 保证每条数据的key唯一，优先用id，否则用时间戳+随机数
          const withKey = result.data.map((item: any) => ({
            ...item,
            key: item.id ?? item.key ?? (Date.now() + Math.random()),
          }));
          setDataSource(withKey);
        } else {
          setDataSource([]);
        }
      } catch (error) {
        message.error('获取自交系纯化数据失败');
        setDataSource([]);
      }
    };
    fetchPurificationRecords();
  }, []);

  // 如果有新的自交系纯化记录，添加到数据源
  useEffect(() => {
    const state = location.state as LocationState;
    const { purificationRecord } = state || {};
    if (purificationRecord && !dataSource.some(item => item.key === purificationRecord.key)) {
      setDataSource(prev => [...prev, purificationRecord]);
    }
  }, [location.state]);

  // 查询表单的值
  const [searchValues, setSearchValues] = useState<any>({});
  // 本地过滤后的数据
  const [filteredData, setFilteredData] = useState<PurificationRecord[]>([]);

  // 监听dataSource或searchValues变化，做本地过滤
  useEffect(() => {
    let result = dataSource;
    // 引种时间区间筛选
    const introRange = (searchValues as any).introductionTimeRange;
    if (introRange && Array.isArray(introRange)) {
      const [start, end] = introRange;
      result = result.filter(item => {
        const t = moment(item.introductionTime).valueOf();
        return t >= moment(start).valueOf() && t <= moment(end).valueOf();
      });
    }
    Object.entries(searchValues).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (key === 'sowingTime') {
        // 日期字段，支持范围或精确
        if (typeof value === 'string') {
          result = result.filter(item => (item.sowingTime || '').includes(value));
        }
      } else if (key === 'introductionTimeRange') {
        // 已处理
        return;
      } else if (typeof value === 'string') {
        result = result.filter(item => (item[key] || '').toString().includes(value));
      } else {
        result = result.filter(item => item[key] === value);
      }
    });
    setFilteredData(result);
  }, [dataSource, searchValues]);

  // 处理单个删除
  const handleDelete = (record: PurificationRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除种植编号为 ${record.pedigreeNumber} 的记录吗？`,
      onOk: async () => {
        try {
          const response = await fetch(`/api/Selfing/seeddelete?plantid=${record.pedigreeNumber}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
             },
            // body: JSON.stringify({ plantid: record.pedigreeNumber }),
          });
          const result = await response.json();
          if (response.ok && result.success !== false) {
            message.success('删除成功');
            // 从本地数据中移除
            const newDataSource = dataSource.filter(item => item.key !== record.key);
            setDataSource(newDataSource);
          } else {
            message.error(result.message || '删除失败');
          }
        } catch (error) {
          message.error('删除失败，请重试');
        }
      },
    });
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
      onOk: async () => {
        try {
          // 取出选中行的pedigreeNumber
          const pedigreeNumbers = selectedRowKeys.map(key => {
            const row = dataSource.find(item => item.key === key);
            return row?.pedigreeNumber;
          }).filter(Boolean);
          const response = await fetch('/api/Selfing/BatchDeleteSeed', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
             },
            body: JSON.stringify({ keys: pedigreeNumbers }),
          });
          // console.log('批量删除请求:', JSON.stringify({ keys: pedigreeNumbers }));
          const result = await response.json();
          if (response.ok && result.success !== false) {
            message.success('批量删除成功');
            // 本地同步移除
            const newDataSource = dataSource.filter(
              item => !selectedRowKeys.includes(item.key)
            );
            setDataSource(newDataSource);
            setSelectedRowKeys([]);
          } else {
            message.error(result.message || '批量删除失败');
          }
        } catch (error) {
          message.error('批量删除失败，请重试');
        }
      },
    });
  };

  // 处理播种
  const handleSowing = (record: PurificationRecord) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      sowingTime: record.sowingTime ? moment(record.sowingTime) : moment(),
    });
    setSowingModalVisible(true);
  };

  // 处理播种确认
  const handleSowingConfirm = async () => {
    try {
      const values = await form.validateFields();
      if (!currentRecord) {
        message.error('未找到当前记录');
        return;
      }
      // 整合所有字段，优先表单填写内容
      const payload = {
        ...currentRecord,
        ...values,
        sowingTime: values.sowingTime ? values.sowingTime.format('YYYY-MM-DD') : '',
      };
      // console.log('播种数据:', payload);
      // POST到后端保存
      const response = await fetch('/api/Selfing/sow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok && result.success !== false) {
        message.success('播种成功');
        setSowingModalVisible(false);
        form.resetFields();
      } else {
        message.error(result.message || '播种失败');
      }
    } catch (error) {
      message.error('表单验证失败');
    }
  };

  // 处理Excel导入弹窗
  const handleImportExcel = async (formData: FormData) => {
    setUploading(true);
    try {
      const response = await fetch('/api/Selfing/ExcelImport', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('导入失败');
      }

      const result = await response.json();
      if (result && Array.isArray(result.data)) {
        // 保证每条数据的key唯一，优先用id，否则用时间戳+随机数
        const newData = result.data.map((item: any) => ({
          ...item,
          key: item.id ?? item.key ?? (Date.now() + Math.random()),
        }));
        setDataSource(prev => [...prev, ...newData]);
        message.success('导入成功');
        setImportModalOpen(false);
      } else {
        message.error('导入失败，后端未返回有效数据');
      }
    } catch (error) {
      console.error('导入失败:', error);
      message.error('导入失败，请检查文件格式');
    } finally {
      setUploading(false);
    }
  };

  // 行内编辑保存
  const handleSave = async (row: PurificationRecord) => {
    try {
      const response = await fetch('/api/Selfing/editSelfing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify(row),
      });
      const result = await response.json();
      if (response.ok && result.success !== false) {
        const newData = dataSource.map((item) => (item.key === row.key ? { ...item, ...row } : item));
        setDataSource(newData);
        message.success('保存成功');
        return true;
      } else {
        message.error(result.message || '保存失败');
        return false;
      }
    } catch (error) {
      message.error('保存失败，请重试');
      return false;
    }
  };

  const columns: ProColumns<PurificationRecord>[] = [
    {
      title: '系谱编号',
      dataIndex: 'pedigreeNumber',
      // 支持查询
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '编号',
      dataIndex: 'code',
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '品种名称',
      dataIndex: 'name',
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '引种方式',
      dataIndex: 'method',
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '品种类型',
      dataIndex: 'type',
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '是否常规',
      dataIndex: 'isRegular',
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '世代',
      dataIndex: 'generation',
      hideInTable: false,
      hideInSearch: false,
    },
    // {
    //   title: '播种数量',
    //   dataIndex: 'sowingAmount',
    //   hideInTable: false,
    //   hideInSearch: false,
    // },
    {
      title: '引种时间',
      dataIndex: 'introductionTime',
      valueType: 'dateRange', // 改为时间范围
      hideInTable: false,
      hideInSearch: false,
      editable: false,
      search: {
        transform: (value: any) => ({ introductionTimeRange: value }),
      },
      render: (text, record) =>
        record.introductionTime
          ? moment(record.introductionTime).format('YYYY-MM-DD')
          : '-',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record, __, action) => [
        <a
          key="edit"
          onClick={() => action?.startEditable?.(record.key)}
        >
          编辑
        </a>,
        <Button
          key="sowing"
          type="link"
          onClick={() => handleSowing(record)}
        >
          播种
        </Button>,
        <Button
          key="delete"
          type="link"
          danger
          onClick={() => handleDelete(record)}
        >
          删除
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<PurificationRecord>
        headerTitle="自交系纯化"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        form={{
          onValuesChange: (_: any, all: any) => setSearchValues(all),
        }}
        toolBarRender={() => [
          <Button
            key="import"
            icon={<UploadOutlined />}
            onClick={() => setImportModalOpen(true)}
          >
            导入Excel
          </Button>,
          <Button
            key="batchDelete"
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            批量删除
          </Button>,
        ]}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        dataSource={filteredData}
        onReset={() => setFilteredData(dataSource)}
        columns={columns}
        editable={{
          type: 'single',
          onSave: async (_, row) => handleSave(row),
        }}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          defaultPageSize: 10,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      {/* 导入Excel弹窗 */}
      <Modal
        title="导入Excel文件"
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={null}
        width={500}
      >
        <div style={{ marginBottom: 16 }}>
          <Alert
            message="导入说明"
            description={
              <div>
                <p>1. 请确保Excel文件格式正确，包含以下列：</p>
                <ul>
                  <li>系谱编号</li>
                  <li>编号</li>
                  <li>品种名称</li>
                  <li>引种方式</li>
                  <li>品种类型</li>
                  <li>是否常规</li>
                  <li>世代</li>
                  <li>引种时间</li>
                  <li>播种数量</li>
                  <li>播种时间</li>
                </ul>
                <p>2. 引种方式可选：购买、交换、赠送、其他</p>
                <p>3. 品种类型可选：西瓜、甜瓜、南瓜</p>
                <p>4. 是否常规可选：是、否</p>
                <p>5. 时间格式：YYYY-MM-DD</p>
                <p>6. 播种数量：必须为正整数</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => {
                // 下载模板文件
                const link = document.createElement('a');
                link.href = 'https://breed-1258140596.cos.ap-shanghai.myqcloud.com/Breeding%20Platform/%E8%87%AA%E4%BA%A4%E7%B3%BB%E7%BA%AF%E5%8C%96%E6%A8%A1%E5%9D%97-2.xlsx';
                link.download = 'https://breed-1258140596.cos.ap-shanghai.myqcloud.com/Breeding%20Platform/%E8%87%AA%E4%BA%A4%E7%B3%BB%E7%BA%AF%E5%8C%96%E6%A8%A1%E5%9D%97-2.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              style={{ fontSize: '16px' }}
            >
              下载Excel模板
            </Button>
          </div>
        </div>

        <Upload
          accept=".xlsx,.xls"
          showUploadList={false}
          customRequest={({ file, onSuccess, onError }) => {
            const formData = new FormData();
            formData.append('file', file as File);
            handleImportExcel(formData)
              .then(() => onSuccess?.(null))
              .catch((error) => onError?.(error));
          }}
        >
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={uploading}
            style={{ width: '100%', height: '40px' }}
          >
            {uploading ? '导入中...' : '选择文件并导入'}
          </Button>
        </Upload>
      </Modal>

      {/* 播种弹窗 */}
      <Modal
        title="播种"
        visible={sowingModalVisible}
        onCancel={() => {
          setSowingModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setSowingModalVisible(false);
            form.resetFields();
          }}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSowingConfirm}>
            播种
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            sowingAmount: 1,
          }}
        >
          <Form.Item
            name="code"
            label="系谱编号"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="code"
            label="编号"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="name"
            label="品种名称"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="method"
            label="引种方式"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="type"
            label="品种类型"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="isRegular"
            label="是否常规"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="generation"
            label="世代"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="sowingAmount"
            label="播种数量"
            rules={[{ required: true, message: '请输入播种数量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="sowingTime"
            label="播种时间"
            rules={[{ required: true, message: '请选择播种时间' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default PurificationList; 