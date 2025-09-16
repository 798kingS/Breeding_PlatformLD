import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Modal, theme } from 'antd';
import { useLocation } from 'umi';
import AIChat from '@/pages/AI/AIChat';
import routes from '../../../config/routes';

const AIAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasInitialized, setHasInitialized] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { token } = theme.useToken();
  const location = useLocation();

  const displayTitle = useMemo(() => {
    const pathname = location?.pathname || '';
    let bestMatchName: string | undefined;
    let bestMatchLen = -1;

    const dfs = (nodes: any[]) => {
      nodes?.forEach((n) => {
        if (n?.path) {
          const path: string = n.path;
          if (pathname.startsWith(path) && path.length > bestMatchLen && n?.name) {
            bestMatchName = n.name;
            bestMatchLen = path.length;
          }
        }
        if (n?.routes) dfs(n.routes);
      });
    };
    dfs(routes as any);
    return bestMatchName || 'AI 助手';
  }, [location?.pathname]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // 限制在视窗内
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <>
      <div
        ref={buttonRef}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
          boxShadow: `0 8px 32px ${token.colorPrimary}40, 0 0 0 1px rgba(255,255,255,0.1)`,
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isDragging ? 'scale(1.1)' : 'scale(1)',
          border: '3px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
        }}
        onMouseDown={handleMouseDown}
        onClick={() => {
          if (!isDragging) {
            setOpen(true);
            if (!hasInitialized) {
              setHasInitialized(true);
            }
          }
        }}
        title="AI 助手 "
      >
        <div style={{
          fontSize: 36,
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          animation: 'bounce 2s infinite',
        }}>
          🤖
        </div>
      </div>
      
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>

      <Modal
        title={null}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={880}
        styles={{
          mask: { backdropFilter: 'blur(2px)' },
          content: {
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            padding: 0,
          },
          body: { padding: 0 },
        }}
        bodyStyle={{ padding: 0 }}
        destroyOnClose
      >
        <div
          style={{
            height: 640,
            background: token.colorBgContainer,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              height: 52,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              borderBottom: `1px solid ${token.colorSplit}`,
              fontWeight: 600,
            }}
          >
            {displayTitle}
          </div>
          <div style={{ flex: 1, overflow: 'hidden', padding: 16 }}>
            <AIChat embedded hasInitialized={hasInitialized} />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AIAssistant;