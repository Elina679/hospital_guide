import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface DraggableStepsProps {
  steps: Array<{
    floor: string;
    description: string;
    distance: string;
  }>;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
}

export function DraggableSteps({ steps, onClose, initialPosition = { x: 16, y: 16 } }: DraggableStepsProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMinimized) return;
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMinimized) return;
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      setDragOffset({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isMinimized) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // 边界检测
      const maxX = window.innerWidth - 320; // 假设最大宽度320px
      const maxY = window.innerHeight - 200; // 假设最大高度200px
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || isMinimized || !e.touches[0]) return;
      
      const newX = e.touches[0].clientX - dragOffset.x;
      const newY = e.touches[0].clientY - dragOffset.y;
      
      // 边界检测
      const maxX = window.innerWidth - 320;
      const maxY = window.innerHeight - 200;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset, isMinimized]);

  return (
    <div
      ref={containerRef}
      className={`fixed bg-white border border-gray-200 rounded-2xl shadow-2xl ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${isMinimized ? 'w-auto h-auto' : 'w-80 max-w-[90vw]'}`}
      style={{
        left: position.x,
        top: position.y,
        zIndex: 1000,
        touchAction: 'none',
        userSelect: 'none'
      }}
    >
      {/* Header - Draggable Area */}
      <div
        className="flex items-center justify-between p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
          >
            {isMinimized ? '展开' : '收起'}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 max-h-96 overflow-y-auto">
          <h3 className="font-medium text-gray-900 mb-4">详细步骤</h3>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === 0 ? 'bg-green-100 text-green-700' :
                    index === steps.length - 1 ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200"></div>
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{step.floor}</span>
                    <span className="text-xs text-gray-500">{step.distance}</span>
                  </div>
                  <p className="text-sm text-gray-900">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}