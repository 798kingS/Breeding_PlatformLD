import React, { useState } from 'react';
import { Upload, Button, Image, Spin, message, Descriptions, Tag, Progress, Divider, Alert } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const PestDisease: React.FC = () => {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [result, setResult] = useState<any | null>(null);

	// 固定为仅识别“甜瓜靶斑病”，置信度≥98%
	const generateMockResult = () => {
		const probability = 98 + Math.floor(Math.random() * 3); // 98-100
		const description = '甜瓜靶斑病（Alternaria leaf spot）主要为叶部病害，病斑初呈水渍状小斑，后扩大为近圆形或不规则形，具同心轮纹，边缘褐色，中部灰褐色至灰白色，严重时病斑融合，叶片早枯脱落。多在温暖多湿、通风差时流行。';
		const symptoms = '叶片出现明显“靶纹”同心轮斑，周围黄晕，潮湿时病斑表面生有暗色霉层；中下部叶片先发病，自下而上扩展。';
		const factors = '18-28℃且空气湿度高、连阴雨、棚室通风不良、偏施氮肥、植株郁闭易诱发或加重。';
		const advice: string[] = [
			'及时清除并带出田外的病叶、残体，降低初侵染源。',
			'改善通风与光照：疏枝打叶，薄膜棚注意早晚通风，控制湿度。',
			'灌水宜小水勤浇，避免叶面长时间潮湿，清晨浇水更佳。',
			'营养均衡：控制氮肥，配合钾钙补充，提升叶片抗性。',
			'药剂防控（交替轮换用药，7-10天一次）：代森锰锌、嘧菌酯、吡唑醚菌酯、肟菌·戊唑醇、苯醚甲环唑等，均匀喷雾到位。'
		];
		return {
			diseaseName: '甜瓜靶斑病',
			probability: Math.min(100, probability),
			description,
			symptoms,
			factors,
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
			setTimeout(() => {
				const mock = generateMockResult();
				setResult(mock);
				setLoading(false);
				message.success('识别完成');
			}, 3600);
		}
  };

  const levelColor = (v: number) => (v >= 98 ? 'blue' : v >= 90 ? 'green' : 'orange');

  return (
    <div className="image-identify-container">
      <div className="image-identify-left">
        <div className="image-identify-title">病虫害图析</div>
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
                type="success"
                showIcon
                style={{ marginBottom: 12 }}
                message={
                  <span>
                    病害名称：<Tag color="red" style={{ marginRight: 8 }}>{result.diseaseName}</Tag>
                    识别概率：<Tag color={levelColor(result.probability)}>{result.probability}%</Tag>
                  </span>
                }
              />

              <Descriptions bordered size="middle" column={1} style={{ background: '#fff' }}>
                <Descriptions.Item label="病害简介">
                  {result.description}
                </Descriptions.Item>
                <Descriptions.Item label="症状特征">
                  {result.symptoms}
                </Descriptions.Item>
                <Descriptions.Item label="流行因素">
                  {result.factors}
                </Descriptions.Item>
                {/* <Descriptions.Item label="发生概率">
                  <Progress percent={Math.round(result.probability)} status="active" />
                </Descriptions.Item> */}
              </Descriptions>

              <Divider style={{ margin: '16px 0' }} />
              <b style={{ color: '#333' }}>管理建议（靶斑病）</b>
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
              {loading ? '识别中...' : '上传甜瓜叶片图片，自动识别是否为靶斑病'}
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default PestDisease;


