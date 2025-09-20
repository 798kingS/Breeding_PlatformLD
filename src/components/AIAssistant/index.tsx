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
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
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
    return bestMatchName || '育小星';
  }, [location?.pathname]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setDragStartPosition({
        x: e.clientX,
        y: e.clientY,
      });
      setHasDragged(false);
      setIsDragging(true);
    }
  };

	// 触摸开始（平板/手机）
	const handleTouchStart = (e: React.TouchEvent) => {
		if (buttonRef.current && e.touches && e.touches.length > 0) {
			const touch = e.touches[0];
			const rect = buttonRef.current.getBoundingClientRect();
			setDragOffset({
				x: touch.clientX - rect.left,
				y: touch.clientY - rect.top,
			});
			setDragStartPosition({
				x: touch.clientX,
				y: touch.clientY,
			});
			setHasDragged(false);
			setIsDragging(true);
		}
	};

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      // 计算移动距离
      const deltaX = Math.abs(e.clientX - dragStartPosition.x);
      const deltaY = Math.abs(e.clientY - dragStartPosition.y);
      
      // 如果移动距离超过5像素，认为是拖动
      if (deltaX > 5 || deltaY > 5) {
        setHasDragged(true);
      }
      
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
    setHasDragged(false);
  };

	// 触摸移动与结束（使用原生事件，便于 preventDefault）
	const handleTouchMove = (e: TouchEvent) => {
		if (isDragging && e.touches && e.touches.length > 0) {
			// 阻止页面滚动
			e.preventDefault();
			const touch = e.touches[0];
			
			// 计算移动距离
			const deltaX = Math.abs(touch.clientX - dragStartPosition.x);
			const deltaY = Math.abs(touch.clientY - dragStartPosition.y);
			
			// 如果移动距离超过5像素，认为是拖动
			if (deltaX > 5 || deltaY > 5) {
				setHasDragged(true);
			}
			
			const newX = touch.clientX - dragOffset.x;
			const newY = touch.clientY - dragOffset.y;

			const maxX = window.innerWidth - 80;
			const maxY = window.innerHeight - 80;

			setPosition({
				x: Math.max(0, Math.min(newX, maxX)),
				y: Math.max(0, Math.min(newY, maxY)),
			});
		}
	};

	const handleTouchEnd = () => {
		setIsDragging(false);
		setHasDragged(false);
	};

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // 使用 { passive: false } 以便在移动过程中阻止页面滚动
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove as EventListener);
        document.removeEventListener('touchend', handleTouchEnd as EventListener);
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
          boxShadow: `
            0 8px 32px ${token.colorPrimary}40, 
            0 0 0 1px rgba(255,255,255,0.1),
            inset 0 2px 4px rgba(255,255,255,0.3),
            inset 0 -2px 4px rgba(0,0,0,0.2)
          `,
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isDragging ? 'scale(1.1) translateZ(10px)' : 'scale(1) translateZ(0px)',
          border: '3px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          perspective: '1000px',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.transform = 'scale(1.05) translateZ(5px)';
            e.currentTarget.style.boxShadow = `
              0 12px 40px ${token.colorPrimary}60, 
              0 0 0 1px rgba(255,255,255,0.2),
              inset 0 2px 4px rgba(255,255,255,0.4),
              inset 0 -2px 4px rgba(0,0,0,0.1)
            `;
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.transform = 'scale(1) translateZ(0px)';
            e.currentTarget.style.boxShadow = `
              0 8px 32px ${token.colorPrimary}40, 
              0 0 0 1px rgba(255,255,255,0.1),
              inset 0 2px 4px rgba(255,255,255,0.3),
              inset 0 -2px 4px rgba(0,0,0,0.2)
            `;
          }
        }}
        onClick={() => {
          if (!isDragging && !hasDragged) {
            setOpen(true);
            if (!hasInitialized) {
              setHasInitialized(true);
            }
          }
        }}
        title="育小星"
      >
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'bounce 2s infinite',
        }}>
          <img 
            src='https://breed-1258140596.cos.ap-shanghai.myqcloud.com/Breeding%20Platform/ai%E5%8A%A9%E6%89%8B.png'
            alt="育小星"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 20px rgba(255,255,255,0.2))',
              transform: 'perspective(1000px) rotateX(5deg) rotateY(5deg)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1.1)';
              e.currentTarget.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.4)) drop-shadow(0 0 30px rgba(255,255,255,0.3))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateX(5deg) rotateY(5deg) scale(1)';
              e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 20px rgba(255,255,255,0.2))';
            }}
          />
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
        styles={{ body: { padding: 0 } }}
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