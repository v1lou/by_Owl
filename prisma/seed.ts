import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем seed...');

  // Проверяем подключение к базе данных
  try {
    await prisma.$connect();
    console.log('Подключение к базе данных успешно');
    
    // Проверяем, есть ли уже данные в таблице Cosplay как примере
    const cosplayCount = await prisma.cosplay.count();
    const productCount = await prisma.product.count();
    const achievementCount = await prisma.achievement.count();
    const archiveCount = await prisma.watchArchive.count();
    
    console.log(`Текущее состояние базы данных:
      - Косплеи: ${cosplayCount}
      - Товары: ${productCount}
      - Достижения: ${achievementCount}
      - Архив: ${archiveCount}
    `);
    
    if (cosplayCount === 0 && productCount === 0 && achievementCount === 0 && archiveCount === 0) {
      console.log('База данных пуста. Вы можете заполнить её через админ-панель.');
      console.log('Админ-панель доступна по адресу: https://ваш-сайт/admin');
    } else {
      console.log('База данных уже содержит данные.');
    }
    
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Ошибка выполнения seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seed завершён');
  });