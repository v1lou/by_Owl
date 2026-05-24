// components/StreamsSection.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../styles/streams-section.css';
import { useTranslation } from 'react-i18next';

interface StreamEvent {
  id: string;
  date: Date;
  time: string;
  game: string;
  title: string;
  isTwitch?: boolean;
  isLive?: boolean;
  isPast?: boolean;
  duration?: string;
  url?: string;
}

interface StreamsSectionProps {
  isAdmin?: boolean;
  isEditMode?: boolean;
}

export default function StreamsSection({ isAdmin = false, isEditMode = false }: StreamsSectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [localEvents, setLocalEvents] = useState<StreamEvent[]>([]);
  const [twitchEvents, setTwitchEvents] = useState<StreamEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ time: '', game: '', title: '' });

  const { t } = useTranslation();
  const canEdit = isAdmin || isEditMode;

  // Загрузка Twitch VOD
  useEffect(() => {
    const fetchTwitchStreams = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/twitch');
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) return;

        const data = await response.json();
        if (!data.success || !data.data) return;

        const formatted: StreamEvent[] = data.data.map((stream: any) => {
          const utcDate = new Date(stream.start_time);

          const mskDateStr = utcDate.toLocaleDateString('ru-RU', {
            timeZone: 'Europe/Moscow',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
          const mskTimeStr = utcDate.toLocaleTimeString('ru-RU', {
            timeZone: 'Europe/Moscow',
            hour: '2-digit',
            minute: '2-digit',
          });

          const [day, month, year] = mskDateStr.split('.');
          const eventDate = new Date(Number(year), Number(month) - 1, Number(day));

          return {
            id: stream.id,
            date: eventDate,
            time: mskTimeStr,
            game: stream.game_name || '',
            title: stream.title,
            isTwitch: true,
            isLive: stream.is_live || false,
            isPast: stream.is_past || false,
            duration: stream.duration,
            url: stream.url,
          };
        });

        setTwitchEvents(formatted);
      } catch (error) {
        console.error('Twitch fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTwitchStreams();
  }, []);

  // Локальные события из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('streamEvents');
    if (saved) {
      setLocalEvents(JSON.parse(saved, (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
      }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('streamEvents', JSON.stringify(localEvents));
  }, [localEvents]);

  // Вычисляем минимальную и максимальную дату для навигации
  const { minDate, maxDate, initialDate } = useMemo(() => {
    const allDates = [...twitchEvents, ...localEvents].map(e => e.date);
    
    if (allDates.length === 0) {
      return {
        minDate: undefined,
        maxDate: undefined,
        initialDate: new Date()
      };
    }
    
    const min = new Date(Math.min(...allDates.map(d => d.getTime())));
    const max = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    min.setDate(1);
    max.setMonth(max.getMonth() + 1);
    max.setDate(0);
    
    return {
      minDate: min,
      maxDate: max,
      initialDate: min
    };
  }, [twitchEvents, localEvents]);

  // Устанавливаем начальную дату при загрузке
  useEffect(() => {
    if (initialDate && !selectedDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  const addEvent = () => {
    if (newEvent.time && newEvent.title) {
      setLocalEvents([...localEvents, {
        id: Date.now().toString(),
        date: selectedDate,
        time: newEvent.time,
        game: newEvent.game,
        title: newEvent.title,
        isTwitch: false,
        isLive: false,
        isPast: false,
      }]);
      setNewEvent({ time: '', game: '', title: '' });
      setShowForm(false);
    }
  };

  const deleteEvent = (id: string) => {
    setLocalEvents(localEvents.filter(event => event.id !== id));
  };

  const allEvents = [...twitchEvents, ...localEvents];

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const eventsForSelectedDate = allEvents.filter(e => isSameDay(e.date, selectedDate));

  const tileContent = ({ date, view }: any) => {
    if (view === 'month') {
      const hasTwitch = twitchEvents.some(e => isSameDay(e.date, date));
      const hasLocal = localEvents.some(e => isSameDay(e.date, date));

      if (hasTwitch || hasLocal) {
      return (
        <div className="stream-indicator">
          stream
        </div>
      );
      }
    }
    return null;
  };

  const sortedEvents = [...eventsForSelectedDate].sort((a, b) => {
    if (a.isLive) return -1;
    if (b.isLive) return 1;
    return a.time.localeCompare(b.time);
  });

  return (
    <section id="streams" className="streams-section">
      <div className="streams-container">
        <h2 className="streams-title">
          {t('streams.title')}
        </h2>
        <p className="streams-subtitle">
          Записи стримов с мультфильмами, фильмами, аниме и сериалами публикуются в <span className="highlight-white">Telegram</span> и на <span className="highlight-white">Boosty</span>.
        </p>
        
        <div className="streams-calendar-wrapper">
          <div className="stream-calendar-widget">
            <div className="calendar-header">
              {/* Кнопка "+" только в режиме редактирования */}
              {canEdit && (
                <button
                  className="add-stream-btn"
                  onClick={() => setShowForm(!showForm)}
                  title="Добавить стрим"
                >
                  +
                </button>
              )}
            </div>

            {isLoading && <div className="loading-indicator">Загрузка...</div>}

            {canEdit && showForm && (
              <div className="event-form">
                <input type="time" value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                <input type="text" value={newEvent.game} placeholder="Игра"
                  onChange={(e) => setNewEvent({ ...newEvent, game: e.target.value })} />
                <input type="text" value={newEvent.title} placeholder="Название стрима"
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                <button onClick={addEvent}>Сохранить</button>
                <button onClick={() => setShowForm(false)} className="cancel-btn">Отмена</button>
              </div>
            )}

            {/* Модалка заказа */}
            {showOrderModal && (
              <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setShowOrderModal(false)}>×</button>
                  <h3 className="modal-title">Заказ просмотра</h3>
                  <p className="modal-price">За донат 25 000₽ вы можете заказать просмотр чего-либо продолжительностью ~2 часа</p>
                  
                  <div className="modal-rules">
                    <div className="modal-rule">
                      <span className="rule-icon"></span>
                      <span className="rule-text">
                        <p>Нельзя: контент 18+, политические темы и деструктивный контент.</p>
                        <p>Я могу попросить поменять заказ (последнее слово остается за мной).</p>
                        <p>Оптимальный день и время для просмотра выбираю я, это может быть в тот же день или на неделе. Я также определяю, где мы смотрим: на Twitch или Boosty (фильмы Warner Brothers смотрим только на Boosty).</p>
                      </span>
                    </div>
                  </div>

                  <div className="modal-donate-links">
                    <a href="https://www.donationalerts.com/r/by_owl" target="_blank" rel="noopener noreferrer" className="modal-donate-btn alerts-btn">
                      <span> DonationAlerts </span>
                    </a>
                    <a href="https://new.donatepay.ru/@by_owl" target="_blank" rel="noopener noreferrer" className="modal-donate-btn donatepay-btn">
                      <span> DonatePay (крипта) </span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="calendar-layout">
              <div className="calendar-sidebar">
                <div className="info-cards-bottom">
                  <div className="info-card">
                    <div className="info-card-content">
                      <a href="https://boosty.to/by_owl" target="_blank" rel="noopener noreferrer" className="info-link boosty-link">
                        <span>Смотреть на Boosty</span>
                      </a>
                      <div className="info-text">
                        <p>
                          Записи на <span className="highlight-white">Boosty</span> выкладываются сразу после стрима. 
                          Смотреть можно сразу без скачивания и лагов. 
                          Сабка стоит <span className="highlight-white">50₽</span>.
                        </p>
                      </div>

                      <a href="https://t.me/by_owl_vods" target="_blank" rel="noopener noreferrer" className="info-link telegram-link">
                        <span>Смотреть в Telegram</span>
                      </a>
                      <div className="info-text">
                        <p>
                          В <span className="highlight-white">Telegram</span> канале записи появляются спустя несколько часов завершения стрима. 
                          Смотреть записи без скачивания можно с <span className="highlight-white">IOS</span>, <span className="highlight-white">Android</span> и <span className="highlight-white">Web</span>-версий Telegram.
                        </p>
                        <p>
                          Важно: <span className="highlight-white">Windows Desktop</span> версия не поддерживает мгновенное воспроизведение, 
                          поэтому на ваших Windows ПК используйте <span className="highlight-white">Telegram Web</span> (в браузере) для просмотра без скачивания.
                        </p>
                      </div>

                      <button
                        className="info-link order-link"
                        onClick={() => setShowOrderModal(true)}
                      >
                        <span>Заказать просмотр</span>
                      </button>
                      <div className="info-text">
                        <p>Заказ просмотра фильма/аниме.</p>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <div className="calendar-right-col">
                <div className="calendar-wrapper">
                    <Calendar
                      onChange={(value) => {
                        if (value instanceof Date) {
                          setSelectedDate(value);
                        }
                      }}
                      onClickDay={(value) => {
                        if (
                          value.getMonth() === selectedDate.getMonth() &&
                          value.getFullYear() === selectedDate.getFullYear()
                        ) {
                          setSelectedDate(value);
                        }
                      }}
                      value={selectedDate}
                      tileContent={tileContent}
                      locale="ru-RU"
                      minDetail="month"
                      minDate={minDate}
                      maxDate={maxDate}
                      defaultActiveStartDate={initialDate}
                      prevLabel="🡐"
                      nextLabel="🡒"
                      prev2Label={null}
                      next2Label={null}
                      showNeighboringMonth={true}
                      navigationLabel={({ date }) => (
                        <span>
                          {date.toLocaleString('ru-RU', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                      tileDisabled={({ date, view, activeStartDate }) => {
                        if (view !== 'month') return false;

                        return (
                          date.getMonth() !== activeStartDate.getMonth() ||
                          date.getFullYear() !== activeStartDate.getFullYear()
                        );
                      }}
                    />
                </div>

                <div className="day-info">
                  <div className="day-title">
                    {selectedDate.toLocaleDateString('ru-RU', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                  
                  {sortedEvents.length > 0 ? (
                    sortedEvents.map(event => (
                      <div key={event.id} className="day-stream">
                        <div className="day-stream-title">{event.title}</div>
                        {event.game && <div className="day-stream-game">{event.game}</div>}
                        {event.time && <div className="day-stream-time">{event.time} МСК</div>}
                        {event.url && (
                          <a href={event.url} target="_blank" rel="noopener noreferrer" className="day-stream-btn">
                            Смотреть запись
                          </a>
                        )}
                        {canEdit && !event.isTwitch && (
                          <button 
                            onClick={() => deleteEvent(event.id)} 
                            className="delete-event-btn"
                            title="Удалить событие"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-stream">В этот день не было стримов</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}