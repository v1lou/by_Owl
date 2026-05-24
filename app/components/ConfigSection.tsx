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
        
        <div className="config-grid">
          {/* КАРТОЧКА 1: КОМПОНЕНТЫ ПК */}
          <div className="config-card">
            <div className="card-header">
              <h3 className="card-title">Компоненты ПК</h3>
            </div>
            <div className="config-list">
              <div className="config-item">
                <span className="item-label">Процессор</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.components?.cpu?.name || 'Intel Core i7-14700K'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.components?.cpu?.name || 'Intel Core i7-14700K', 'cpu')}
                  >
                    {copiedId === 'cpu' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.components?.cpu?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Видеокарта</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.components?.gpu?.name || 'Palit RTX 4080 gamerock oc'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.components?.gpu?.name || 'Palit RTX 4080 gamerock oc', 'gpu')}
                  >
                    {copiedId === 'gpu' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.components?.gpu?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Материнская плата</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.components?.motherboard?.name || 'Msi mag z790 tomahawk'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.components?.motherboard?.name || 'Msi mag z790 tomahawk', 'motherboard')}
                  >
                    {copiedId === 'motherboard' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.components?.motherboard?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Оперативная память</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.components?.ram?.name || 'G.skill ddr5 trident z5 rgb (2x16gb) 6000mhz'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.components?.ram?.name || 'G.skill ddr5 trident z5 rgb (2x16gb) 6000mhz', 'ram')}
                  >
                    {copiedId === 'ram' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.components?.ram?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">SSD</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.components?.ssd?.name || 'WD Black sn850x 2tb'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.components?.ssd?.name || 'WD Black sn850x 2tb', 'ssd')}
                  >
                    {copiedId === 'ssd' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.components?.ssd?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Охлаждение</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.components?.cooling?.name || 'Deepcool LS720'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.components?.cooling?.name || 'Deepcool LS720', 'cooling')}
                  >
                    {copiedId === 'cooling' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.components?.cooling?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Блок питания</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.components?.psu?.name || 'Be quiet straight power 12 1000W platinum'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.components?.psu?.name || 'Be quiet straight power 12 1000W platinum', 'psu')}
                  >
                    {copiedId === 'psu' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.components?.psu?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Корпус</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.components?.case?.name || 'Phanteks eclipse g360a black'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.components?.case?.name || 'Phanteks eclipse g360a black', 'case')}
                  >
                    {copiedId === 'case' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.components?.case?.description}</span>
              </div>
            </div>
          </div>

          {/* КАРТОЧКА 2: ПЕРИФЕРИЯ */}
          <div className="config-card">
            <div className="card-header">
              <h3 className="card-title">Периферия</h3>
            </div>
            <div className="config-list">
              <div className="config-item">
                <span className="item-label">Монитор 1</span>
                <div className="item-value-wrapper">
                  <span className="item-value">Dell Alienware AW2723DF 27" 240Hz QHD IPS</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy('Dell Alienware AW2723DF', 'monitor1')}
                  >
                    {copiedId === 'monitor1' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="config-item">
                <span className="item-label">Монитор 2</span>
                <div className="item-value-wrapper">
                  <span className="item-value">Asus VG248 24" 144Hz Full HD</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy('Asus VG248', 'monitor2')}
                  >
                    {copiedId === 'monitor2' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="config-item">
                <span className="item-label">Монитор 3</span>
                <div className="item-value-wrapper">
                  <span className="item-value">MSI G241V E2 24" 75Hz Full HD IPS</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy('MSI G241V E2', 'monitor3')}
                  >
                    {copiedId === 'monitor3' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="config-item">
                <span className="item-label">Мышка</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.peripherals?.mouse?.name || 'Pulsar X2 V2 Inosuke'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.peripherals?.mouse?.name || 'Pulsar X2 V2 Inosuke', 'mouse')}
                  >
                    {copiedId === 'mouse' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.peripherals?.mouse?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Клавиатура</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.peripherals?.keyboard?.name || 'OASIS 75 MARSHMALLOW'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.peripherals?.keyboard?.name || 'OASIS 75 MARSHMALLOW', 'keyboard')}
                  >
                    {copiedId === 'keyboard' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.peripherals?.keyboard?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Наушники внутриканальные</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.peripherals?.headphones_in?.name || 'Logitech G FITS'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.peripherals?.headphones_in?.name || 'Logitech G FITS', 'headphones_in')}
                  >
                    {copiedId === 'headphones_in' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.peripherals?.headphones_in?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Наушники накладные</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.peripherals?.headphones_over?.name || 'Logitech G733'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.peripherals?.headphones_over?.name || 'Logitech G733', 'headphones_over')}
                  >
                    {copiedId === 'headphones_over' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.peripherals?.headphones_over?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Коврик</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.peripherals?.mousepad?.name || 'Buster X Dark Project'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.peripherals?.mousepad?.name || 'Buster X Dark Project', 'mousepad')}
                  >
                    {copiedId === 'mousepad' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.peripherals?.mousepad?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Кресло</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.furniture?.chair?.name || 'Herman Miller Embody'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.furniture?.chair?.name || 'Herman Miller Embody', 'chair')}
                  >
                    {copiedId === 'chair' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.furniture?.chair?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Стол</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.furniture?.desk?.name || 'Ergostol Start 2.0'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.furniture?.desk?.name || 'Ergostol Start 2.0', 'desk')}
                  >
                    {copiedId === 'desk' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.furniture?.desk?.description}</span>
              </div>
            </div>
          </div>
          
          <div className="config-card">
            <div className="card-header">
              <h3 className="card-title">Аудио и Видео</h3>
            </div>
            <div className="config-list">
              <div className="config-item">
                <span className="item-label">Микрофон</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.audio?.microphone?.name || 'Shure SM7B'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.audio?.microphone?.name || 'Shure SM7B', 'mic')}
                  >
                    {copiedId === 'mic' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.audio?.microphone?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Звуковая карта</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.audio?.soundcard?.name || 'GoXLR Mini'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.audio?.soundcard?.name || 'GoXLR Mini', 'soundcard')}
                  >
                    {copiedId === 'soundcard' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.audio?.soundcard?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Камера</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.audio?.camera?.name || 'Sony A7S III'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.audio?.camera?.name || 'Sony A7S III', 'camera')}
                  >
                    {copiedId === 'camera' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.audio?.camera?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Объектив</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.audio?.lens?.name || 'Samyang 24mm f/1.8'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.audio?.lens?.name || 'Samyang 24mm f/1.8', 'lens')}
                  >
                    {copiedId === 'lens' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.audio?.lens?.description}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Свет</span>
                <div className="item-value-wrapper">
                  <span className="item-value">{pcConfig?.audio?.light?.name || 'Elgato Key Light'}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(pcConfig?.audio?.light?.name || 'Elgato Key Light', 'light')}
                  >
                    {copiedId === 'light' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <span className="item-desc">{pcConfig?.audio?.light?.description}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}