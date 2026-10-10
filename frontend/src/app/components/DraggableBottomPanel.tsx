import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface DraggableBottomPanelProps {
  children: React.ReactNode;
  minHeight?: number;
  maxHeight?: number;
  defaultHeight?: number;
}

export function DraggableBottomPanel({ 
  children, 
  minHeight = 100, 
  maxHeight = 400, 
  defaultHeight = 250 
}: DraggableBottomPanelProps) {
  const [height, setHeight] = useState(defaultHeight);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(height);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartHeight(height);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaY = startY - e.clientY;
      const newHeight = startHeight + deltaY;
      
      // 限制高度范围
      const constrainedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
      setHeight(constrainedHeight);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      
      const deltaY = startY - e.touches[0].clientY;
      const newHeight = startHeight + deltaY;
      
      // 限制高度范围
      const constrainedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
      setHeight(constrainedHeight);
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
  }, [isDragging, startY, startHeight, minHeight, maxHeight]);

  const handleQuickAdjust = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      setHeight(maxHeight);
    } else {
      setHeight(minHeight);
    }
  };

  return (
    <div
      ref={panelRef}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 rounded-t-3xl shadow-2xl"
      style={{
        height: height,
        zIndex: 1000,
        touchAction: 'none',
        userSelect: 'none'
      }}
    >
      {/* Drag Handle */}
      <div
        className={`flex items-center justify-center py-3 cursor-grab active:cursor-grabbing ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex gap-1">
            <button
              onClick={() => handleQuickAdjust('down')}
              className="p-1 hover:bg-gray-100 rounded-full"
              disabled={height <= minHeight}
            >
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => handleQuickAdjust('up')}
              className="p-1 hover:bg-gray-100 rounded-full"
              disabled={height >= maxHeight}
            >
              <ChevronUp className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Content */}
      <div 
        className="overflow-y-auto px-4 pb-4"
        style={{ height: height - 60 }} // 减去拖拽手柄的高度
      >
        {children}
      </div>
    </div>
  );
}