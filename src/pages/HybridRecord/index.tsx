// 种质资源管理/杂交记录
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Upload } from 'antd';
import { ExportOutlined, ImportOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from '@umijs/max';
import * as dayjs from 'dayjs';

interface HybridRecord {
  key: string;
  sowingNumber: string;
  hybridizationNumber: string;
  femaleNumber: string;
  maleNumber: string;
  femaleName: string;
  maleName: string;
  type: string;
  controlVarieties: string;
  mating: string;
  growthScore: number;
  fruitAbility: string;
  pistilScore: number;
  powderyMildew: string;
  fruitShape: string;
  skinColor: string;
  flesh: string;
  appearanceScoring: number;
  copyingTime: string;
  cookabilityScore: number;
  texture: string;
  flavor: string;
  whetherPick: string;
  thickScore: number;
  singleWeight: number;
  outPut: number;
  centralSugar: number;
  tasteScore: number;
  sugar: number;
  hangingPeriod: string;
  averageWeight: number;
  averageSugar: number;

}

const HybridRecord: React.FC = () => {
  const [hybridList, setHybridList] = useState<HybridRecord[]>([]);
  const [filteredList, setFilteredList] = useState<HybridRecord[]>([]);
  const location = useLocation();
  const sowingNumberParam = useMemo(() => new URLSearchParams(location.search).get('sowingNumber'), [location.search]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem('token');

  // 加载数据的函数
  const loadHybridRecords = async () => {
    try {
      const response = await fetch('/api/seed/getHybridization', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('网络错误');
      const result = await response.json();
      // console.log('获取杂交记录:', result);
      if (Array.isArray(result.data)) {
        // 保证每条数据的key唯一
        const withKey = result.data.map((item: any, idx: number) => ({
          ...item,
          key: item.key || item.id || item.sowingNumber || (item.hybridNumber + '_' + idx),
        }));
        setHybridList(withKey);
      } else {
        setHybridList([]);
      }
    } catch (error) {
      console.error('获取杂交记录失败:', error);
      message.error('获取杂交记录失败');
      setHybridList([]);
    }
  };

  useEffect(() => {
    loadHybridRecords();
  }, []);

  useEffect(() => {
    if (sowingNumberParam) {
      setFilteredList(hybridList.filter(item => String(item.sowingNumber) === String(sowingNumberParam)));
    } else {
      setFilteredList(hybridList);
    }
  }, [hybridList, sowingNumberParam]);

  // 实时过滤逻辑
  const handleFormChange = (_: any, all: any) => {
    let data = hybridList;
    // 时间区间筛选
    const timeRange = (all as any).createTimeRange;
    if (timeRange && Array.isArray(timeRange)) {
      const [start, end] = timeRange;
      data = data.filter(item => {
        const t = dayjs.default(item.copyingTime);
        return t.isAfter(dayjs.default(start).subtract(1, 'second')) && t.isBefore(dayjs.default(end).add(1, 'second'));
      });
    }
    Object.entries(all).forEach(([key, value]) => {
      if (!value) return;
      if (key === 'createTime' || key === 'createTimeRange') return;
      data = data.filter(item => ((item as any)[key] ?? '').toString().includes(value));
    });
    if (sowingNumberParam) {
      data = data.filter(item => String(item.sowingNumber) === String(sowingNumberParam));
    }
    setFilteredList(data);
  };

  // 导入Excel功能
  const handleImportExcel = async (formData: FormData) => {
    setUploading(true);
    try {
      const response = await fetch('/api/seed/Hybridizationimport', {
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
      if (result.msg || result.code === 200) {
        message.success('导入成功');
        setImportModalOpen(false);
        // 重新加载数据
        loadHybridRecords();
      } else {
        message.error(result.message || '导入失败');
      }
    } catch (error) {
      console.error('导入失败:', error);
      message.error('导入失败，请检查文件格式');
    } finally {
      setUploading(false);
    }
  };

  const handleExport = () => {
    if (hybridList.length === 0) {
      message.warning('暂无杂交记录');
      return;
    }

    // 创建CSV内容
    const headers = [
      '播种编号', '杂交编号', '母本编号', '父本编号', '母本名称', '父本名称',
      '品种类型', '对照品种', '计划', '长势评分', '坐果能力', '枯萎评分',
      '白粉病', '果型', '皮色', '肉色', '外观评分', '控梢时间', '熟性评分',
      '质地', '风味', '是否难选', '肉厚评分', '糖度', '挂果期', '平均单瓜重',
      '总产量', '中心糖度', '原地', '风味', '口感评分', '是否发粘', '耐贮',
      '挂果期', '平均单瓜重'
    ];

    const csvContent = [
      headers.join(','),
      ...hybridList.map(item => [
        item.sowingNumber,
        item.hybridizationNumber,
        item.femaleNumber,
        item.maleNumber,
        item.femaleName,
        item.maleName,
        item.type,
        item.controlVarieties,
        item.mating,
        item.growthScore,
        item.fruitAbility,
        item.pistilScore,
        item.powderyMildew,
        item.fruitShape,
        item.skinColor,
        item.flesh,
        item.appearanceScoring,
        item.copyingTime,
        item.cookabilityScore,
        item.texture,
        item.flavor,
        item.whetherPick,
        item.thickScore,
        item.sugar,
        item.singleWeight,
        item.outPut,
        item.centralSugar,
        item.tasteScore,
        item.hangingPeriod,
        item.averageWeight,
        item.averageSugar
      ].join(','))
    ].join('\n');

    // 创建下载链接
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `杂交记录_${dayjs.default().format('YYYY-MM-DD_HH-mm-ss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('导出成功');
  };

  const columns = [
    {
      title: '播种编号',
      dataIndex: 'sowingNumber',
      valueType: 'text',
      fieldProps: { placeholder: '请输入播种编号' },
    },
    {
      title: '杂交编号',
      dataIndex: 'hybridizationNumber',
      valueType: 'text',
      fieldProps: { placeholder: '请输入杂交编号' },
    },
    {
      title: '母本编号',
      dataIndex: 'femaleNumber',
      valueType: 'text',
      fieldProps: { placeholder: '请输入母本编号' },
    },
    {
      title: '父本编号',
      dataIndex: 'maleNumber',
      valueType: 'text',
      fieldProps: { placeholder: '请输入父本编号' },
    },
    {
      title: '母本名称',
      dataIndex: 'femaleName',
      valueType: 'text',
      fieldProps: { placeholder: '请输入母本名称' },
    },
    {
      title: '父本名称',
      dataIndex: 'maleName',
      valueType: 'text',
      fieldProps: { placeholder: '请输入父本名称' },
    },
    {
      title: '品种类型',
      dataIndex: 'type',
      valueType: 'text',
      fieldProps: { placeholder: '请输入品种类型' },
    },
    {
      title: '对照品种',
      dataIndex: 'controlVarieties',
      valueType: 'text',
      fieldProps: { placeholder: '请输入对照品种' },
    },
    {
      title: '计划',
      dataIndex: 'mating',
      valueType: 'text',
      fieldProps: { placeholder: '请输入计划' },
    },
    {
      title: '长势评分',
      dataIndex: 'growthScore',
      valueType: 'digit',
      fieldProps: { placeholder: '请输入长势评分' },
    },
    {
      title: '坐果能力',
      dataIndex: 'fruitAbility',
      valueType: 'text',
      fieldProps: { placeholder: '请输入坐果能力' },
    },
    {
      title: '枯萎评分',
      dataIndex: 'blightScore',
      valueType: 'digit',
      fieldProps: { placeholder: '请输入枯萎评分' },
    },
    {
      title: '白粉病',
      dataIndex: 'powderyMildew',
      valueType: 'text',
      fieldProps: { placeholder: '请输入白粉病' },
    },
    {
      title: '果型',
      dataIndex: 'fruitShape',
      valueType: 'text',
      fieldProps: { placeholder: '请输入果型' },
    },
    {
      title: '皮色',
      dataIndex: 'skinColor',
      valueType: 'text',
      fieldProps: { placeholder: '请输入皮色' },
    },
    {
      title: '肉色',
      dataIndex: 'flesh',
      valueType: 'text',
      fieldProps: { placeholder: '请输入肉色' },
    },
    {
      title: '外观评分',
      dataIndex: 'appearanceScoring',
      valueType: 'digit',
      fieldProps: { placeholder: '请输入外观评分' },
    },
    {
      title: '考种时间',
      dataIndex: 'copyingTime',
      valueType: 'dateTimeRange',
      render: (_: any, record: any) => record.copyingTime ? dayjs.default(record.copyingTime).format('YYYY-MM-DD') : '-',
      fieldProps: { placeholder: '请选择考种时间' },
      search: {
        transform: (value: any) => ({ createTimeRange: value }),
      },
    },
    {
      title: '熟性评分',
      dataIndex: 'cookabilityScore',
      valueType: 'digit',
      fieldProps: { placeholder: '请输入熟性评分' },
    },
    {
      title: '质地',
      dataIndex: 'texture',
      valueType: 'text',
      fieldProps: { placeholder: '请输入质地' },
    },
    {
      title: '风味',
      dataIndex: 'flavor',
      valueType: 'text',
      fieldProps: { placeholder: '请输入风味' },
    },
    {
      title: '是否挑选',
      dataIndex: 'whetherPick',
      valueType: 'text',
      fieldProps: { placeholder: '请输入是否难选' },
    },
    {
      title: '肉厚评分',
      dataIndex: 'thickScore',
      valueType: 'digit',
      fieldProps: { placeholder: '请输入肉厚评分' },
    },
    {
      title: '单瓜重',
      dataIndex: 'singleWeight',
      valueType: 'digit',
      fieldProps: { placeholder: '请输入单瓜重' },
    },
    {
      title: '总产量',
      dataIndex: 'outPut',
      valueType: 'digit',
      fieldProps: { placeholder: '请输入总产量' },
    },
    {
      title: '中心糖度',
      dataIndex: 'centralSugar',
      valueType: 'digit',
      fieldProps: { placeholder: '请输入中心糖度' },
    },
    {
      title: '口感评分',
      dataIndex: 'tasteScore',
      valueType: 'digit',
      fieldProps: { placeholder: '请输入口感评分' },
    },
    {
      title: '糖度',
      dataIndex: 'sugar',
      valueType: 'digit',
      fieldProps: { placeholder: '请输入糖度' },
    },
    {
      title: '挂果期',
      dataIndex: 'hangingPeriod',
      valueType: 'text',
      fieldProps: { placeholder: '请输入挂果期' },
    },
    {
      title: '平均单瓜重',
      dataIndex: 'averageWeight',
      valueType: 'digit',
      fieldProps: { placeholder: '请输入平均单瓜重' },
    },
    {
      title: '平均糖度',
      dataIndex: 'averageSugar',
      valueType: 'digit',
      fieldProps: { placeholder: '请输入平均糖度' },

    },
  ];

  return (
    <PageContainer
      header={{
        title: '杂交记录',
      }}
    >
      {!sowingNumberParam && (
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<ImportOutlined />}
            onClick={() => setImportModalOpen(true)}
            style={{ marginRight: 8 }}
          >
            导入Excel
          </Button>
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={handleExport}
            disabled={hybridList.length === 0}
          >
            导出
          </Button>
        </div>
      )}
      <ProTable
        rowKey="key"
        columns={columns}
        dataSource={filteredList}
        onReset={() => setFilteredList(hybridList)} // 重置时恢复原始数据
        search={sowingNumberParam ? false : {
          labelWidth: 90,
          defaultCollapsed: true,
          collapseRender: (collapsed: boolean) => (collapsed ? '展开 ∨' : '收起 ∧'),
          filterType: 'query',
        }}
        form={{
          syncToUrl: false,
          onValuesChange: handleFormChange,
        }}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          defaultPageSize: 10,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        toolBarRender={false}
        scroll={{ x: 3000 }}
      />

      {/* 导入Excel弹窗 */}
      <Modal
        title={<div style={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px', margin: '-20px -24px 20px' }}>
          <span style={{ fontSize: '18px', fontWeight: 500 }}>导入Excel</span>
        </div>}
        open={importModalOpen}
        onOk={() => {
          setImportModalOpen(false);
        }}
        onCancel={() => {
          setImportModalOpen(false);
        }}
        confirmLoading={uploading}
        width={600}
        styles={{ body: { padding: '24px' } }}
      >
        <div style={{ background: '#fafafa', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={file => {
              const formData = new FormData();
              formData.append('file', file);
              handleImportExcel(formData);
              return false;
            }}
          >
            <Button icon={<ImportOutlined />} loading={uploading} disabled={uploading}>
              {uploading ? '上传中...' : '导入Excel'}
            </Button>
          </Upload>
        </div>

        <div style={{ background: '#f6ffed', padding: '16px', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
          <h4 style={{ color: '#52c41a', marginTop: 0 }}>注意事项：</h4>
          <ul style={{ color: '#666', marginBottom: 0 }}>
            <li>请使用标准Excel模板进行导入</li>
            <li>Excel文件大小不能超过10MB</li>
            <li>表格中的必填字段不能为空</li>
            <li>日期格式请使用YYYY-MM-DD格式</li>
          </ul>
        </div>
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={() => {
              window.open('https://breed-1258140596.cos.ap-shanghai.myqcloud.com/Breeding%20Platform/2025S%E6%9D%82%E4%BA%A4%E6%80%A7%E7%8A%B6%E8%A1%A8.xlsx');
            }}
          >
            下载Excel模板
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default HybridRecord;