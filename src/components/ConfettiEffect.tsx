import { useEffect } from 'react';

export function ConfettiEffect({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (!trigger) return;

    // Create confetti elements
    const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#fbbf24', '#f59e0b'];
    const confettiCount = 50;

    const confettiElements: HTMLDivElement[] = [];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.opacity = '1';
      confetti.style.transform = 'rotate(0deg)';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      
      document.body.appendChild(confetti);
      confettiElements.push(confetti);

      // Animate
      const duration = 2000 + Math.random() * 1000;
      const endX = (Math.random() - 0.5) * 200;
      const endRotation = Math.random() * 720 - 360;
      
      confetti.animate([
        { 
          transform: `translate(0, 0) rotate(0deg)`,
          opacity: '1'
        },
        { 
          transform: `translate(${endX}px, ${window.innerHeight + 10}px) rotate(${endRotation}deg)`,
          opacity: '0'
        }
      ], {
        duration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });

      setTimeout(() => {
        confetti.remove();
      }, duration);
    }

    return () => {
      confettiElements.forEach(el => el.remove());
    };
  }, [trigger]);

  return null;
}
