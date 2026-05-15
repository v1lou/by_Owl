import '../../styles/merch-section.css'
import { useTranslation } from 'react-i18next';

export default function MerchSection() {
  const { t } = useTranslation();

  return (
    <section className="merch-section" id="merch">
      <div className="merch-container">
        <h2 className="merch-title">
          {t('merch.title')}
        </h2>
        <p className="merch-subtitle">эксклюзивные коллаборации и лимитированные коллекции</p>
        
        <div className="merch-grid">
          {}
          <div className="merch-card betboom">
            <div className="merch-badge">HOT RELEASE</div>
            <h3 className="merch-card-title">Шарф BetBoom x By Owl</h3>
            <div className="merch-price">1 990 ₽</div>
            <p className="merch-description">
              На улице апрель и +15, значит время релизить теплые шарфы!<br/><br/>
              Совместно с BetBoom выпустили шарфы с инверсией цвета и логотипов. 
              Успей купить шарф на будущее
            </p>
            <div className="merch-features">
              <span>✓ Инверсия цвета</span>
              <span>✓ Логотип BetBoom</span>
              <span>✓ Ограниченная серия</span>
            </div>
            <a href="https://betboom.shop/product/sharf-betboom-by-owl" target="_blank" rel="noopener noreferrer" className="merch-btn">
              Купить шарф →
            </a>
          </div>

          {}
          <div className="merch-card betboom featured">
            <div className="merch-badge">LIMITED EDITION</div>
            <h3 className="merch-card-title">Вампики BetBoom x By Owl</h3>
            <div className="merch-prices">
              <span className="price-item">Брелоки: 1 300 ₽</span>
              <span className="price-item">Большие игрушки: 4 000 ₽</span>
            </div>
            <p className="merch-description">
              Свершилось!!! BetBoom запустили свой онлайн магазин мерча<br/><br/>
              И наконец дропнули моих долгожданных Вампиков в коллабе с BetBoom!<br/><br/>
              Доступны брелоки и круглые большие игрушки.<br/><br/>
              В честь открытия BetBoom запустил акцию – делай ставку на любое событие 
              и участвуй в розыгрыше мерча!<br/>
              <strong>*бесплатная доставка от 1500₽</strong>
            </p>
            <div className="merch-links-group">
              <a href="https://betboom.shop/product/igrushka-betboom-x-by_owl-2" target="_blank" rel="noopener noreferrer" className="merch-btn small">
                Купить игрушку →
              </a>
              <a href="https://betboom.shop/" target="_blank" rel="noopener noreferrer" className="merch-btn small outline">
                Магазин BetBoom →
              </a>
              <a href="https://app.betboom.ru/BBs" target="_blank" rel="noopener noreferrer" className="merch-btn small outline">
                Участвовать в акции →
              </a>
            </div>
          </div>

          {}
          <div className="merch-card coverme">
            <div className="merch-badge">PROMO CODE</div>
            <h3 className="merch-card-title">Розовые ковры CoverMe x By Owl</h3>
            <div className="merch-price">Скидка 15%</div>
            <p className="merch-description">
              🤍 Стартовала ограниченная акция на мои розовые ковры из поролона в коллабе с CoverMe!<br/><br/>
              С промокодом <strong className="promo-code">OWLTG</strong> вы получаете скидку 15%.<br/>
              Промокод ограничен, всего 50 активаций.<br/><br/>
              Отличный вариант на подарок к ближайшим праздникам, я считаю!
            </p>
            <div className="merch-features">
              <span>✓ Розовый дизайн</span>
              <span>✓ Из поролона</span>
              <span>✓ Только 50 промокодов</span>
            </div>
            <a href="https://covermeshop.ru/tproduct/780038054052-byowl-cover-me" target="_blank" rel="noopener noreferrer" className="merch-btn">
              Приобрести коврик →
            </a>
          </div>

          {}
          <div className="merch-card ozon">
            <div className="merch-badge">BACK IN STOCK</div>
            <h3 className="merch-card-title">Ковры Lycoris & HellHound</h3>
            <p className="merch-description">
              БЕЛЫЕ КОВРЫ СНОВА В НАЛИЧИИ <br/><br/>
              не ожидала, что будет такой ажиотаж, 2 солд аута за короткие сроки
              и вот третья партия, так что, кто ждал - успевайте забрать свой!!!
            </p>
            <div className="merch-links-group two-columns">
              <a href="https://www.ozon.ru/product/custom-made-kovrik-dlya-myshki-xl-belyy-krasnyy-3133995644/" target="_blank" rel="noopener noreferrer" className="merch-btn white">
                Белый коврик Lycoris →
              </a>
              <a href="https://www.ozon.ru/product/custom-made-kovrik-dlya-myshki-xl-belyy-chernyy-3133995144/" target="_blank" rel="noopener noreferrer" className="merch-btn black">
                Черный коврик HellHound →
              </a>
            </div>
            <div className="merch-note">
              Ограниченная партия! Успевайте!
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}