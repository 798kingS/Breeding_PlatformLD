import React, { useMemo, useRef, useState } from 'react';
import { Upload, Button, Spin, Typography, Descriptions, Tag, Progress, Divider, Alert } from 'antd';
import { UploadOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

const VideoIdentify: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const generateMockFromVideo = (file: File) => {
    const seed = (file.size % 131) + 3;
    const r01 = (x: number) => (Math.sin(seed * 17 + x * 29) + 1) / 2;
    const rnd = (min: number, max: number, i: number) => Math.round((min + (max - min) * r01(i)) * 10) / 10;
    const stageList = ['幼苗期', '营养生长期', '现蕾期', '开花期', '坐果期', '膨大期', '成熟期'];
    const stage = stageList[seed % stageList.length];
    const vigor = rnd(65, 96, 1);
    const uniformity = rnd(60, 94, 2); // 群体一致性
    const density = rnd(70, 110, 3); // 群体密度指数
    const diseaseRisk = rnd(0, 28, 4);
    const pestRisk = rnd(0, 22, 5);
    const blossomRate = rnd(40, 92, 6);
    const irrigationAdequacy = rnd(55, 100, 7);
    const fertilizerBalance = rnd(60, 98, 8);
    const comprehensive = Math.min(100, Math.round(
      vigor * 0.25 + (100 - diseaseRisk) * 0.15 + (100 - pestRisk) * 0.1 + uniformity * 0.2 + blossomRate * 0.15 + irrigationAdequacy * 0.15
    ));
    const advice: string[] = [];
    if (uniformity < 75) advice.push('建议补栽或进行整枝抹芽，提升群体一致性');
    if (irrigationAdequacy < 70) advice.push('适当增加灌溉频次，保持均匀湿润');
    if (diseaseRisk > 18) advice.push('连阴高湿条件下注意病害预警，及时喷施生物防治制剂');
    if (pestRisk > 15) advice.push('使用诱捕板监测虫情，必要时采用绿色防控');
    if (blossomRate < 60) advice.push('适度控梢并补钾，促进开花坐果');
    if (advice.length === 0) advice.push('整体状况良好，维持当前水肥与栽培策略');
    return { stage, vigor, uniformity, density, diseaseRisk, pestRisk, blossomRate, irrigationAdequacy, fertilizerBalance, comprehensive, advice };
  };

  const handleUpload = (info: any) => {
    if (info.file.status === 'done' || info.file.originFileObj) {
      const fileObj = info.file.originFileObj || info.file;
      const url = URL.createObjectURL(fileObj);
      setVideoUrl(url);
      setResult(null);
      setLoading(true);
      setTimeout(() => {
        const mock = generateMockFromVideo(fileObj as File);
        setResult(mock);
        setLoading(false);
      }, 7200);
    }
  };

  const riskColor = (v: number) => (v < 10 ? 'green' : v < 20 ? 'orange' : 'red');
  const scoreColor = (v: number) => (v >= 85 ? 'green' : v >= 70 ? 'orange' : 'red');

  return (
    <div style={{ display: 'flex', gap: 24, padding: 16 }}>
      <div>
        <div style={{ marginBottom: 12, fontSize: 18, fontWeight: 500 }}>病虫害影踪</div>
        <Upload
          accept="video/*"
          showUploadList={false}
          customRequest={({ onSuccess }) => { setTimeout(() => onSuccess && onSuccess('ok'), 0); }}
          onChange={handleUpload}
        >
          <Button type="primary" icon={<UploadOutlined />}>上传视频</Button>
        </Upload>
        {videoUrl && (
          <div style={{ marginTop: 16 }}>
            <video ref={videoRef} src={videoUrl} style={{ width: 420, borderRadius: 8 }} controls />
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <Button icon={<PlayCircleOutlined />} onClick={() => videoRef.current?.play()}>播放</Button>
              <Button icon={<PauseCircleOutlined />} onClick={() => videoRef.current?.pause()}>暂停</Button>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <Spin spinning={loading}>
          {result ? (
            <div>
              <b style={{ color: '#1976d2', fontSize: 18, marginBottom: 12, display: 'block' }}>群体病虫害状况</b>
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 12 }}
                message={<>
                  生长阶段：<Tag color="blue">{result.stage}</Tag>
                  综合评分：<Tag color={scoreColor(result.comprehensive)}>{result.comprehensive}</Tag>
                </>}
              />
              <Descriptions bordered size="middle" column={1}>
                <Descriptions.Item label="群体长势"><Progress percent={Math.round(result.vigor)} status="active" /></Descriptions.Item>
                <Descriptions.Item label="一致性"><Progress percent={Math.round(result.uniformity)} strokeColor="#52c41a" /></Descriptions.Item>
                <Descriptions.Item label="密度指数"><Tag color="geekblue">{result.density}</Tag></Descriptions.Item>
                <Descriptions.Item label="病害风险"><Tag color={riskColor(result.diseaseRisk)}>{result.diseaseRisk}%</Tag></Descriptions.Item>
                <Descriptions.Item label="虫害风险"><Tag color={riskColor(result.pestRisk)}>{result.pestRisk}%</Tag></Descriptions.Item>
                <Descriptions.Item label="开花/坐果"><Progress percent={Math.round(result.blossomRate)} strokeColor="#faad14" /></Descriptions.Item>
                <Descriptions.Item label="灌溉充足度"><Progress percent={Math.round(result.irrigationAdequacy)} strokeColor="#1890ff" /></Descriptions.Item>
                <Descriptions.Item label="施肥均衡度"><Progress percent={Math.round(result.fertilizerBalance)} strokeColor="#722ed1" /></Descriptions.Item>
              </Descriptions>

              <Divider />
              <b>管理建议</b>
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                {result.advice.map((t: string, i: number) => (
                  <li key={i} style={{ lineHeight: '22px' }}>{t}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{
              height: 320,
              border: '1px dashed #ddd',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999'
            }}>
              {loading ? '视频检测中...' : '上传视频后自动开始检测，结果将显示在这里'}
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default VideoIdentify;


