import React, { useEffect, useRef, useState } from 'react';

interface ChartFrameProps {
  minHeight?: number;
  children: (size: { width: number; height: number }) => React.ReactNode;
}

export function ChartFrame({ minHeight = 220, children }: ChartFrameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: minHeight });

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      const nextWidth = Math.max(element.clientWidth, 0);
      const nextHeight = Math.max(element.clientHeight, minHeight);

      setSize((currentSize) => {
        if (currentSize.width === nextWidth && currentSize.height === nextHeight) {
          return currentSize;
        }

        return {
          width: nextWidth,
          height: nextHeight,
        };
      });
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        updateSize();
      });

      resizeObserver.observe(element);

      return () => {
        resizeObserver.disconnect();
      };
    }

    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [minHeight]);

  return (
    <div ref={containerRef} className="h-full min-w-0 w-full" style={{ minHeight }}>
      {size.width > 0 ? children(size) : <div className="h-full w-full" style={{ minHeight }} />}
    </div>
  );
}
