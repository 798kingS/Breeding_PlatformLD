import React, { useState, useRef, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, List, message, theme } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useLocation } from 'umi';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { queryAI } from '@/services/Breeding Platform/api';
import 'github-markdown-css/github-markdown.css';
import styles from './index.less';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface LocationState {
  sessionId?: string;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface AIChatProps {
  embedded?: boolean;
  hasInitialized?: boolean;
}

const AIChat: React.FC<AIChatProps> = ({ embedded, hasInitialized }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const isComposingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const sessionId = (location.state as LocationState)?.sessionId;
  const { token } = theme.useToken();

  // 自动滚动到底部
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  useEffect(() => {
    // 如果有sessionId，从历史记录中加载对话
    if (sessionId) {
      const history = localStorage.getItem('chatHistory');
      if (history) {
        const sessions = JSON.parse(history);
        const currentSession = sessions.find((s: any) => s.id === sessionId);
        if (currentSession) {
          setMessages(currentSession.messages);
        }
      }
    }
  }, [sessionId]);

  useEffect(() => {
    // 首次打开悬浮窗时，添加欢迎消息（逐字显示）
    if (hasInitialized && messages.length === 0 && !sessionId) {
      const welcomeText = '您好，这里是育小星，请问有什么可以帮到您的？';
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
      setIsTyping(true);
      
      // 逐字显示效果
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex < welcomeText.length) {
          setMessages(prev => [{
            ...prev[0],
            content: welcomeText.substring(0, currentIndex + 1)
          }]);
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 50); // 每50ms显示一个字符
    }
  }, [hasInitialized, sessionId]);

  useEffect(() => {
    // scrollToBottom();
  }, [messages]);

  // 保存聊天记录
  const saveChatHistory = (newMessages: ChatMessage[]) => {
    const history = localStorage.getItem('chatHistory');
    let sessions = history ? JSON.parse(history) : [];

    if (sessionId) {
      // 更新现有会话
      sessions = sessions.map((session: any) => {
        if (session.id === sessionId) {
          return {
            ...session,
            messages: newMessages,
            lastMessage: newMessages[newMessages.length - 1].content
          };
        }
        return session;
      });
    } else {
      // 创建新会话
      const newSession = {
        id: uuidv4(),
        messages: newMessages,
        createdAt: Date.now(),
        lastMessage: newMessages[newMessages.length - 1].content
      };
      sessions.unshift(newSession); // 添加到开头
    }

    localStorage.setItem('chatHistory', JSON.stringify(sessions));
  };

  // 处理发送消息
  const handleSend = async () => {
    const text = inputRef.current?.value || '';
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (inputRef.current) inputRef.current.value = '';
    setLoading(true);

    try {
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await queryAI(apiMessages);

      if (response.success && response.data) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.data,
          timestamp: Date.now(),
        };
        const newMessages = [...updatedMessages, aiMessage];
        setMessages(newMessages);
        saveChatHistory(newMessages);
      } else {
        message.error(response.error || '获取AI回复失败');
      }
    } catch (error) {
      message.error('发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) {
      e.preventDefault();
      handleSend();
    }
  };

  // 渲染markdown内容
  const renderMessageContent = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          code: ({ inline, className, children, ...props }: CodeProps) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={tomorrow}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const ChatShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (embedded) {
      return <>{children}</>;
    }
    return <PageContainer>{children}</PageContainer>;
  };

  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
      <ChatShell>
        <div className={`${styles['chat-container']} ${embedded ? styles['embedded'] : ''}`}>
        <div 
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
            backgroundColor: token.colorFillTertiary,
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={(item) => (
              <List.Item 
                style={{
                  border: 'none',
                  padding: '8px 0',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    flexDirection: item.role === 'user' ? 'row-reverse' : 'row',
                    width: '100%',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      background: item.role === 'user' 
                        ? `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`
                        : `linear-gradient(135deg, #389e0d 0%,rgb(24, 58, 7) 100%)`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      border: '3px solid rgba(255,255,255,0.8)',
                    }}
                  >
                    {item.role === 'user' ? (
                      '👤'
                    ) : (
                      <img 
                        src='https://breed-1258140596.cos.ap-shanghai.myqcloud.com/Breeding%20Platform/ai%E5%8A%A9%E6%89%8B.png'
                        alt="育小星"
                        style={{
                          width: '32px',
                          height: '32px',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                        }}
                      />
                    )}
                  </div>
                  <div 
                    style={{ 
                      backgroundColor: item.role === 'user' ? `${token.colorPrimaryBg}` : `${token.colorFillSecondary}`,
                      color: '#333', 
                      borderRadius: '16px', 
                      padding: '16px 20px', 
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                      border: `1px solid ${item.role === 'user' ? `${token.colorPrimaryBorder}` : `${token.colorBorder}`}`,
                      maxWidth: '70%',
                      position: 'relative',
                    }}
                  >
                    {item.role === 'user' ? (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div>
                    ) : (
                      <div className={`${styles['markdown-content']} markdown-body`}>
                        {renderMessageContent(item.content)}
                        {isTyping && item === messages[messages.length - 1] && (
                          <span style={{ 
                            display: 'inline-block',
                            width: '8px',
                            height: '16px',
                            backgroundColor: '#1890ff',
                            marginLeft: '2px',
                            animation: 'blink 1s infinite'
                          }} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </div>

        <div 
          style={{
            padding: '20px',
            backgroundColor: token.colorFillQuaternary,
            borderTop: `1px solid ${token.colorBorder}`,
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => (isComposingRef.current = true)}
            onCompositionEnd={() => (isComposingRef.current = false)}
            placeholder="请输入您的问题..."
            rows={3}
            style={{ 
              flex: 1, 
              resize: 'vertical', 
              borderRadius: '20px', 
              padding: '16px 20px', 
              border: `2px solid ${token.colorBorder}`, 
              outline: 'none',
              fontSize: '14px',
              lineHeight: '1.5',
              backgroundColor: token.colorBgContainer,
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = token.colorPrimary;
              e.target.style.boxShadow = `0 4px 16px ${token.colorPrimary}25`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = token.colorBorder;
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
            }}
            autoFocus
            autoComplete="off"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            style={{
              height: '48px',
              borderRadius: '24px',
              padding: '0 24px',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: `0 4px 12px ${token.colorPrimary}4D`,
              border: 'none',
            }}
          >
            发送
          </Button>
        </div>
      </div>
    </ChatShell>
    </>
  );
};

export default AIChat; 