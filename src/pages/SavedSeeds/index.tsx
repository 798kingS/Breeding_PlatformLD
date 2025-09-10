import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Space } from 'antd';
import { ExportOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useState, useRef } from 'react';
import * as dayjs from 'dayjs';

const SavedSeeds: React.FC = () => {
  const [savedSeedList, setSavedSeedList] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const actionRef = useRef<any>();
  const [filteredList, setFilteredList] = useState<any[]>([]);

  const token = localStorage.getItem('token');
  useEffect(() => {
    // 页面加载时从后端获取留种记录
    const fetchSavedSeeds = async () => {
      try {
        const response = await fetch('/api/seed/getReserve',
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (!response.ok) throw new Error('网络错误');
        const result = await response.json();
        // console.log('获取留种记录:', result);
        if (Array.isArray(result.data)) {
          setSavedSeedList(result.data);
        } else {
          setSavedSeedList([]);
        }
       } catch (error) {
         message.error('获取留种记录失败');
         setSavedSeedList([]);
       }
    };
    fetchSavedSeeds();
  }, []);

  useEffect(() => {
    setFilteredList(savedSeedList);
  }, [savedSeedList]);

  // 实时过滤逻辑
  const handleFormChange = (_: any, all: any) => {
    let data = savedSeedList;
    // 引种年份区间筛选
    const yearRange = (all as any).introductionYearRange;
    if (yearRange && Array.isArray(yearRange)) {
      const [start, end] = yearRange;
      data = data.filter(item => item.introductionYear >= start && item.introductionYear <= end);
    }
    // 留种时间区间筛选
    const reserveRange = (all as any).reserveTimeRange;
    if (reserveRange && Array.isArray(reserveRange)) {
      const [start, end] = reserveRange;
      data = data.filter(item => {
        const t = dayjs.default(item.reserveTime);
        return t.isAfter(dayjs.default(start).subtract(1, 'second')) && t.isBefore(dayjs.default(end).add(1, 'second'));
      });
    }
    Object.entries(all).forEach(([key, value]) => {
      if (!value) return;
      if (key === 'reserveTime' || key === 'introductionYear' || key === 'introductionYearRange' || key === 'reserveTimeRange') return;
      data = data.filter(item => (item[key] ?? '').toString().includes(value));
    });
    setFilteredList(data);
  };

  // 字段选项
  const breedingTypeOptions = [
    { label: '常规种', value: 'regular' },
    { label: '纯化', value: 'purification' },
  ];

  // 删除相关逻辑
  const handleDelete = async (key: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 假设后端用key为唯一标识
          const res = await fetch(`/api/seed/reservedelete?plantid=${key}`, { method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
           });
          const result = await res.json();
          if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
            const newList = savedSeedList.filter(item => item.key !== key);
            setSavedSeedList(newList);
            localStorage.setItem('savedSeeds', JSON.stringify(newList));
            message.success('记录已删除');
          } else {
            message.error(result?.msg || '删除失败');
          }
        } catch (e) {
          message.error('删除失败，请重试');
        }
      },
    });
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        // const plantids = JSON.stringify({ plantids: selectedRowKeys })
        try {
          const res = await fetch('/api/seed/BatchDeleteReserve', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
             },
            body: JSON.stringify({ keys: selectedRowKeys }),
          });
          // console.log('批量删除请求:', JSON.stringify({ keys: selectedRowKeys }));
          const result = await res.json();
          if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
            setSavedSeedList(savedSeedList.filter(item => !selectedRowKeys.includes(item.key)));
            setSelectedRowKeys([]);
            message.success(`已删除 ${selectedRowKeys.length} 条记录`);
          } else {
            message.error(result?.msg || '批量删除失败');
          }
        } catch (e) {
          message.error('批量删除失败，请重试');
        }
      },
    });
  };

  // ProTable columns
  const columns = [
    {
      title: '品种名称',
      dataIndex: 'varietyName',
      valueType: 'text',
      hideInTable: false,
      fieldProps: { placeholder: '请输入品种名称' },
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'text',
      fieldProps: { placeholder: '请输入类型' },
    },
    {
      title: '留种编号',
      dataIndex: 'seedNumber',
      valueType: 'text',
      fieldProps: { placeholder: '请输入留种编号' },
    },
    {
      title: '引种年份',
      dataIndex: 'introductionYear',
      valueType: 'dateYearRange', // 改为年份范围
      render: (_: any, record: any) => record.introductionYear ? record.introductionYear : '-',
      fieldProps: { placeholder: '请选择引种年份' },
      search: {
        transform: (value: any) => ({ introductionYearRange: value }),
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      valueType: 'text',
      fieldProps: { placeholder: '请输入来源' },
    },
    {
      title: '常规种/纯化',
      dataIndex: 'breedingType',
      valueType: 'select',
      valueEnum: breedingTypeOptions.reduce((acc: Record<string, { text: string }>, cur) => { acc[cur.value] = { text: cur.label }; return acc; }, {}),
      fieldProps: { placeholder: '请选择' },
    },
    {
      title: '种植年份',
      dataIndex: 'plantingYear',
      valueType: 'text',
      fieldProps: { placeholder: '请输入种植年份' },
    },
    {
      title: '抗性',
      dataIndex: 'texture',
      valueType: 'text',
      fieldProps: { placeholder: '请输入抗性' },
    },
    {
      title: '留种时间',
      dataIndex: 'reserveTime',
      valueType: 'dateTimeRange', // 改为时间范围
      render: (_: any, record: any) => record.reserveTime ? dayjs.default(record.reserveTime).format('YYYY-MM-DD HH:mm:ss') : '-',
      fieldProps: { placeholder: '请选择留种时间' },
      search: {
        transform: (value: any) => ({ reserveTimeRange: value }),
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      valueType: 'option',
      render: (_: any, record: any) => [
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.key)}
          key="delete"
        >
          删除
        </Button>
      ],
      hideInSearch: true,
    },
  ];

  const handleExport = () => {
    if (savedSeedList.length === 0) {
      message.warning('暂无留种记录');
      return;
    }

    // 创建CSV内容
    const headers = [
      '品种名称',
      '类型',
      '留种编号',
      '引种年份',
      '来源',
      '常规种/纯化',
      '种植年份',
      '抗性',
      '结果特征',
      '开花期/果实发育期',
      '留果个数',
      '产量',
      '果型',
      '皮色',
      '肉色',
      '单果重(g)',
      '肉厚(mm)',
      '糖度(°Brix)',
      '质地',
      '总体口感',
      '配合力',
      '留种时间'
    ];

    const csvContent = [
      headers.join(','),
      ...savedSeedList.map(item => [
        item.varietyName || '',
        item.type || '',
        item.seedNumber || '',
        item.introductionYear || '',
        item.source || '',
        item.breedingType || '',
        item.plantingYear || '',
        item.resistance || '',
        item.fruitCharacteristics || '',
        item.floweringPeriod || '',
        item.fruitCount || '',
        item.yield || '',
        item.fruitShape || '',
        item.skinColor || '',
        item.fleshColor || '',
        item.singleFruitWeight || '',
        item.fleshThickness || '',
        item.sugarContent || '',
        item.texture || '',
        item.overallTaste || '',
        item.combiningAbility || '',
        item.reserveTime ? '\t' + dayjs.default(item.reserveTime).format('YYYY-MM-DD HH:mm:ss') : ''
      ].join(','))
    ].join('\n');

    // 创建并下载文件
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', '留种记录.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 彻底重置数据的函数
  const handleReset = async () => {
    // 重新拉取后端数据
    try {
      const response = await fetch('/api/seed/getReserve', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('网络错误');
      const result = await response.json();
      if (Array.isArray(result.data)) {
        setSavedSeedList(result.data);
        setFilteredList(result.data);
      } else {
        setSavedSeedList([]);
        setFilteredList([]);
      }
    } catch (error) {
      setSavedSeedList([]);
      setFilteredList([]);
    }
    // 重置表单
    if (actionRef.current && actionRef.current.reset) {
      actionRef.current.reset();
    }
  };

  return (
    <PageContainer
      header={{
        title: '留种记录',
        extra: [
          <Space key="actions">
            <Button
              type="primary"
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              导出记录
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
          </Space>
        ],
      }}
    >
      <ProTable
        actionRef={actionRef}
        rowKey="key"
        columns={columns}
        dataSource={filteredList}
        onReset={() => setFilteredList(savedSeedList)} // 重置时恢复原始数据
        search={{
          labelWidth: 90,
          defaultCollapsed: true,
          collapseRender: (collapsed: boolean) => (collapsed ? '展开 ∨' : '收起 ∧'),
          filterType: 'query',
          resetText: '重置',
        }}
        form={{
          syncToUrl: false,
          onValuesChange: (changed, all) => {
            // 如果所有字段都为空，重置为全部数据
            const allEmpty = Object.values(all).every(v => !v || (Array.isArray(v) && v.length === 0));
            if (allEmpty) {
              handleReset();
            } else {
              handleFormChange(changed, all);
            }
          },
        }}
        toolBarRender={false}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        options={false}
        scroll={{ x: 1200 }}

      />
    </PageContainer>
  );
};

export default SavedSeeds; 
