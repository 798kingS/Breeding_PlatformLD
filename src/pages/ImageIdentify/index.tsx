import React, { useState } from 'react';
import { Upload, Button, Image, Spin, message, Descriptions, Tag, Progress, Divider, Alert } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './index.less';

// const { Paragraph } = Typography;

const ImageIdentify: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  // 生成前端模拟的生长状况结果（基于甜瓜作物特征）
  const generateMockResult = () => {
    // 根据图片判断为膨大期甜瓜
    const stage = '膨大期';
    
    // 基于图片观察的甜瓜生长状况
    const vigor = 88; // 长势良好
    const leafHealth = 85; // 叶片健康，有轻微黄化
    const fruitSet = 92; // 坐果情况优秀
    const fruitSize = 78; // 果实大小适中
    const fruitColor = 90; // 果实颜色良好
    const nitrogen = 1.1; // 氮素略高
    const phosphorus = 0.95; // 磷素略缺
    const potassium = 1.05; // 钾素适宜
    const calcium = 0.9; // 钙素略缺
    const waterAdequacy = 82; // 水分充足
    const tempStress = 5; // 温度胁迫较低
    const diseaseRisk = 15; // 病害风险较低
    const pestRisk = 8; // 虫害风险很低
    
    const comprehensive = Math.min(100, Math.round(
      vigor * 0.25 + leafHealth * 0.2 + fruitSet * 0.25 + fruitSize * 0.15 + waterAdequacy * 0.15
    ));

    const advice: string[] = [];
    if (nitrogen > 1.1) advice.push('氮素偏高，适当控制氮肥用量，避免徒长');
    if (phosphorus < 0.95) advice.push('增施磷肥，促进根系发育和果实品质提升');
    if (calcium < 0.9) advice.push('补充钙肥，预防果实裂果和脐腐病');
    if (fruitSize < 80) advice.push('加强水肥管理，促进果实膨大');
    if (diseaseRisk > 10) advice.push('注意通风透光，预防白粉病和霜霉病');
    if (advice.length === 0) advice.push('甜瓜长势良好，果实发育正常，维持现有管理措施');
    advice.push('建议适时采收，避免过熟影响品质');

    return {
      stage,
      vigor,
      leafHealth,
      fruitSet,
      fruitSize,
      fruitColor,
      nitrogen,
      phosphorus,
      potassium,
      calcium,
      waterAdequacy,
      tempStress,
      diseaseRisk,
      pestRisk,
      comprehensive,
      advice,
      cropType: '甜瓜',
      fruitCount: 3, // 根据图片观察到的果实数量
    };
  };

  const handleUpload = (info: any) => {
    if (info.file.status === 'done' || info.file.originFileObj) {
      const fileObj = info.file.originFileObj || info.file;
      const url = URL.createObjectURL(fileObj);
      setImageUrl(url);
      setResult(null);
      setLoading(true);

      // 前端模拟：2 秒"检测"后给出结果
      setTimeout(() => {
        const mock = generateMockResult();
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
              <b style={{ color: '#1976d2', fontSize: 18, marginBottom: 12, display: 'block' }}>甜瓜生长状况检测结果</b>

              <Alert
                type="success"
                showIcon
                style={{ marginBottom: 12 }}
                message={
                  <span>
                    作物类型：<Tag color="green" style={{ marginRight: 8 }}>{result.cropType}</Tag>
                    生长阶段：<Tag color="blue" style={{ marginRight: 8 }}>{result.stage}</Tag>
                    果实数量：<Tag color="orange" style={{ marginRight: 8 }}>{result.fruitCount}个</Tag>
                    综合评分：<Tag color={scoreColor(result.comprehensive)}>{result.comprehensive}</Tag>
                  </span>
                }
              />

              <Descriptions bordered size="middle" column={1} style={{ background: '#fff' }}>
                <Descriptions.Item label="植株长势"><Progress percent={Math.round(result.vigor)} status="active" /></Descriptions.Item>
                <Descriptions.Item label="叶片健康度"><Progress percent={Math.round(result.leafHealth)} strokeColor="#52c41a" /></Descriptions.Item>
                <Descriptions.Item label="坐果情况"><Progress percent={Math.round(result.fruitSet)} strokeColor="#faad14" /></Descriptions.Item>
                <Descriptions.Item label="果实大小"><Progress percent={Math.round(result.fruitSize)} strokeColor="#722ed1" /></Descriptions.Item>
                <Descriptions.Item label="果实颜色"><Progress percent={Math.round(result.fruitColor)} strokeColor="#eb2f96" /></Descriptions.Item>
                
                <Descriptions.Item label="营养诊断">
                  氮：<Tag color={result.nitrogen < 0.9 ? 'red' : result.nitrogen > 1.1 ? 'orange' : 'green'}>{result.nitrogen.toFixed(2)}（{result.nitrogen < 0.9 ? '偏缺' : result.nitrogen > 1.1 ? '偏高' : '适宜'}）</Tag>
                  磷：<Tag color={result.phosphorus < 0.9 ? 'red' : result.phosphorus > 1.1 ? 'orange' : 'green'}>{result.phosphorus.toFixed(2)}（{result.phosphorus < 0.9 ? '偏缺' : result.phosphorus > 1.1 ? '偏高' : '适宜'}）</Tag>
                  钾：<Tag color={result.potassium < 0.9 ? 'red' : result.potassium > 1.1 ? 'orange' : 'green'}>{result.potassium.toFixed(2)}（{result.potassium < 0.9 ? '偏缺' : result.potassium > 1.1 ? '偏高' : '适宜'}）</Tag>
                  钙：<Tag color={result.calcium < 0.9 ? 'red' : result.calcium > 1.1 ? 'orange' : 'green'}>{result.calcium.toFixed(2)}（{result.calcium < 0.9 ? '偏缺' : result.calcium > 1.1 ? '偏高' : '适宜'}）</Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="水分充足度"><Progress percent={Math.round(result.waterAdequacy)} strokeColor="#1890ff" /></Descriptions.Item>
                <Descriptions.Item label="温度胁迫"><Tag color={stressColor(result.tempStress)}>{result.tempStress}°C</Tag></Descriptions.Item>
                <Descriptions.Item label="病害风险"><Tag color={result.diseaseRisk < 10 ? 'green' : result.diseaseRisk < 20 ? 'orange' : 'red'}>{result.diseaseRisk}%</Tag></Descriptions.Item>
                <Descriptions.Item label="虫害风险"><Tag color={result.pestRisk < 10 ? 'green' : result.pestRisk < 20 ? 'orange' : 'red'}>{result.pestRisk}%</Tag></Descriptions.Item>
              </Descriptions>

              <Divider style={{ margin: '16px 0' }} />
              <b style={{ color: '#333' }}>甜瓜管理建议</b>
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