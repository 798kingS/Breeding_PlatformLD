// 种质资源管理
import { updateRule, saveSeedRecord } from '@/services/Breeding Platform/api';
import { PlusOutlined, ImportOutlined, ExportOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormSelect,
  ProFormDatePicker,
  ProFormDigit,
  ProTable,
} from '@ant-design/pro-components';
import { useIntl, useNavigate } from '@umijs/max';
import { Button, Drawer, message, Upload, Modal, Table, Space, Input, InputNumber, Popconfirm, Typography, Form } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';

// 播种记录类型定义
export interface SowingRecord {
  id: string;
  code: string;
  seedNumber: string;
  varietyName: string;
  sowingCount: number;
  planNumber: string;
  createTime: string;
}

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
// 定义一个异步函数handleUpdate，用于更新规则
// 定义一个异步函数handleUpdate，用于更新规则
const handleUpdate = async (fields: FormValueType) => {
  // 显示加载中提示
  const hide = message.loading('Configuring');
  try {
    // 调用updateRule函数，传入fields参数，更新规则
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    // 隐藏加载中提示
    hide();

    // 显示配置成功的提示
    message.success('成功配置');
    return true;
  } catch (error) {
    // 隐藏加载中提示
    hide();
    // 显示配置失败的提示
    message.error('配置失败，请重试！');
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */


// 批量删除与后端对接
// const handleRemove = async (selectedRows: API.RuleListItem[]) => {
//   const hide = message.loading('正在删除');
//   if (!selectedRows) return true;
//   try {
//     // 调用后端批量删除接口
//     await fetch('/api/seed/BatchDeleteSeed', {
//       method: 'DELETE',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ keys: selectedRows.map(row => row.key) }),
//     });
//     console.log('批量删除记录:', JSON.stringify([{ keys: selectedRows.map(row => row.key) }]));
//     await fetchTableData(); // 刷新表格数据
//     hide();
//     message.success('删除成功');
//     return true;
//   } catch (error) {
//     hide();
//     message.error('删除失败，请重试');
//     return false;
//   }
// };

const token = localStorage.getItem('token');
const handleGenerateReport = async () => {
  const existingRecords = localStorage.getItem('sowingRecords');
  const allRecords = existingRecords ? JSON.parse(existingRecords) : [];
  if (allRecords.length === 0) {
    message.warning('暂无播种记录');
    return;
  }
  try {
    const hide = message.loading('正在提交播种计划表...');
    // 只上传数据，不生成Excel
    const response = await fetch('/api/seed/sow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(allRecords),
    });
    if (!response.ok) {
      throw new Error('提交播种计划表失败');
    }
    hide();
    console.log(JSON.stringify(allRecords))
    message.success('播种计划表已提交并保存到数据库');
  } catch (error) {
    message.error('提交播种计划表失败，请重试');
  }
};

const TableList: React.FC = () => {
  const [form] = Form.useForm();
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [importModalOpen, handleImportModalOpen] = useState<boolean>(false);
  const [uploading, setUploading] = useState(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const [hybridModalOpen, setHybridModalOpen] = useState<boolean>(false);
  const [currentVariety, setCurrentVariety] = useState<API.RuleListItem>();
  const navigate = useNavigate();


  const [sowingModalOpen, setSowingModalOpen] = useState<boolean>(false);
  const [sowingList, setSowingList] = useState<any[]>([]);
  const [currentSowingRecord, setCurrentSowingRecord] = useState<API.RuleListItem>();

  const [editingKey, setEditingKey] = useState<string>('');
  const isEditing = (record: any) => record.id === editingKey;

  const [localPhoto1, setLocalPhoto1] = useState<string>('');
  const [localPhoto2, setLocalPhoto2] = useState<string>('');

  const handleEdit = (record: any) => {
    form.setFieldsValue({
      code: record.code,
      seedNumber: record.seedNumber,
      varietyName: record.varietyName,
      sowingCount: record.sowingCount,
      planNumber: record.planNumber,
    });
    setEditingKey(record.id);
  };

  const handleSave = async (record: any) => {
    try {
      const row = await form.validateFields();
      const newData = [...sowingList];
      const index = newData.findIndex(item => record.id === item.id);
      if (index > -1) {
        const updatedRecord = {
          ...newData[index],
          ...row,
          varietyName: newData[index].varietyName, // 保持品种名称不变
        };
        newData.splice(index, 1, updatedRecord);
        setSowingList(newData);
        // 更新localStorage
        localStorage.setItem('sowingRecords', JSON.stringify(newData));
        setEditingKey('');
        message.success('修改成功');
      }
    } catch (error) {
      console.error('Save failed:', error);
      message.error('修改失败，请检查输入');
    }
  };

  const handleCancel = () => {
    setEditingKey('');
  };

  // 更新编辑状态的类型
  interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: string;
    inputType: 'number' | 'text';
    record: SowingRecord;
    index: number;
    children: React.ReactNode;
  }
  const token = localStorage.getItem('token');

  // 更新可编辑单元格组件
  const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    inputType,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === 'number' ? (
      <InputNumber min={1} precision={0} />
    ) : (
      <Input />
    );

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `请输入${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const handleShowHybridization = async (record: API.RuleListItem) => {
    try {
      const token1 = localStorage.getItem('token');
      // 请求后端获取该品种的已配杂交品种
      const response = await fetch(`/api/seed/getMatched?varietyName=${encodeURIComponent(record.varietyName)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token1}`
        },
      });
      const result = await response.json();
      // console.log('Hybridization data:', result);
      
      // 处理后端返回的数据，将字段名映射到前端期望的格式
      let hybridizationList = [];
      if (Array.isArray(result.data)) {
        // 将后端字段名映射到前端期望的字段名
        hybridizationList = result.data.map((item: any) => ({
          id: item.sowingNumber || item.id, // 编号
          femaleNumber: item.femaleNumber, // 母本编号
          maleNumber: item.maleNumber, // 父本编号
          femaleName: item.femaleName, // 母本名称
          maleName: item.maleName, // 父本名称
          hybridization: item.hybridCombination || item.hybridization, // 杂交组合
          date: item.matchingTime || item.date // 配组日期
        }));
      } else if (result.data && typeof result.data === 'string' && result.data.trim() !== '') {
        // 处理字符串格式的数据（兼容旧格式）
        const hybridStrings = result.data.split('|').filter((str: string) => str.trim() !== '');
        hybridizationList = hybridStrings.map((hybridStr: string, index: number) => ({
          id: `hybrid-${record.varietyName}-${index}`,
          hybridization: hybridStr.trim(),
          femaleName: record.varietyName,
          maleName: hybridStr.trim().split('*')[1] || hybridStr.trim().split('*')[0] || '',
          femaleNumber: record.seedNumber,
          maleNumber: '',
          date: new Date().toISOString().split('T')[0]
        }));
      }
      
      // console.log('Processed hybridization data:', hybridizationList);
      
      // 合并杂交数据到当前品种
      const newRecord = {
        ...record,
        hybridizationList: hybridizationList
      };
      // console.log('New record with hybridization data:', newRecord);
      setCurrentVariety(newRecord);
      setHybridModalOpen(true);
    } catch (error) {
      console.error('获取杂交数据失败:', error);
      message.error('获取杂交数据失败');
    }
  };

  // 刷新当前品种的已配杂交数据（用于退回/删除后实时更新）
  const refreshCurrentVarietyHybrids = async () => {
    try {
      if (!currentVariety) return;
      const token1 = localStorage.getItem('token');
      const resp = await fetch(`/api/seed/getMatched?varietyName=${encodeURIComponent(currentVariety.varietyName || '')}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token1}`
        },
      });
      const resJson = await resp.json();
      let hybridizationList: any[] = [];
      if (Array.isArray(resJson.data)) {
        hybridizationList = resJson.data.map((item: any) => ({
          id: item.sowingNumber || item.id,
          femaleNumber: item.femaleNumber,
          maleNumber: item.maleNumber,
          femaleName: item.femaleName,
          maleName: item.maleName,
          hybridization: item.hybridCombination || item.hybridization,
          date: item.matchingTime || item.date,
        }));
      } else if (resJson.data && typeof resJson.data === 'string' && resJson.data.trim() !== '') {
        const hybridStrings = resJson.data.split('|').filter((str: string) => str.trim() !== '');
        hybridizationList = hybridStrings.map((hybridStr: string, index: number) => ({
          id: `hybrid-${currentVariety.varietyName}-${index}`,
          hybridization: hybridStr.trim(),
          femaleName: currentVariety.varietyName,
          maleName: hybridStr.trim().split('*')[1] || hybridStr.trim().split('*')[0] || '',
          femaleNumber: currentVariety.seedNumber,
          maleNumber: '',
          date: new Date().toISOString().split('T')[0]
        }));
      }
      setCurrentVariety({ ...currentVariety, hybridizationList });
    } catch (error) {
      console.error('刷新杂交数据失败:', error);
    }
  };


  const handleSowing = (record: API.RuleListItem) => {
    // 设置当前选中的记录
    setCurrentSowingRecord(record);

    // 从localStorage获取现有记录
    const existingRecords = localStorage.getItem('sowingRecords');
    const allRecords = existingRecords ? JSON.parse(existingRecords) : [];

    // 只显示与当前品种相关的记录
    const filteredRecords = allRecords.filter((item: any) =>
      item.seedNumber === record.seedNumber &&
      item.varietyName === record.varietyName
    );

    // 设置播种列表
    setSowingList(filteredRecords);

    // 打开模态框
    setSowingModalOpen(true);

    // 设置表单的初始值
    setTimeout(() => {
      form.setFieldsValue({
        code: `TZ-${record.key || 1}`,
        seedNumber: record.seedNumber || '',
        varietyName: record.varietyName || '',
        sowingCount: 0,
        planNumber: '',
      });
    }, 100);
  };

  const handleSowingSubmit = async (values: any) => {
    if (!currentSowingRecord) {
      message.error('未选择品种');
      return;
    }
    try {
      // 创建新的播种记录
      const newSowingRecord = {
        id: `SW-${Date.now()}`,
        code: values.code,
        seedNumber: currentSowingRecord.seedNumber || '',
        varietyName: currentSowingRecord.varietyName || '',
        sowingCount: values.sowingCount || 0,
        planNumber: values.planNumber || '',
        createTime: new Date().toISOString(),
      };
      // 本地保存
      const existingRecords = localStorage.getItem('sowingRecords');
      const allRecords = existingRecords ? JSON.parse(existingRecords) : [];
      allRecords.unshift(newSowingRecord);
      localStorage.setItem('sowingRecords', JSON.stringify(allRecords));
      // 只显示与当前品种相关的记录
      const filteredRecords = allRecords.filter((item: any) =>
        item.seedNumber === currentSowingRecord.seedNumber &&
        item.varietyName === currentSowingRecord.varietyName
      );
      setSowingList(filteredRecords);
      message.success('已添加到播种表');
      // 重置表单字段，但保留当前品种信息
      form.setFieldsValue({
        code: `TZ-${currentSowingRecord.key || 1}`,
        seedNumber: currentSowingRecord.seedNumber || '',
        varietyName: currentSowingRecord.varietyName || '',
        sowingCount: 0,
        planNumber: '',
      });
    } catch (error) {
      message.error('添加失败，请重试');
    }
  };

  // 更新播种弹窗的底部按钮
  const sowingModalFooter = [
    <Button key="cancel" onClick={() => {
      setSowingModalOpen(false);
      form.resetFields();
    }}>
      关闭
    </Button>,
    <Button
      key="generate"
      type="primary"
      icon={<ExportOutlined />}
      onClick={handleGenerateReport}
    >
      生成播种计划表
    </Button>
  ];

  // 更新保存函数
  const handleSaveSeed = async (record: API.RuleListItem) => {
    try {
      const savedRecord = {
        key: record.key,
        photo1: record.photo1 || '',
        photo2: record.photo2 || '',
        varietyName: record.varietyName || '',
        type: record.type || '',
        introductionYear: record.introductionYear || '',
        source: record.source || '',
        breedingType: record.breedingType || 'regular',
        seedNumber: record.seedNumber || '',
        plantingYear: record.plantingYear || '',
        resistance: record.resistance || '',
        fruitCharacteristics: record.fruitCharacteristics || '',
        floweringPeriod: record.floweringPeriod || '',
        fruitCount: record.fruitCount || 0,
        yield: record.yield || 0,
        fruitShape: record.fruitShape || '',
        skinColor: record.skinColor || '',
        fleshColor: record.fleshColor || '',
        singleFruitWeight: record.singleFruitWeight || 0,
        fleshThickness: record.fleshThickness || 0,
        sugarContent: record.sugarContent || 0,
        texture: record.texture || '',
        overallTaste: record.overallTaste || '',
        combiningAbility: record.combiningAbility || '',
        hybridization: record.hybridization || '',
        saveTime: record.reserveTime || '',
      };
      const res = await saveSeedRecord(savedRecord);
      console.log('Save seed response:', res);
      if (res && res.msg === 'SUCCESS') {
        message.success('已成功保存到留种页面');
      } else if (res && res.exists === true) {
        message.error('该种子已经在留种记录中');
      } else {
        message.error(res?.message || '保存失败，请重试！');
      }
    } catch (error) {
      message.error('保存失败，请重试');
    }
  };

  /**
   * 处理批量留种操作
   */
  const handleBatchSave = async (selectedRows: API.RuleListItem[]) => {
    const hide = message.loading('正在批量保存到留种页面');
    if (!selectedRows || selectedRows.length === 0) return true;
    console.log('Selected rows for batch save:', selectedRows);
    try {
      const response = await fetch('/api/seed/BatchReserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedRows),
      });
      const result = await response.json();
      hide();
      if (result && (result.msg === 'SUCCESS' || result.code === 200)) {
        message.success('批量保存成功');
      } else {
        message.error(result?.msg || '批量保存失败');
      }
      return true;
    } catch (error) {
      hide();
      message.error('批量保存失败，请重试');
      return false;
    }
  };

  const [tableData, setTableData] = useState<API.RuleListItem[]>([]);
  const [filteredData, setFilteredData] = useState<API.RuleListItem[]>([]); // 用于前端过滤显示

  const fetchTableData = async () => {
    try {
      const token1 = localStorage.getItem('token');
      const response = await fetch('/api/seed/getSeed', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token1}`
        },
      });
      const result = await response.json();
      // console.log('Fetched table data:', result);
      if (Array.isArray(result.data)) {
        // 为每个品种获取杂交数据
        const dataWithHybridization = await Promise.all(
          result.data.map(async (item: any) => {
            try {
              const hybridResponse = await fetch(`/api/seed/getSituation?varietyName=${encodeURIComponent(item.varietyName)}`, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token1}`
                },
              });
                             const hybridResult = await hybridResponse.json();
              //  console.log('Hybridization data:', hybridResult);
               
               // 处理后端返回的数据，将字段名映射到前端期望的格式
               let hybridizationList = [];
               if (Array.isArray(hybridResult.data)) {
                 // 将后端字段名映射到前端期望的字段名
                 hybridizationList = hybridResult.data.map((hybridItem: any) => ({
                   id: hybridItem.sowingNumber || hybridItem.id, // 编号
                   femaleNumber: hybridItem.femaleNumber, // 母本编号
                   maleNumber: hybridItem.maleNumber, // 父本编号
                   femaleName: hybridItem.femaleName, // 母本名称
                   maleName: hybridItem.maleName, // 父本名称
                   hybridization: hybridItem.hybridCombination || hybridItem.hybridization, // 杂交组合
                   date: hybridItem.matchingTime || hybridItem.date // 配组日期
                 }));
               } else if (hybridResult.data && typeof hybridResult.data === 'string' && hybridResult.data.trim() !== '') {
                 // 处理字符串格式的数据（兼容旧格式）
                 const hybridStrings = hybridResult.data.split('|').filter((str: string) => str.trim() !== '');
                 hybridizationList = hybridStrings.map((hybridStr: string, index: number) => ({
                   id: `hybrid-${item.varietyName}-${index}`,
                   hybridization: hybridStr.trim(),
                   femaleName: item.varietyName,
                   maleName: hybridStr.trim().split('*')[1] || hybridStr.trim().split('*')[0] || '',
                   femaleNumber: item.seedNumber,
                   maleNumber: '',
                   date: new Date().toISOString().split('T')[0]
                 }));
               }
               
              //  console.log(`品种 ${item.varietyName} 的杂交数据:`, hybridizationList);
               return {
                 ...item,
                 hybridizationList: hybridizationList
               };
            } catch (error) {
              console.error(`获取品种 ${item.varietyName} 的杂交数据失败:`, error);
              return {
                ...item,
                hybridizationList: []
              };
            }
          })
        );
        setTableData(dataWithHybridization); // 保存包含杂交数据的原始数据
        setFilteredData(dataWithHybridization); // 初始化显示数据
      } else {
        setTableData([]);
        setFilteredData([]);
      }
    } catch (error) {
      message.error('获取表格数据失败');
      setTableData([]);
      setFilteredData([]);
    }
  };
  useEffect(() => {
    fetchTableData();
  }, []);

  //批量删除
  const handleRemove = async (selectedRows: API.RuleListItem[]) => {
    const hide = message.loading('删除中', 0); // 0表示不会自动关闭
    if (!selectedRows) return true;
    try {
      // 调用后端批量删除接口
      await fetch('/api/seed/BatchDeleteSeed', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ keys: selectedRows.map(row => row.key) }),
      });
      // console.log('批量删除记录:', JSON.stringify([{ keys: selectedRows.map(row => row.key) }]));
      await fetchTableData(); // 刷新表格数据
      hide();
      message.success('删除成功');
      return true;
    } catch (error) {
      hide();
      message.error('删除失败，请重试');
      return false;
    }
  };

  const handleExportHybridization = async () => {
    if (!currentVariety) {
      message.warning('未选择品种');
      return;
    }
    
    const currentHybrids = Array.isArray(currentVariety.hybridizationList) ? currentVariety.hybridizationList : [];
    if (currentHybrids.length === 0) {
      message.warning('配组表为空');
      return;
    }

    // 前端直接导出为 CSV 文件
    try {
      const headers = ['编号','母本编号','父本编号','母本名称','父本名称','杂交组合','配组日期'];
      const rows = currentHybrids.map((h: any) => [
        h.id ?? '',
        h.femaleNumber ?? '',
        h.maleNumber ?? '',
        h.femaleName ?? '',
        h.maleName ?? '',
        h.hybridization ?? '',
        h.date ?? ''
      ]);

      // 生成 CSV 字符串（加入 BOM 以便 Excel 正确识别中文）
      const escapeCell = (cell: any) => {
        const str = String(cell ?? '');
        const needsQuote = str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r');
        const escaped = str.replace(/"/g, '""');
        return needsQuote ? `"${escaped}"` : escaped;
      };
      const csvContent = [headers, ...rows]
        .map(row => row.map(escapeCell).join(','))
        .join('\n');
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0,10);
      a.href = url;
      a.download = `${currentVariety.varietyName || '杂交配组表'}_${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('配组表已导出');
    } catch (e) {
      console.error('导出失败:', e);
      message.error('导出失败，请重试');
    }
  };

  const handleCreateHybridization = async (targetVariety: API.RuleListItem) => {
    if (!currentVariety || !targetVariety) return;

    const newHybrid = {
      femaleNumber: currentVariety.seedNumber,
      maleNumber: targetVariety.seedNumber,
      femaleName: currentVariety.varietyName,
      maleName: targetVariety.varietyName,
      hybridization: `${targetVariety.varietyName}*${currentVariety.varietyName}`,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await fetch('/api/seed/Hybridization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newHybrid),
      });
      // console.log(JSON.stringify(newHybrid))
      const result = await response.json();
      if (result.msg || result.code === 200) {
        message.success('已添加到杂交配组表');
        // 实时刷新：更新当前模态框中的已配杂交列表，并同步主表数据以刷新可选列表
        await refreshCurrentVarietyHybrids();
        await fetchTableData();
      } else {
        message.error(result?.msg || '添加失败');
      }
    } catch (error) {
      message.error('添加失败，请重试');
    }
  };

  const handleDeleteSowingRecord = (recordId: string) => {
    // 从localStorage获取现有记录
    const existingRecords = localStorage.getItem('sowingRecords');
    const allRecords = existingRecords ? JSON.parse(existingRecords) : [];

    // 过滤掉要删除的记录
    const updatedRecords = allRecords.filter((record: any) => record.id !== recordId);

    // 更新localStorage
    localStorage.setItem('sowingRecords', JSON.stringify(updatedRecords));

    // 更新当前显示的播种列表
    setSowingList(updatedRecords);

    message.success('删除成功');
  };

  const sowingColumns = [
    {
      title: '种植编号',
      dataIndex: 'code',
      editable: true,
      inputType: 'text',
    },
    {
      title: '编号',
      dataIndex: 'seedNumber',
      editable: true,
      inputType: 'text',
    },
    {
      title: '品种名称',
      dataIndex: 'varietyName',
      editable: false,
      inputType: 'text',
    },
    {
      title: '播种数量',
      dataIndex: 'sowingCount',
      editable: true,
      inputType: 'number',
    },
    {
      title: '计划编号',
      dataIndex: 'planNumber',
      editable: true,
      inputType: 'text',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_: any, record: SowingRecord) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => handleSave(record)}
              style={{ marginRight: 8 }}
            >
              保存
            </Typography.Link>
            <Popconfirm title="确定取消?" onConfirm={handleCancel}>
              <a>取消</a>
            </Popconfirm>
          </span>
        ) : (
          <Space>
            <Typography.Link
              disabled={editingKey !== ''}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Typography.Link>
            <Popconfirm
              title="确定要删除这条记录吗?"
              onConfirm={() => handleDeleteSowingRecord(record.id)}
            >
              <Typography.Link type="danger">
                删除
              </Typography.Link>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // 导入Excel后自动刷新表格
  const handleImportExcel = async (formData: FormData) => {
    setUploading(true);
    try {
      const response = await fetch('/api/seed/Seedimport', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(formData);
      if (!response.ok) throw new Error('导入失败');
      message.success('导入成功');
      fetchTableData(); // 导入成功后刷新表格
    } catch (error) {
      //   message.error('导入失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: '序号',
      dataIndex: 'key',
      valueType: 'text',
      width: 80,
      search: false,
      render: (text, record) => record.key,
      sorter: (a, b) => {
        const aKey = typeof a.key === 'number' ? a.key : parseInt(a.key, 10);
        const bKey = typeof b.key === 'number' ? b.key : parseInt(b.key, 10);
        if (!isNaN(aKey) && !isNaN(bKey)) return aKey - bKey;
        return String(a.key).localeCompare(String(b.key));
      },
    },
    {
      title: '品种名称',
      dataIndex: 'varietyName',
      valueType: 'text',
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'text',
      valueEnum: {
        '西瓜': { text: '西瓜' },
        '甜瓜': { text: '甜瓜' },
        '南瓜': { text: '南瓜' },
        '黄瓜': { text: '黄瓜' },
      },
      sorter: (a, b) => (a.type || '').localeCompare(b.type || ''),
    },
    {
      title: '引种年份',
      dataIndex: 'introductionYear',
      valueType: 'dateYearRange', // 改为年份范围
      sorter: (a, b) => (a.introductionYear || '').localeCompare(b.introductionYear || ''),
      render: (text, record) => record.introductionYear,
      search: {
        transform: (value) => {
          // value: [start, end]
          return {
            introductionYearRange: value,
          };
        },
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      valueType: 'text',
    },
    {
      title: '常规种/纯化',
      dataIndex: 'breedingType',
      valueType: 'select',
      valueEnum: {
        regular: { text: '常规种' },
        pure: { text: '纯化' },
      },
    },
    {
      title: '留种编号',
      dataIndex: 'seedNumber',
      valueType: 'text',
    },
    {
      title: '果型',
      dataIndex: 'fruitShape',
      valueType: 'text',
    },
    {
      title: '皮色',
      dataIndex: 'skinColor',
      valueType: 'text',
    },
    {
      title: '质地',
      dataIndex: 'texture',
      valueType: 'text',
    },
    {
      title: '杂交情况',
      dataIndex: 'hybridization',
      valueType: 'text',
      render: (_, record) => {
        // 从后端数据中获取当前品种的杂交组合
        const currentHybrids = Array.isArray(record.hybridizationList) ? record.hybridizationList : [];
        // console.log(`渲染品种 ${record.varietyName} 的杂交情况:`, currentHybrids);

        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {currentHybrids.length > 0 ? (
              <>
                <div>
                  {currentHybrids.map((hy: any) => (
                    <div key={hy.id} style={{ marginBottom: '4px' }}>
                      {hy.hybridization}
                    </div>
                  ))}
                </div>
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleShowHybridization(record)}
                >
                  继续杂交
                </Button>
              </>
            ) : (
              <Button
                type="link"
                onClick={() => handleShowHybridization(record)}
              >
                尚未杂交
              </Button>
            )}
          </Space>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 280,
      render: (_, record) => [
        <Button
          key="view"
          type="link"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          查看详情
        </Button>,
        <Button
          key="sowing"
          type="primary"
          onClick={() => {
            handleSowing(record);
          }}
        >
          播种
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={() => {
            handleSaveSeed(record as API.RuleListItem);
          }}
        >
          留种
        </Button>
      ],
    },
  ];

  const handleCollapseToggle = () => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };


  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.ku',
          defaultMessage: '种质资源库',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
          collapseRender: (collapsed: any, showCollapseButton: any) => {
            return showCollapseButton ? (
              <a
                style={{ fontSize: '14px', color: '#2E7D32' }}
                onClick={handleCollapseToggle}
              >
                {collapsed ? '展开' : '收起'} {collapsed ? <DownOutlined /> : <UpOutlined />}
              </a>
            ) : null;
          },
        }}
        form={{
          onValuesChange: (_, allValues) => {
            let data = [...tableData];
            Object.entries(allValues).forEach(([key, value]) => {
              if (!value) return;

              if (key === 'introductionYearRange' && Array.isArray(value)) {
                const [start, end] = value;
                if(start && end) {
                  data = data.filter(item => {
                    const year = item.introductionYear;
                    return year >= start && year <= end;
                  });
                }
                return;
              }

              data = data.filter(item => {
                const itemValue = (item as any)[key];
                if(itemValue) {
                  return itemValue.toString().toLowerCase().includes(value.toString().toLowerCase());
                }
                return false;
              });
            });
            setFilteredData(data);
          },
        }}
        onReset={() => {
          setFilteredData(tableData);
        }}
        toolBarRender={() => [
          <Button
            key="import"
            type="primary"
            icon={<ImportOutlined />}
            onClick={() => handleImportModalOpen(true)}
          >
            导入Excel
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> 新增
          </Button>,
        ]}
        dataSource={filteredData}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
          ],
        }}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          defaultPageSize: 10,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a style={{ fontWeight: 600, color: '#1890ff' }}>{selectedRowsState.length}</a>{' '}
              个品种
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              await handleBatchSave(selectedRowsState as API.RuleListItem[]);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量留种
          </Button>
          {/* <Button
            type="primary"
            onClick={async () => {
              await handleBatchSowing(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量播种
          </Button> */}
        </FooterToolbar>
      )}
      <ModalForm
        title="新增品种"
        width="800px"
        open={createModalOpen}
        onOpenChange={(open) => {
          handleModalOpen(open);
          if (!open) {
            // 关闭表单时重置本地图片URL
            setLocalPhoto1('');
            setLocalPhoto2('');
          }
        }}
        onFinish={async (value) => {
          try {
            // 提取图片URL地址，确保只包含URL字符串
            // console.log('表单提交的value:', value);
            // console.log('本地保存的图片URL - photo1:', localPhoto1);
            // console.log('本地保存的图片URL - photo2:', localPhoto2);
            const submitData = {
              ...value,
              photo1: localPhoto1,
              photo2: localPhoto2

            };
            // console.log('提交的数据:', submitData);

            const res = await fetch('/api/seed/addseed', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              },
              body: JSON.stringify(submitData),
            });

            // console.log('响应状态:', res.status);

            if (!res.ok) {
              const errorText = await res.text();
              console.error('请求失败:', res.status, errorText);
              message.error(`请求失败: ${res.status}`);
              return false;
            }

            const result = await res.json();
            // console.log('Add seed response:', result);

            if (result && (result.msg === 'SUCCESS' || result.code === 200 || result.success)) {
              // message.success('添加成功');
              await fetchTableData();
              handleModalOpen(false);
              message.success('添加成功');
              if (actionRef.current) actionRef.current.reload();
              return true;
            } else {
              message.error(result?.msg || result?.message || '添加失败');
              return false;
            }
          } catch (e) {
            console.error('添加种子失败:', e);
            message.error('添加失败，请重试');
            return false;
          }
        }}
      >
        <ProFormText
          label="品种名称"
          rules={[
            {
              required: true,
              message: '品种名称为必填项',
            },
          ]}
          width="md"
          name="varietyName"
        />
        <ProFormSelect
          label="类型"
          rules={[
            {
              required: true,
              message: '类型为必填项',
            },
          ]}
          width="md"
          name="type"
          options={[
            { label: '西瓜', value: '西瓜' },
            { label: '甜瓜', value: '甜瓜' },
            { label: '南瓜', value: '南瓜' },
            { label: '菜瓜', value: '菜瓜' },
          ]}
        />
        {/* 图片上传 - 支持上传最多两张图片 */}
        <Form.Item
          label="图片上传"
          name="photo1"
          rules={[{ required: true, message: '请上传第一张图片' }]}
        >
          <Upload
            name="file"
            listType="picture"
            maxCount={1}
            showUploadList={{ showRemoveIcon: true }}
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                const formData = new FormData();
                formData.append('file', file);
                console.log('file', file);
                // 调用后端上传接口
                const response = await fetch('/api/cos/upload', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  },
                  body: formData
                });
                // 检查响应状态
                if (!response.ok) {
                  const errorText = await response.text();
                  console.error('上传响应错误:', response.status, errorText);
                  throw new Error(`上传失败: ${response.status}`);
                }

                // 检查响应内容类型
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                  const errorText = await response.text();
                  console.error('响应不是JSON格式:', contentType, errorText);
                  throw new Error('服务器返回格式错误');
                }

                const result = await response.json();
                console.log('上传响应:', result);

                if (result.code === "0" && result.msg === "SUCCESS" && result.data) {
                  // 将返回的URL保存到photo1字段
                  form.setFieldsValue({ photo1: [result.data] });
                  setLocalPhoto1(result.data);
                  console.log('第一张图片URL已保存到本地状态:', result.data);
                  if (onSuccess) onSuccess({});
                  message.success('第一张图片上传成功');
                } else {
                  throw new Error(result.msg || '上传失败');
                }
              } catch (err) {
                console.error('图片上传失败:', err);
                message.error('图片上传失败，请重试');
                if (onError) onError(new Error('上传失败'));
              }
            }}
            onChange={info => {
              if (info.file.status === 'removed') {
                form.setFieldsValue({ photo1: '' });
                setLocalPhoto1('');
                console.log('第一张图片已从本地状态中删除');
              }
            }}
          >
            <Button>上传第一张图片</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="第二张图片"
          name="photo2"
        >
          <Upload
            name="file"
            listType="picture"
            maxCount={1}
            showUploadList={{ showRemoveIcon: true }}
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                const formData = new FormData();
                formData.append('file', file);
                console.log('file', file);
                // 调用后端上传接口
                const response = await fetch('/api/cos/upload', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  },
                  body: formData
                });

                // 检查响应状态
                if (!response.ok) {
                  const errorText = await response.text();
                  console.error('上传响应错误:', response.status, errorText);
                  throw new Error(`上传失败: ${response.status}`);
                }

                // 检查响应内容类型
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                  const errorText = await response.text();
                  console.error('响应不是JSON格式:', contentType, errorText);
                  throw new Error('服务器返回格式错误');
                }

                const result = await response.json();
                console.log('上传响应:', result);

                if (result.code === "0" && result.msg === "SUCCESS" && result.data) {
                  // 将返回的URL保存到photo2字段
                  setLocalPhoto2(result.data);
                  console.log('第二张图片URL已保存到本地状态:', result.data);
                  form.setFieldsValue({ photo2: result.data });
                  if (onSuccess) onSuccess({});
                  message.success('第二张图片上传成功');
                } else {
                  throw new Error(result.msg || '上传失败');
                }
              } catch (err) {
                console.error('图片上传失败:', err);
                message.error('图片上传失败，请重试');
                if (onError) onError(new Error('上传失败'));
              }
            }}
            onChange={info => {
              if (info.file.status === 'removed') {
                setLocalPhoto2('');
                console.log('第二张图片已从本地状态中删除');
                form.setFieldsValue({ photo2: '' });
              }
            }}
          >
            <Button>上传第二张图片（可选）</Button>
          </Upload>
        </Form.Item>
        <ProFormDatePicker
          label="引种年份"
          rules={[
            {
              required: true,
              message: '引种年份为必填项',
            },
          ]}
          width="md"
          name="introductionYear"
          fieldProps={{
            picker: 'year',
          }}
        />
        <ProFormText
          label="来源"
          rules={[
            {
              required: true,
              message: '来源为必填项',
            },
          ]}
          width="md"
          name="source"
        />
        <ProFormSelect
          label="常规种/纯化"
          rules={[
            {
              required: true,
              message: '常规种/纯化为必填项',
            },
          ]}
          width="md"
          name="breedingType"
          options={[
            { label: '常规种', value: 'regular' },
            { label: '纯化', value: 'pure' },
          ]}
        />
        <ProFormText
          label="留种编号"
          rules={[
            {
              required: true,
              message: '留种编号为必填项',
            },
          ]}
          width="md"
          name="seedNumber"
        />
        <ProFormDatePicker
          label="种植年份"
          rules={[
            {
              required: true,
              message: '种植年份为必填项',
            },
          ]}
          width="md"
          name="plantingYear"
          fieldProps={{
            picker: 'year',
          }}
        />
        <ProFormText
          label="抗性"
          width="md"
          name="resistance"
        />
        <ProFormText
          label="结果特征"
          width="md"
          name="fruitCharacteristics"
        />
        <ProFormText
          label="开花期/果实发育期"
          width="md"
          name="floweringPeriod"
        />
        <ProFormDigit
          label="留果个数"
          width="md"
          name="fruitCount"
          min={0}
        />
        <ProFormDigit
          label="产量"
          width="md"
          name="yield"
          min={0}
        />
        <ProFormText
          label="果型"
          width="md"
          name="fruitShape"
        />
        <ProFormText
          label="皮色"
          width="md"
          name="skinColor"
        />
        <ProFormText
          label="肉色"
          width="md"
          name="fleshColor"
        />
        <ProFormDigit
          label="单果重(g)"
          width="md"
          name="singleFruitWeight"
          min={0}
        />
        <ProFormDigit
          label="肉厚(mm)"
          width="md"
          name="fleshThickness"
          min={0}
        />
        <ProFormDigit
          label="糖度(°Brix)"
          width="md"
          name="sugarContent"
          min={0}
        />
        <ProFormText
          label="质地"
          width="md"
          name="texture"
        />
        <ProFormText
          label="总体口感"
          width="md"
          name="overallTaste"
        />
        <ProFormText
          label="配合力"
          width="md"
          name="combiningAbility"
        />
        <ProFormText
          label="父本"
          width="md"
          name="parentMale"
        />
        <ProFormText
          label="母本"
          width="md"
          name="parentFemale"
        />
      </ModalForm>
      <UpdateForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        updateModalOpen={updateModalOpen}
        values={currentRow || {}}
      />

      <Drawer
        width={800}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 16 }}>照片</h4>
              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                border: '1px solid #f0f0f0',
                borderRadius: '4px',
                padding: '16px',
                backgroundColor: '#fafafa'
              }}>
                {currentRow.photo1 ? (
                  <img
                    src={currentRow.photo1}
                    alt={`${currentRow.varietyName} - 图片1`}
                    style={{
                      maxWidth: '45%',
                      maxHeight: '400px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      console.error('图片1加载失败:', currentRow.photo1);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                {currentRow.photo2 ? (
                  <img
                    src={currentRow.photo2}
                    alt={`${currentRow.varietyName} - 图片2`}
                    style={{
                      maxWidth: '45%',
                      maxHeight: '400px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      console.error('图片2加载失败:', currentRow.photo2);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                {!currentRow.photo1 && !currentRow.photo2 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '200px',
                    color: '#999',
                    fontSize: '14px'
                  }}>
                    暂无图片
                  </div>
                )}
              </div>
            </div>
            <ProDescriptions<API.RuleListItem>
              column={2}
              title={currentRow?.varietyName}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.varietyName,
              }}
              columns={[
                {
                  title: '品种名称',
                  dataIndex: 'varietyName',
                },
                {
                  title: '类型',
                  dataIndex: 'type',
                },
                {
                  title: '引种年份',
                  dataIndex: 'introductionYear',
                },
                {
                  title: '来源',
                  dataIndex: 'source',
                },
                {
                  title: '常规种/纯化',
                  dataIndex: 'breedingType',
                  valueEnum: {
                    regular: { text: '常规种' },
                    pure: { text: '纯化' },
                  },
                },
                {
                  title: '留种编号',
                  dataIndex: 'seedNumber',
                },
                {
                  title: '种植年份',
                  dataIndex: 'plantingYear',
                },
                {
                  title: '抗性',
                  dataIndex: 'resistance',
                },
                {
                  title: '结果特征',
                  dataIndex: 'fruitCharacteristics',
                },
                {
                  title: '开花期/果实发育期',
                  dataIndex: 'floweringPeriod',
                },
                {
                  title: '留果个数',
                  dataIndex: 'fruitCount',
                },
                {
                  title: '产量',
                  dataIndex: 'yield',
                },
                {
                  title: '果型',
                  dataIndex: 'fruitShape',
                },
                {
                  title: '皮色',
                  dataIndex: 'skinColor',
                },
                {
                  title: '肉色',
                  dataIndex: 'fleshColor',
                },
                {
                  title: '单果重',
                  dataIndex: 'singleFruitWeight',
                  render: (val) => `${val}g`,
                },
                {
                  title: '肉厚',
                  dataIndex: 'fleshThickness',
                  render: (val) => `${val}mm`,
                },
                {
                  title: '糖度',
                  dataIndex: 'sugarContent',
                  render: (val) => `${val}°Brix`,
                },
                {
                  title: '质地',
                  dataIndex: 'texture',
                },
                {
                  title: '总体口感',
                  dataIndex: 'overallTaste',
                },
                {
                  title: '配合力',
                  dataIndex: 'combiningAbility',
                },
                {
                  title: '杂交情况',
                  dataIndex: 'hybridizationList',
                  render: (_: any, r: any) => {
                    const list = Array.isArray(r.hybridizationList) ? r.hybridizationList : [];
                    if (list.length === 0) return '-';
                    return (
                      <div>
                        {list.map((hy: any) => (
                          <div key={hy.id} style={{ marginBottom: 4 }}>{hy.hybridization}</div>
                        ))}
                      </div>
                    );
                  }
                }
              ]}
            />
          </>
        )}
      </Drawer>

      <Modal
        title={<div style={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px', margin: '-20px -24px 20px' }}>
          <span style={{ fontSize: '18px', fontWeight: 500 }}>导入Excel</span>
        </div>}
        open={importModalOpen}
        onOk={() => {
          handleImportModalOpen(false);
        }}
        onCancel={() => {
          handleImportModalOpen(false);
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
              window.open('https://breed-1258140596.cos.ap-shanghai.myqcloud.com/Breeding%20Platform/%E7%94%9C%E7%93%9C%E7%BA%AF%E7%B3%BB%E7%A7%8D%E8%B4%A8%E8%B5%84%E6%BA%90%E6%80%BB%E8%A1%A8-1.xlsx');
            }}
          >
            下载Excel模板
          </Button>
        </div>
      </Modal>

      <Modal
        title={<div style={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px', margin: '-20px -24px 20px' }}>
          <span style={{ fontSize: '18px', fontWeight: 500 }}>选择杂交品种</span>
        </div>}
        open={hybridModalOpen}
        onCancel={() => setHybridModalOpen(false)}
        width={1200}
        styles={{ body: { padding: '24px', maxHeight: '80vh', overflow: 'auto' } }}
        footer={[
          <Button key="cancel" onClick={() => setHybridModalOpen(false)}>
            关闭
          </Button>,
          <Button
            key="export"
            type="primary"
            icon={<ExportOutlined />}
            onClick={handleExportHybridization}
          >
            导出配组表
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ background: '#f6ffed', padding: '16px', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
            <h3 style={{ margin: '0', color: '#52c41a' }}>当前品种：{currentVariety?.varietyName}</h3>
          </div>

          {/* 已配杂交品种表格 */}
          <div style={{ background: '#fff', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#1890ff' }}>已配杂交品种</h3>
            <Table
              columns={[
                { title: '编号', dataIndex: 'id' },
                { title: '母本编号', dataIndex: 'femaleNumber' },
                { title: '父本编号', dataIndex: 'maleNumber' },
                { title: '母本名称', dataIndex: 'femaleName' },
                { title: '父本名称', dataIndex: 'maleName' },
                { title: '杂交组合', dataIndex: 'hybridization' },
                { title: '配组日期', dataIndex: 'date' },
                {
                  title: '操作',
                  dataIndex: 'operation',
                  render: (_, record) => (
                    <Space>
                      <Button
                        size="small"
                        onClick={async () => {
                          try {
                            // 调用后端API删除杂交记录
                            const response = await fetch(`/api/seed/hybridizationDelete?sowingnumbger=${record.id}`, {
                              method: 'DELETE',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                            });
                            const result = await response.json();
                            if (result.msg || result.code === 200) {
                              message.success('已退回该配组');
                              // 刷新当前模态框中的已配杂交列表
                              await refreshCurrentVarietyHybrids();
                              // 同步刷新主表以保持一致
                              await fetchTableData();
                            } else {
                              message.error(result?.msg || '退回失败');
                            }
                          } catch (error) {
                            message.error('退回失败，请重试');
                          }
                        }}
                      >退回</Button>
                      <Button
                        size="small"
                        onClick={() => {
                          // 跳转到杂交记录页面，仅查看当前播种编号对应的性状
                          const sowingNumber = record.id; // 此处 id 即播种编号
                          navigate(`/germplasm/hybrid-record?sowingNumber=${encodeURIComponent(sowingNumber)}`);
                        }}
                      >查看杂交性状</Button>
                    </Space>
                  ),
                },
              ]}
              dataSource={Array.isArray(currentVariety?.hybridizationList) ? currentVariety.hybridizationList : []}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              style={{ marginBottom: '24px' }}
            />
          </div>

          <div style={{ background: '#fff', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#1890ff' }}>可选杂交品种</h3>
            <Table
              columns={[
                {
                  title: '品种名称',
                  dataIndex: 'varietyName',
                },
                {
                  title: '留种编号',
                  dataIndex: 'seedNumber',
                },
                {
                  title: '类型',
                  dataIndex: 'type',
                },
                {
                  title: '操作',
                  render: (_, record) => (
                    <Button
                      type="primary"
                      onClick={() => handleCreateHybridization(record)}
                      disabled={record.key === currentVariety?.key}
                      size="middle"
                    >
                      选择作为配组
                    </Button>
                  ),
                },
              ]}
                             dataSource={tableData.filter(item => {
                 if (item.key === currentVariety?.key) return false;
                 // 排除和当前品种杂交过的组合，基于品种名称匹配
                 const used = Array.isArray(currentVariety?.hybridizationList) ? currentVariety.hybridizationList.some(hy =>
                   (hy.femaleName === currentVariety?.varietyName && hy.maleName === item.varietyName) ||
                   (hy.maleName === currentVariety?.varietyName && hy.femaleName === item.varietyName)
                 ) : false;
                 return !used;
               })}
              rowKey="key"
              pagination={{ pageSize: 5 }}
              style={{ marginBottom: '24px' }}
            />
          </div>

          <div style={{ background: '#fff', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#1890ff' }}>杂交配组表</h3>
            <Table
              columns={[
                {
                  title: '编号',
                  dataIndex: 'id',
                },
                {
                  title: '母本编号',
                  dataIndex: 'femaleNumber',
                },
                {
                  title: '父本编号',
                  dataIndex: 'maleNumber',
                },
                {
                  title: '母本名称',
                  dataIndex: 'femaleName',
                },
                {
                  title: '父本名称',
                  dataIndex: 'maleName',
                },
                {
                  title: '杂交组合',
                  dataIndex: 'hybridization',
                },
                {
                  title: '配组日期',
                  dataIndex: 'date',
                },
              ]}
              dataSource={Array.isArray(currentVariety?.hybridizationList) ? currentVariety.hybridizationList : []}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </div>
        </Space>
      </Modal>

      <Modal
        title={<div style={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px', margin: '-20px -24px 20px' }}>
          <span style={{ fontSize: '18px', fontWeight: 500 }}>种质资源播种表</span>
        </div>}
        open={sowingModalOpen}
        onCancel={() => {
          setSowingModalOpen(false);
          form.resetFields();
        }}
        footer={sowingModalFooter}
        width={900}
        styles={{ body: { padding: '24px', maxHeight: '80vh', overflow: 'auto' } }}
      >
        <div style={{ background: '#fafafa', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSowingSubmit}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                label="种植编号"
                name="code"
                rules={[{ required: true, message: '请输入种植编号' }]}
              >
                <Input size="large" placeholder="请输入种植编号" />
              </Form.Item>
              <Form.Item
                label="编号"
                name="seedNumber"
              >
                <Input size="large" disabled />
              </Form.Item>
              <Form.Item
                label="品种名称"
                name="varietyName"
              >
                <Input size="large" disabled />
              </Form.Item>
              <Form.Item
                label="播种数量"
                name="sowingCount"
                rules={[{ required: true, message: '请输入播种数量' }]}
              >
                <InputNumber
                  size="large"
                  min={1}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入播种数量"
                />
              </Form.Item>
              <Form.Item
                label="计划编号"
                name="planNumber"
                rules={[{ required: true, message: '请输入计划编号' }]}
              >
                <Input size="large" placeholder="请输入计划编号" />
              </Form.Item>
            </div>
            <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => {
                  form.validateFields()
                    .then(values => {
                      handleSowingSubmit(values);
                    })
                    .catch(info => {
                      console.log('Validate Failed:', info);
                    });
                }}
              >
                添加到播种表
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div style={{ background: '#fff', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1890ff' }}>播种记录列表</h3>
          <Form form={form} component={false}>
            <Table
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              bordered
              dataSource={sowingList}
              columns={sowingColumns}
              rowKey="id"
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Form>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default TableList;