import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      links={[
        {
          key: '深溯育种云平台',
          title: '深溯育种云平台',
          href: 'https://mp.weixin.qq.com/s/P6-1IkzYlDRi_Qxylx_94Q',
          blankTarget: true,
        },

      ]}
    />
  );
};

export default Footer;
