'use client';

import '../../styles/merch-section.css'
import { useTranslation } from 'react-i18next';

export default function MerchSection() {
  const { t } = useTranslation();

  const merchItems = [
    {
      id: 1,
      title: "Шарф BetBoom x By Owl",
      description: "Совместно с BetBoom выпустили шарфы с инверсией цвета и логотипов. Успей купить шарф на будущее",
      link: "https://betboom.shop/product/sharf-betboom-by-owl",
      image: "/images/4.png"
    },
    {
      id: 2,
      title: "Коврик Custom Made x By Owl — Silent Hill",
      description: "Совместно с CustomMade вышла 3-я расцветка моих ковров «Silent Hill». Пока доступно лишь в одном размере 900×400 мм. В ближайшем времени появятся и маленький формат.",
      link: "https://www.ozon.ru/product/kovrik-dlya-myshi-custom-made-x-by-owl-silent-hill-xl-900x400-zhakkard-cm-ol-0006-3590049022/",
      image: "/images/1.png"
    },
    {
      id: 3,
      title: "Брелок Вампик BetBoom x By Owl",
      description: "Малыш-вампик на связку ключей. Коллаборация BetBoom и By Owl.",
      links: [
        { text: "Купить брелок", url: "https://betboom.shop/product/brelok-betboom-x-by_owl" },
        { text: "Магазин BetBoom", url: "https://betboom.shop/" }
      ],
      image: "/images/7.png"
    },
    {
      id: 4,
      title: "Игрушка Вампик BetBoom x By Owl",
      description: "Круглая большая игрушка-вампик. Коллаборация BetBoom и By Owl.",
      links: [
        { text: "Купить игрушку", url: "https://betboom.shop/product/igrushka-betboom-x_by_owl" },
        { text: "Магазин BetBoom", url: "https://betboom.shop/" }
      ],
      image: "/images/6.png"
    },
    {
      id: 5,
      title: "Розовые ковры CoverMe x By Owl",
      description: "Ограниченная акция на розовые ковры из поролона. С промокодом OWLTG скидка 15%.",
      link: "https://covermeshop.ru/tproduct/780038054052-byowl-cover-me",
      image: "/images/3.png"
    },
    {
      id: 6,
      title: "Белый коврик Lycoris",
      description: "Белые ковры Lycoris в двух размерах (40x50 и 40x90), материал жаккард.",
      link: "https://www.ozon.ru/product/custom-made-kovrik-dlya-myshki-xl-belyy-krasnyy-3133995644/",
      image: "/images/5.png"
    },
    {
      id: 7,
      title: "Черный коврик HellHound",
      description: 'Лимитированные черные ковры "Hellhound". Материал жаккард, в двух размерах: размер L (50x40 cm) и размер XL (90x40cm).',
      link: "https://www.ozon.ru/product/custom-made-kovrik-dlya-myshki-xl-belyy-chernyy-3133995144/",
      image: "/images/2.png"
    }
  ];

  return (
    <section className="merch-section" id="merch">
      <div className="merch-container">
        <h2 className="merch-title">
          {t('merch.title')}
        </h2>
        
        <div className="merch-grid">
          {merchItems.map((item) => (
            <div key={item.id} className="merch-card">
              <div className="merch-image">
                <img src={item.image} alt={item.title} />
              </div>

              <div className="merch-info">
                <div className="merch-text-block">
                  <h3 className="merch-card-title">{item.title}</h3>
                  <p className="merch-description">{item.description}</p>
                </div>
                
                {item.link && (
                  <div className="merch-links-group">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="merch-btn">
                      Купить →
                    </a>
                  </div>
                )}
                
                {item.links && (
                  <div className="merch-links-group two-columns">
                    {item.links.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="merch-btn">
                        {link.text}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}