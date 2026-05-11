'use client';

export default function Scroll() {
  const scrollToTop = () => {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const container = document.querySelector('.page-container');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.querySelector('.page-container')?.scrollHeight || 0
    );
    
    document.documentElement.scrollTo({ top: scrollHeight, behavior: 'smooth' });
    document.body.scrollTo({ top: scrollHeight, behavior: 'smooth' });
    const container = document.querySelector('.page-container');
    if (container) container.scrollTo({ top: scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="scroll-controls">
      <button onClick={scrollToTop} className="scroll-btn" aria-label="Наверх">↑</button>
      <button onClick={scrollToBottom} className="scroll-btn" aria-label="Вниз">↓</button>
    </div>
  );
}