import React, { useEffect, useRef } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorGlow = cursorGlowRef.current;
    
    if (!cursor || !cursorGlow) return;

    const moveCursor = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      
      cursor.style.transform = `translate(${x - 10}px, ${y - 10}px)`;
      cursorGlow.style.transform = `translate(${x - 20}px, ${y - 20}px)`;
    };

    const handleMouseEnter = () => {
      cursor.style.transform += ' scale(1.3)';
      cursorGlow.style.transform += ' scale(1.3)';
    };

    const handleMouseLeave = () => {
      cursor.style.transform = cursor.style.transform.replace(' scale(1.3)', '');
      cursorGlow.style.transform = cursorGlow.style.transform.replace(' scale(1.3)', '');
    };

    // Add event listeners
    document.addEventListener('mousemove', moveCursor);
    
    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div ref={cursorGlowRef} className="cursor-glow" />
      <div ref={cursorRef} className="cursor" />
    </>
  );
};

export default CustomCursor;