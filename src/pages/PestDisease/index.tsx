import React, { useState } from 'react';
import { Upload, Button, Image, Spin, message, Descriptions, Tag, Progress, Divider, Alert } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const PestDisease: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  const generateMockResult = (file: File) => {
    const seed = (file.size % 113) + 7;
    const rand = (min: number, max: number) => {
      const r = (Math.sin(seed * 0.618 + min * 3.14 + max) + 1) / 2;
      return Math.round((min + (max - min) * r) * 10) / 10;
    };
    const disease = rand(5, 85); // 病害严重度 0-100
    const pest = rand(3, 80); // 虫害严重度 0-100
    const confidence = rand(75, 96);
    const leafSpot = rand(0, 100) > 60 ? rand(40, 90) : 0;
    const powderyMildew = rand(0, 100) > 60 ? rand(30, 85) : 0;
    const aphid = rand(0, 100) > 55 ? rand(20, 80) : 0;
    const whitefly = rand(0, 100) > 50 ? rand(20, 75) : 0;

    const suggest: string[] = [];
    if (disease > 50) suggest.push('病害较重，及时清理病叶并停止灌溉叶面。');
    if (leafSpot > 0) suggest.push('疑似叶斑病，建议使用含代森锰锌的药剂，间隔7-10天一次。');
    if (powderyMildew > 0) suggest.push('疑似白粉病，改善通风，使用含硫制剂或嘧菌酯。');
    if (pest > 40) suggest.push('虫害明显，建议设置黄板/蓝板并物理防控。');
    if (aphid > 0) suggest.push('疑似蚜虫，可选用吡虫啉等低毒药剂点喷。');
    if (whitefly > 0) suggest.push('疑似白粉虱，建议诱虫灯+选择性药剂。');
    if (suggest.length === 0) suggest.push('未发现明显病虫害，请继续日常巡查与监测。');

    return {
      disease,
      pest,
      confidence,
      leafSpot,
      powderyMildew,
      aphid,
      whitefly,
      suggest,
    };
  };

  const handleUpload = (info: any) => {
    if (info.file.status === 'done' || info.file.originFileObj) {
      const fileObj = info.file.originFileObj || info.file;
      const url = URL.createObjectURL(fileObj);
      setImageUrl(url);
      setResult(null);
      setLoading(true);
      setTimeout(() => {
        const mock = generateMockResult(fileObj as File);
        setResult(mock);
        setLoading(false);
        message.success('检测完成');
      }, 3600);
    }
  };

  const levelColor = (v: number) => (v < 20 ? 'green' : v < 50 ? 'orange' : 'red');

  return (
    <div className="image-identify-container">
      <div className="image-identify-left">
        <div className="image-identify-title">病虫害识别</div>
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
              <b style={{ color: '#1976d2', fontSize: 18, marginBottom: 12, display: 'block' }}>识别结果</b>

              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 12 }}
                message={
                  <span>
                    病害程度：<Tag color={levelColor(result.disease)}>{result.disease}%</Tag>
                    虫害程度：<Tag color={levelColor(result.pest)} style={{ marginLeft: 8 }}>{result.pest}%</Tag>
                    置信度：<Tag color="blue" style={{ marginLeft: 8 }}>{result.confidence}%</Tag>
                  </span>
                }
              />

              <Descriptions bordered size="middle" column={1} style={{ background: '#fff' }}>
                <Descriptions.Item label="叶斑病概率">
                  <Progress percent={Math.round(result.leafSpot)} status="active" />
                </Descriptions.Item>
                <Descriptions.Item label="白粉病概率">
                  <Progress percent={Math.round(result.powderyMildew)} strokeColor="#faad14" />
                </Descriptions.Item>
                <Descriptions.Item label="蚜虫风险">
                  <Progress percent={Math.round(result.aphid)} strokeColor="#52c41a" />
                </Descriptions.Item>
                <Descriptions.Item label="白粉虱风险">
                  <Progress percent={Math.round(result.whitefly)} strokeColor="#cb61f7" />
                </Descriptions.Item>
              </Descriptions>

              <Divider style={{ margin: '16px 0' }} />
              <b style={{ color: '#333' }}>管理建议</b>
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                {result.suggest.map((t: string, idx: number) => (
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
              {loading ? '识别中...' : '上传图片后自动开始病虫害识别，结果将显示在这里'}
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default PestDisease;


