import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { sendAIMessage } from '@/app/services/aiApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function AIConsultPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '您好！我是您的AI医疗助手。我可以帮您解答健康问题、提供医疗建议和健康指导。请问有什么可以帮助您的吗？',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const history = messages
        .filter((message) => message.id !== 1)
        .map((message) => ({
          role: message.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: message.text,
        }));
      const aiText = await sendAIMessage(text, history);

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('AI chat failed:', error);

      const errorMessage: Message = {
        id: Date.now() + 1,
        text: `抱歉，AI 服务暂时不可用：${error?.message || '未知错误'}`,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    '感冒了怎么办？',
    '如何改善睡眠？',
    '高血压注意事项',
    '健康饮食建议',
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  return (
    <div className="h-dvh w-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 pb-24">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 pt-12 pb-4 flex-shrink-0 safe-area-inset-top shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2 rounded-xl flex-shrink-0 backdrop-blur-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold">智能小医生</h2>
            <p className="text-xs text-blue-100">在线 · 随时为您服务</p>
          </div>
        </div>
      </div>

      {/* Messages Area - 使用flex-1自适应高度 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-48 min-h-0">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'ai' && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl h-fit flex-shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${message.sender === 'user' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md' : 'bg-white text-gray-900 rounded-tl-sm shadow-sm'}`}>
                {message.sender === 'ai' ? (
                  <div className="text-sm leading-relaxed break-words [&_p]:mb-2 last:[&_p]:mb-0 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">{message.text}</p>
                )}
                <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>{message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>

              {message.sender === 'user' && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl h-fit flex-shrink-0 shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 justify-start">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl h-fit flex-shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">AI正在思考...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions - Show only at start and when enabled */}
      {messages.length === 1 && showQuickQuestions && (
        <div className="fixed bottom-52 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-blue-50 via-blue-50 to-transparent pt-4 pointer-events-none z-10">
          <div className="pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 animate-pulse" />
                <span className="text-sm text-gray-600 font-medium">快速咨询</span>
              </div>
              <button
                onClick={() => setShowQuickQuestions(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-left text-sm px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all hover:-translate-y-0.5"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area - Fixed at bottom, adjusted to avoid BottomNav overlap */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 p-5 pb-8 safe-area-inset-bottom flex-shrink-0 shadow-lg z-20">
        <div className="flex gap-2 items-end">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的健康问题..."
            className="flex-1 rounded-2xl h-12 text-base resize-none border-gray-200 focus:border-blue-500 transition-all"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            size="icon"
            className="h-12 w-12 rounded-2xl flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-3 whitespace-normal break-words">AI建议仅供参考，不能替代专业医疗诊断</p>
      </div>
    </div>
  );
}
