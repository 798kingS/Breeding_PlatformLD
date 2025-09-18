import React from 'react';
import { PageContainer, ProCard, ProForm, ProFormText, ProFormSelect, ProFormSwitch } from '@ant-design/pro-components';
import { message } from 'antd';
import { useModel } from '@umijs/max';

const SettingsPage: React.FC = () => {
  const { setInitialState } = useModel('@@initialState');

  const applyTheme = (preset: string) => {
    // 预设主题与颜色映射
    const themes: any = {
      green: {
        navTheme: 'light',
        colorPrimary: '#2E7D32',
        token: {
          header: {
            colorBgHeader: '#f0f7f0',
            colorHeaderTitle: '#2E7D32',
            colorTextMenu: '#004D40',
            colorTextMenuSecondary: '#2E7D32',
            colorTextMenuSelected: '#00C853',
            colorBgMenuItemSelected: '#E8F5E9',
            colorTextMenuActive: '#00C853',
            colorTextRightActionsItem: '#2E7D32',
          },
          sider: {
            colorMenuBackground: '#FFFFFF',
            colorMenuItemDivider: '#E8F5E9',
            colorTextMenu: '#004D40',
            colorTextMenuSelected: '#00C853',
            colorTextMenuActive: '#00C853',
            colorBgMenuItemSelected: '#E8F5E9',
          },
        },
      },
      blue: {
        navTheme: 'light',
        colorPrimary: '#1677ff',
        token: {
          header: {
            colorBgHeader: '#f5f9ff',
            colorHeaderTitle: '#1677ff',
            colorTextMenu: '#1d39c4',
            colorTextMenuSecondary: '#1677ff',
            colorTextMenuSelected: '#0958d9',
            colorBgMenuItemSelected: '#e6f4ff',
            colorTextMenuActive: '#0958d9',
            colorTextRightActionsItem: '#1677ff',
          },
          sider: {
            colorMenuBackground: '#ffffff',
            colorMenuItemDivider: '#e6f4ff',
            colorTextMenu: '#1d39c4',
            colorTextMenuSelected: '#0958d9',
            colorTextMenuActive: '#0958d9',
            colorBgMenuItemSelected: '#e6f4ff',
          },
        },
      },
      purple: {
        navTheme: 'light',
        colorPrimary: '#722ed1',
        token: {
          header: {
            colorBgHeader: '#f8f5ff',
            colorHeaderTitle: '#722ed1',
            colorTextMenu: '#531dab',
            colorTextMenuSecondary: '#722ed1',
            colorTextMenuSelected: '#722ed1',
            colorBgMenuItemSelected: '#f1e6ff',
            colorTextMenuActive: '#531dab',
            colorTextRightActionsItem: '#722ed1',
          },
          sider: {
            colorMenuBackground: '#ffffff',
            colorMenuItemDivider: '#f1e6ff',
            colorTextMenu: '#531dab',
            colorTextMenuSelected: '#722ed1',
            colorTextMenuActive: '#722ed1',
            colorBgMenuItemSelected: '#f1e6ff',
          },
        },
      },
      dark: {
        navTheme: 'realDark',
        colorPrimary: '#177ddc',
        token: {},
      },
    };

    const next = themes[preset] || themes.green;
    setInitialState((s: any) => ({
      ...s,
      settings: {
        ...s?.settings,
        navTheme: next.navTheme,
        colorPrimary: next.colorPrimary,
        token: { ...(s?.settings?.token || {}), ...(next.token || {}) },
      },
    }));
  };

  return (
    <PageContainer>
      <ProCard>
        <ProForm
          layout="vertical"
          onFinish={async (values) => {
            if (values?.themePreset) {
              applyTheme(values.themePreset);
            }
            message.success('设置已保存');
            return true;
          }}
        >
          <ProFormText name="nickname" label="昵称" placeholder="请输入昵称" />
          <ProFormSelect
            name="themePreset"
            label="主题风格"
            tooltip="选择后立即应用全局主题色"
            valueEnum={{
              green: '生态绿',
              blue: '海岸蓝',
              purple: '科研紫',
              dark: '暗黑',
            }}
          />
          <ProFormSwitch name="mfa" label="开启二次验证（MFA）" />
        </ProForm>
      </ProCard>
    </PageContainer>
  );
};

export default SettingsPage;


