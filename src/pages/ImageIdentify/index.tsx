import React, { useState } from 'react';
import { Upload, Button, Image, Spin, message, Descriptions, Tag, Progress, Divider, Alert } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './index.less';

// const { Paragraph } = Typography;

const ImageIdentify: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  // 生成前端模拟的生长状况结果（不含病虫害检测）
  const generateMockResult = (file: File) => {
    const seed = (file.size % 97) + 1; // 基于文件大小的简单“种子”
    const rand = (min: number, max: number) => {
      const r = (Math.sin(seed + min * 13 + max) + 1) / 2; // 0-1
      return Math.round((min + (max - min) * r) * 10) / 10;
    };
    const stageList = ['幼苗期', '营养生长期', '现蕾期', '开花期', '坐果期', '膨大期', '成熟期'];
    const stage = stageList[(seed % stageList.length)];
    const vigor = rand(60, 95);
    const leafHealth = rand(70, 98);
    const flowerSet = rand(50, 95);
    const nitrogen = rand(0.7, 1.3); // 1 为适宜
    const phosphorus = rand(0.7, 1.3);
    const potassium = rand(0.7, 1.3);
    const waterAdequacy = rand(60, 100);
    const tempStress = rand(0, 20);
    const comprehensive = Math.min(100, Math.round(
      vigor * 0.3 + leafHealth * 0.3 + flowerSet * 0.2 + waterAdequacy * 0.2
    ));

    // const nutrientText = (v: number) => (v < 0.9 ? '偏缺' : v > 1.1 ? '偏高' : '适宜');
    const advice: string[] = [];
    if (waterAdequacy < 75) advice.push('适当补灌，保持土壤见干见湿');
    if (nitrogen < 0.9) advice.push('追施含氮水溶肥，促进营养生长');
    if (potassium < 0.9) advice.push('增施钾肥，提升坐果与糖度');
    if (tempStress > 12) advice.push('采取遮阳/增温措施，降低温度胁迫');
    if (advice.length === 0) advice.push('整体长势良好，维持现有水肥与栽培管理');

    return {
      stage,
      vigor,
      leafHealth,
      flowerSet,
      nitrogen,
      phosphorus,
      potassium,
      waterAdequacy,
      tempStress,
      comprehensive,
      advice,
    };
  };

  const handleUpload = (info: any) => {
    if (info.file.status === 'done' || info.file.originFileObj) {
      const fileObj = info.file.originFileObj || info.file;
      const url = URL.createObjectURL(fileObj);
      setImageUrl(url);
      setResult(null);
      setLoading(true);

      // 前端模拟：2 秒“检测”后给出结果
      setTimeout(() => {
        const mock = generateMockResult(fileObj as File);
        setResult(mock);
        setLoading(false);
        message.success('检测完成');
      }, 3600);
    }
  };

  const scoreColor = (v: number) => (v >= 85 ? 'green' : v >= 70 ? 'orange' : 'red');
  const stressColor = (v: number) => (v < 8 ? 'green' : v < 15 ? 'orange' : 'red');

  return (
    <div className="image-identify-container">
      <div className="image-identify-left">
        <div className="image-identify-title">智苗慧眼</div>
        <div className="image-identify-upload">
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={({ onSuccess }) => {
              setTimeout(() => {
                if (onSuccess) onSuccess('ok');
              }, 0);
            }}
            onChange={handleUpload}
          >
            <Button type="primary" icon={<UploadOutlined />}>上传图片</Button>
          </Upload>
        </div>
        {imageUrl && (
          <div className="image-identify-preview">
            <Image
              src={imageUrl}
              alt="上传图片"
              style={{
                maxWidth: 360,
                borderRadius: 12,
                boxShadow: '0 4px 24px 0 rgba(33,150,243,0.10)',
                maxHeight: 300,
                objectFit: 'contain'
              }}
              preview
            />
          </div>
        )}
      </div>
      <div className="image-identify-right">
        <Spin spinning={loading} style={{ width: '100%' }}>
          {result ? (
            <div className="image-identify-ocr">
              <b style={{ color: '#1976d2', fontSize: 18, marginBottom: 12, display: 'block' }}>生长状况检测结果</b>

              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 12 }}
                message={
                  <span>
                    生长阶段：<Tag color="blue" style={{ marginRight: 8 }}>{result.stage}</Tag>
                    综合评分：<Tag color={scoreColor(result.comprehensive)}>{result.comprehensive}</Tag>
                  </span>
                }
              />

              <Descriptions bordered size="middle" column={1} style={{ background: '#fff' }}>
                <Descriptions.Item label="长势"><Progress percent={Math.round(result.vigor)} status="active" /></Descriptions.Item>
                <Descriptions.Item label="叶片健康度"><Progress percent={Math.round(result.leafHealth)} strokeColor="#52c41a" /></Descriptions.Item>
                
                <Descriptions.Item label="开花/坐果"><Progress percent={Math.round(result.flowerSet)} strokeColor="#faad14" /></Descriptions.Item>
                <Descriptions.Item label="营养诊断">
                  氮：<Tag color={result.nitrogen < 0.9 ? 'red' : result.nitrogen > 1.1 ? 'orange' : 'green'}>{result.nitrogen.toFixed(2)}（{result.nitrogen < 0.9 ? '偏缺' : result.nitrogen > 1.1 ? '偏高' : '适宜'}）</Tag>
                  磷：<Tag color={result.phosphorus < 0.9 ? 'red' : result.phosphorus > 1.1 ? 'orange' : 'green'}>{result.phosphorus.toFixed(2)}（{result.phosphorus < 0.9 ? '偏缺' : result.phosphorus > 1.1 ? '偏高' : '适宜'}）</Tag>
                  钾：<Tag color={result.potassium < 0.9 ? 'red' : result.potassium > 1.1 ? 'orange' : 'green'}>{result.potassium.toFixed(2)}（{result.potassium < 0.9 ? '偏缺' : result.potassium > 1.1 ? '偏高' : '适宜'}）</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="水分充足度"><Progress percent={Math.round(result.waterAdequacy)} strokeColor="#1890ff" /></Descriptions.Item>
                <Descriptions.Item label="温度胁迫"><Tag color={stressColor(result.tempStress)}>{result.tempStress}</Tag></Descriptions.Item>
              </Descriptions>

              <Divider style={{ margin: '16px 0' }} />
              <b style={{ color: '#333' }}>管理建议</b>
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                {result.advice.map((t: string, idx: number) => (
                  <li key={idx} style={{ lineHeight: '22px' }}>{t}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 300,
              width: 360,
              border: '1px dashed #ddd',
              borderRadius: 8,
              color: '#999'
            }}>
              {loading ? '检测中...' : '上传图片后自动开始检测，结果将显示在这里'}
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default ImageIdentify; 