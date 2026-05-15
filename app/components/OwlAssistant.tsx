'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import '../../styles/owl-assistant.css';

export function OwlAssistant() {
  const { data: session } = useSession();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('Привет! Спрашивай меня о стримере!');
  const [loading, setLoading] = useState(false);
  const [currentBlockLink, setCurrentBlockLink] = useState<string | null>(null);
  const [isPageLink, setIsPageLink] = useState(false);
  const [rehomeingQuestions, setRehomeingQuestions] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.email) return;
      
      try {
        const res = await fetch('/api/owl-chat/admin-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.user.email })
        });
        const data = await res.json();
        setIsAdmin(data.isAdmin);
        if (data.isAdmin) {
          setRehomeingQuestions(999);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, [session?.user?.email]);

  useEffect(() => {
    if (inputRef.current && !isCollapsed && isInitialized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isCollapsed, isInitialized]);

  const handleGoToLink = () => {
    if (!currentBlockLink) return;
    
    if (isPageLink) {
      window.location.href = currentBlockLink;
    } else if (currentBlockLink.startsWith('/#')) {
      const elementId = currentBlockLink.substring(2);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurrentBlockLink(null);
      }
    }
  };

  const detectCategory = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('возраст') || q.includes('лет')) return 'age';
    if (q.includes('расписание') || q.includes('когда стримит') || q.includes('график')) return 'schedule';
    if (q.includes('косплей') || q.includes('костюм') || q.includes('образ')) return 'cosplay';
    if (q.includes('соцсети') || q.includes('ссылки') || q.includes('телеграм') || q.includes('дискорд')) return 'socials';
    if (q.includes('мерч') || q.includes('купить') || q.includes('товар') || q.includes('кофе') || q.includes('худи')) return 'merch';
    if (q.includes('достижения') || q.includes('победа') || q.includes('турнир')) return 'achievements';
    if (q.includes('оборудование') || q.includes('пк') || q.includes('компьютер') || q.includes('микрофон')) return 'gear';
    return 'other';
  };

  const saveToAnalytics = (question: string, answer: string, category: string) => {
    try {
      const history = JSON.parse(localStorage.getItem('owl_analytics') || '[]');
      history.push({
        question,
        answer: answer.slice(0, 200),
        category,
        timestamp: Date.now(),
        date: new Date().toISOString()
      });
      if (history.length > 200) history.shift();
      localStorage.setItem('owl_analytics', JSON.stringify(history));
    } catch (e) {
      console.error('Analytics error:', e);
    }
  };

  const askQuestion = async (q: string) => {
    if (!q.trim()) return;
    
    setLoading(true);
    setAnswer('...');
    setCurrentBlockLink(null);
    
    try {
      const res = await fetch('/api/owl-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: q,
          email: session?.user?.email
        })
      });
      const data = await res.json();
      
      if (res.status === 429 || data.limitReached) {
        setAnswer(data.answer || 'Лимит вопросов на сегодня исчерпан. Возвращайся завтра!');
        setRehomeingQuestions(0);
        setLoading(false);
        return;
      }
      
      const answerText = data.answer || 'Не понял вопрос...';
      setAnswer(answerText);
      
      if (data.rehomeingQuestions !== undefined) {
        setRehomeingQuestions(data.rehomeingQuestions);
      }
      
      const category = detectCategory(q);
      saveToAnalytics(q, answerText, category);
      
      if (data.blockLink) {
        setCurrentBlockLink(data.blockLink);
        setIsPageLink(data.isPage || false);
      } else {
        setCurrentBlockLink(null);
      }
      
    } catch (error) {
      console.error('Ask question error:', error);
      setAnswer('Ошибка... Попробуй ещё раз!');
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  const quickQuestions = ['мерч', 'стримы', 'косплей'];

  if (!isInitialized) {
    return null;
  }

  return (
    <div className={`owl-assistant ${isCollapsed ? 'owl-collapsed' : ''}`}>
      
      <div className="owl-topbar">
        <button
          className="owl-toggle-btn"
          onClick={() => setIsCollapsed(v => !v)}
          aria-label={isCollapsed ? 'Развернуть' : 'Свернуть'}
        >
          {isCollapsed ? '↑' : '✕'}
        </button>
      </div>

      <div className="owl-body">
        <p className="owl-answer">
          {loading ? 'Думаю...' : answer}
        </p>
      </div>
      
      {currentBlockLink && (
        <div className="owl-goto">
          <button onClick={handleGoToLink} className="owl-goto-btn">
            Перейти и посмотреть →
          </button>
        </div>
      )}
      
      <div className="owl-buttons">
        {quickQuestions.map(q => (
          <button
            key={q}
            onClick={() => askQuestion(q)}
            className="owl-quick-btn"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="owl-limit">
        {rehomeingQuestions === 999 ? (
          'Админ — безлимит'
        ) : (
          `Осталось вопросов сегодня: ${rehomeingQuestions !== null ? rehomeingQuestions : '...'}/7`
        )}
      </div>
      
      <div className="owl-input-area">
        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askQuestion(question)}
          placeholder="Спроси что-нибудь..."
          className="owl-input"
        />
        <button
          onClick={() => askQuestion(question)}
          disabled={loading}
          className="owl-send-btn"
        >
          {loading ? '...' : '→'}
        </button>
      </div>
    </div>
  );
}