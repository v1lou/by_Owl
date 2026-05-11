'use client';

import { useState } from 'react';
import '../../styles/config-section.css'
import { useTranslation } from 'react-i18next';

interface ConfigSectionProps {
  pcConfig: any;
}

export default function ConfigSection({ pcConfig }: ConfigSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="config-section" id="pc-config">
      <div className="config-container">
        <h2 className="config-title">
          {t('config.title')}
        </h2>
        <p className="config-subtitle">железо, периферия и рабочее место</p>
        
        <div className="config-content">
          <div className="config-grid">
            {/* Компоненты */}
            <div className="config-card">
              <h3 className="card-title">КОМПОНЕНТЫ</h3>
              <div className="config-list">
                <div className="config-item">
                  <span className="item-label">Процессор:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.components?.cpu?.name || 'Intel Core i7-14700K'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.components?.cpu?.name || 'Intel Core i7-14700K', 'cpu')}
                    >
                      {copiedId === 'cpu' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.components?.cpu?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Видеокарта:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.components?.gpu?.name || 'Palit RTX 4080'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.components?.gpu?.name || 'Palit RTX 4080', 'gpu')}
                    >
                      {copiedId === 'gpu' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.components?.gpu?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Материнская плата:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.components?.motherboard?.name || 'MSI MAG Z790 Tomahawk'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.components?.motherboard?.name || 'MSI MAG Z790 Tomahawk', 'motherboard')}
                    >
                      {copiedId === 'motherboard' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.components?.motherboard?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Оперативная память:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.components?.ram?.name || 'G.Skill Trident Z5'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.components?.ram?.name || 'G.Skill Trident Z5', 'ram')}
                    >
                      {copiedId === 'ram' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.components?.ram?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">SSD:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.components?.ssd?.name || 'WD Black SN850X'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.components?.ssd?.name || 'WD Black SN850X', 'ssd')}
                    >
                      {copiedId === 'ssd' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.components?.ssd?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Охлаждение:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.components?.cooling?.name || 'Deepcool LS720'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.components?.cooling?.name || 'Deepcool LS720', 'cooling')}
                    >
                      {copiedId === 'cooling' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.components?.cooling?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Блок питания:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.components?.psu?.name || 'Be Quiet! Straight Power 12'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.components?.psu?.name || 'Be Quiet! Straight Power 12', 'psu')}
                    >
                      {copiedId === 'psu' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.components?.psu?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Корпус:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.components?.case?.name || 'Phanteks Eclipse G360A'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.components?.case?.name || 'Phanteks Eclipse G360A', 'case')}
                    >
                      {copiedId === 'case' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.components?.case?.description}</span>
                </div>
              </div>
            </div>
            
            {/* Периферия */}
            <div className="config-card">
              <h3 className="card-title">ПЕРИФЕРИЯ</h3>
              <div className="config-list">
                <div className="config-item">
                  <span className="item-label">Мониторы:</span>
                  <div className="monitors-list">
                    {pcConfig?.peripherals?.monitors?.map((monitor: any, idx: number) => (
                      <div key={idx} className="monitor-item">
                        <div className="item-value-wrapper">
                          <span className="item-value">{monitor.name}</span>
                          <button 
                            className="copy-btn"
                            onClick={() => handleCopy(monitor.name, `monitor-${idx}`)}
                          >
                            {copiedId === `monitor-${idx}` ? 'copied' : 'copy'}
                          </button>
                        </div>
                        <span className="item-desc">{monitor.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="config-item">
                  <span className="item-label">Мышка:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.peripherals?.mouse?.name || 'Pulsar X2 V2 Inosuke'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.peripherals?.mouse?.name || 'Pulsar X2 V2 Inosuke', 'mouse')}
                    >
                      {copiedId === 'mouse' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.peripherals?.mouse?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Клавиатура:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.peripherals?.keyboard?.name || 'OASIS 75 MARSHMALLOW'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.peripherals?.keyboard?.name || 'OASIS 75 MARSHMALLOW', 'keyboard')}
                    >
                      {copiedId === 'keyboard' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.peripherals?.keyboard?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Наушники (внутри):</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.peripherals?.headphones_in?.name || 'Logitech G FITS'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.peripherals?.headphones_in?.name || 'Logitech G FITS', 'headphones_in')}
                    >
                      {copiedId === 'headphones_in' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.peripherals?.headphones_in?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Наушники (накладные):</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.peripherals?.headphones_over?.name || 'Logitech G733'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.peripherals?.headphones_over?.name || 'Logitech G733', 'headphones_over')}
                    >
                      {copiedId === 'headphones_over' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.peripherals?.headphones_over?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Коврик:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.peripherals?.mousepad?.name || 'Buster X Dark Project'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.peripherals?.mousepad?.name || 'Buster X Dark Project', 'mousepad')}
                    >
                      {copiedId === 'mousepad' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.peripherals?.mousepad?.description}</span>
                </div>
              </div>
            </div>
            
            {/* Аудио/Видео */}
            <div className="config-card">
              <h3 className="card-title">АУДИО / ВИДЕО</h3>
              <div className="config-list">
                <div className="config-item">
                  <span className="item-label">Микрофон:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.audio?.microphone?.name || 'Shure SM7B'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.audio?.microphone?.name || 'Shure SM7B', 'mic')}
                    >
                      {copiedId === 'mic' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.audio?.microphone?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Звуковая карта:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.audio?.soundcard?.name || 'GoXLR Mini'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.audio?.soundcard?.name || 'GoXLR Mini', 'soundcard')}
                    >
                      {copiedId === 'soundcard' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.audio?.soundcard?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Камера:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.audio?.camera?.name || 'Sony A7S III'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.audio?.camera?.name || 'Sony A7S III', 'camera')}
                    >
                      {copiedId === 'camera' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.audio?.camera?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Объектив:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.audio?.lens?.name || 'Samyang 24mm f/1.8'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.audio?.lens?.name || 'Samyang 24mm f/1.8', 'lens')}
                    >
                      {copiedId === 'lens' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.audio?.lens?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Свет:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.audio?.light?.name || 'Elgato Key Light'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.audio?.light?.name || 'Elgato Key Light', 'light')}
                    >
                      {copiedId === 'light' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.audio?.light?.description}</span>
                </div>
              </div>
            </div>
            
            {/* Комфорт */}
            <div className="config-card">
              <h3 className="card-title">КОМФОРТ</h3>
              <div className="config-list">
                <div className="config-item">
                  <span className="item-label">Кресло:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.furniture?.chair?.name || 'Herman Miller Embody'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.furniture?.chair?.name || 'Herman Miller Embody', 'chair')}
                    >
                      {copiedId === 'chair' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.furniture?.chair?.description}</span>
                </div>
                <div className="config-item">
                  <span className="item-label">Стол:</span>
                  <div className="item-value-wrapper">
                    <span className="item-value">{pcConfig?.furniture?.desk?.name || 'Ergostol Start 2.0'}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(pcConfig?.furniture?.desk?.name || 'Ergostol Start 2.0', 'desk')}
                    >
                      {copiedId === 'desk' ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <span className="item-desc">{pcConfig?.furniture?.desk?.description}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}