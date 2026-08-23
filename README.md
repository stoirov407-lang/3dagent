# 3D Офис с Агентами 🏢

Интерактивная 3D система управления виртуальным офисом с агентами, которые могут выполнять задачи, взаимодействовать друг с другом и подчиняться распоряжениям директора.

## 🎯 Основные возможности

- **3D Визуализация**: Реалистичный офис с рабочими местами, созданный на Three.js
- **Система Агентов**: Директор нанимает и управляет рабочими
- **Управление Задачами**: Создание, распределение и отслеживание задач
- **Автоматический Планировщик**: Распределение задач по оптимальным агентам
- **Энергетическая Система**: Агенты теряют энергию при работе и восстанавливают её во время отдыха
- **Встречи и События**: Организация встреч между агентами
- **Статистика и Отчеты**: Подробный анализ производительности

## 📁 Структура проекта

```
3dagent/
├── index.html              # Главная страница с UI
├── vite.config.js          # Конфигурация Vite
├── package.json            # Зависимости проекта
├── agents/
│   ├── AgentManager.js     # Управление агентами и нанятием
│   ├── AgentController.js  # Контроль поведения и задач
│   └── TaskScheduler.js    # Планировщик и распределение задач
├── office/
│   └── Office3D.js         # 3D сцена офиса
└── README.md               # Данная документация
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск сервера разработки

```bash
npm run dev
```

Откроется браузер на `http://localhost:3000`

### 3. Сборка для продакшена

```bash
npm run build
```

## 🎮 Использование

### Создание директора

1. Введите имя директора в поле "Имя директора"
2. Нажмите кнопку "Создать"
3. Директор появится в центре офиса (синий персонаж)

### Наем рабочих

1. Введите имя рабочего в поле "Имя рабочего"
2. Выберите тип работы из выпадающего списка:
   - **GENERAL** - Общая работа
   - **PROGRAMMING** - Программирование
   - **DESIGN** - Дизайн
   - **MANAGEMENT** - Управление
3. Нажмите "Нанять рабочего"
4. Рабочий появится в офисе и автоматически пойдет на свободное рабочее место

### Управление задачами

Используйте кнопки в разделе "Задачи":
- **Работать** - Назначить работу всем свободным рабочим
- **Перерыв** - Дать отдых рабочим
- **Встреча** - Организовать встречу

### Увольнение рабочих

Нажмите кнопку "✕" рядом с именем рабочего, чтобы его уволить.

## 📊 API Классов

### AgentManager

Управляет директором и рабочими.

```javascript
import AgentManager from './agents/AgentManager.js';

const manager = new AgentManager();

// Создать директора
manager.createDirector('Владимир', { x: 0, y: 0, z: 0 });

// Нанять рабочего
const worker = manager.hireWorker('Иван', 'PROGRAMMING');

// Уволить рабочего
manager.fireWorker(worker.id);

// Назначить задачу
manager.assignTask(worker.id, {
  description: 'Написать код',
  type: 'WORK'
});

// Получить статус
const status = manager.getStatus();
```

### AgentController

Управляет поведением, энергией и задачами агентов.

```javascript
import AgentController from './agents/AgentController.js';

const controller = new AgentController(agentManager);

// Установить расписание
controller.setSchedule(agentId, {
  startTime: '09:00',
  endTime: '18:00',
  breaks: ['12:00-13:00']
});

// Установить поведение
controller.setBehavior(agentId, {
  type: 'PRODUCTIVE',
  energy: 100,
  motivation: 80
});

// Добавить задачу в очередь
controller.queueTask(agentId, {
  description: 'Разработать функцию',
  priority: 'HIGH',
  duration: 120
});

// Дать перерыв
controller.giveBreak(agentId, 15);

// Организовать встречу
controller.organizeMeeting([agentId1, agentId2], 'Планерка', 30);

// Получить энергию агента
const energy = controller.getAgentEnergy(agentId);

// Получить статистику офиса
const stats = controller.getOfficeStatistics();

// Получить отчет по производительности
const report = controller.getPerformanceReport();
```

### TaskScheduler

Автоматически распределяет задачи и управляет сроками.

```javascript
import TaskScheduler from './agents/TaskScheduler.js';

const scheduler = new TaskScheduler(agentController);

// Создать шаблон задачи
scheduler.createTaskTemplate('template-1', {
  name: 'Написать документацию',
  description: 'Описать API функции',
  duration: 60,
  priority: 'NORMAL',
  category: 'DOCUMENTATION'
});

// Создать задачу из шаблона
scheduler.createTaskFromTemplate('template-1', agentId, {
  title: 'Документировать новый модуль',
  priority: 'HIGH'
});

// Создать расписание (ежедневное)
scheduler.createDailySchedule('daily-1', [
  { time: '09:00', templateId: 'template-1', priority: 'HIGH' },
  { time: '14:00', templateId: 'template-2', priority: 'NORMAL' }
]);

// Активировать автоматическое распределение
scheduler.enableAutoSchedule();

// Распределить задачу оптимальному агенту
scheduler.assignTaskToOptimalAgent({
  description: 'Тестирование новой функции',
  priority: 'NORMAL'
});

// Балансировать нагрузку
scheduler.balanceWorkload();

// Получить задачи, близкие к сроку
const nearDeadline = scheduler.getTasksNearDeadline(2); // 2 часа

// Получить просроченные задачи
const overdue = scheduler.getOverdueTasks();

// Отправить напоминания
scheduler.sendDeadlineReminders();

// Получить рекомендации по оптимизации
const suggestions = scheduler.getOptimizationSuggestions();

// Получить отчет
const report = scheduler.getScheduleReport();
```

### Office3D

Управляет 3D визуализацией офиса.

```javascript
import Office3D from './office/Office3D.js';

const office = new Office3D('canvas-container-id');

// Создать директора в сцене
office.createDirectorInScene('Александр');

// Нанять рабочего в сцене
office.hireWorkerInScene('Петр', 'PROGRAMMING');

// Уволить рабочего из сцены
office.fireWorkerFromScene(workerId);

// Получить статус
const status = office.getStatus();

// Обработать изменение размера окна
window.addEventListener('resize', () => office.onWindowResize());
```

## 🎨 Дизайн офиса

### Визуальные элементы:

- **Пол**: Белый с сеткой для ориентации
- **Рабочие места** (6 штук):
  - Коричневый стол
  - Черный стул
  - Серый монитор с синим экраном
- **Агенты**:
  - **Директор**: Синий персонаж
  - **Рабочие**: Зеленые персонажи

## ⚡ Энергетическая система

Каждый агент имеет уровень энергии (0-100%):

- **100%**: Полностью отдохнувший, может работать эффективно
- **50%**: Нормальное состояние
- **20%**: Нужен отдых, может выполнять только простые задачи
- **0%**: Полностью истощен, не может работать

**Восстановление энергии**:
- Работа: -2% в минуту
- Перерыв: +25% за 15 минут
- Простой: +1% в минуту

## 📈 Система приоритетов

Задачи имеют приоритеты:
- **URGENT** (Срочно) - выполняется в первую очередь
- **HIGH** (Высокий) - выполняется после срочных
- **NORMAL** (Нормальный) - стандартный приоритет
- **LOW** (Низкий) - выполняется последним

## 🔄 Цикл работы агента

1. **Получить задачу** из очереди (по приоритету)
2. **Проверить энергию** (минимум 20%)
3. **Выполнять задачу** (теряет энергию)
4. **По необходимости** взять перерыв
5. **Восстановить энергию** и вернуться к шагу 1

## 📊 Примеры использования

### Пример 1: Создание рабочего дня

```javascript
// Создать директора
office.createDirectorInScene('Иван Петров');

// Нанять 5 рабочих
for (let i = 0; i < 5; i++) {
  office.hireWorkerInScene(`Рабочий ${i + 1}`, 'GENERAL');
}

// Получить контроллер
const controller = office.agentManager.controller;

// Назначить расписание
office.agentManager.workers.forEach(worker => {
  controller.setSchedule(worker.id, {
    startTime: '09:00',
    endTime: '17:00',
    breaks: ['12:00-13:00', '15:00-15:15']
  });
});

// Начать симуляцию
controller.simulateWorkDay(480); // 8 часов
```

### Пример 2: Автоматическое распределение задач

```javascript
const scheduler = new TaskScheduler(controller);

// Создать шаблоны задач
scheduler.createTaskTemplate('coding', {
  name: 'Программирование',
  description: 'Написать код функции',
  duration: 120,
  priority: 'HIGH',
  category: 'DEVELOPMENT'
});

scheduler.createTaskTemplate('testing', {
  name: 'Тестирование',
  description: 'Протестировать функцию',
  duration: 60,
  priority: 'NORMAL',
  category: 'QA'
});

// Создать расписание
scheduler.createDailySchedule('daily-work', [
  { time: '09:30', templateId: 'coding', priority: 'HIGH' },
  { time: '11:30', templateId: 'testing', priority: 'NORMAL' },
  { time: '14:00', templateId: 'coding', priority: 'HIGH' }
]);

// Активировать автоматическое распределение
scheduler.enableAutoSchedule();

// Получить рекомендации
const suggestions = scheduler.getOptimizationSuggestions();
console.log('Рекомендации:', suggestions);
```

## 🛠️ Технические требования

- **Node.js**: 14.0 или выше
- **npm**: 6.0 или выше
- **Браузер**: Поддержка WebGL (Chrome, Firefox, Safari, Edge)

## 📦 Зависимости

- **three.js**: 3D графика
- **vite**: Сборщик модулей

## 🎓 Обучающие материалы

### Документация Three.js
- https://threejs.org/docs/

### Документация Vite
- https://vitejs.dev/guide/

## 🤝 Как помочь проекту

1. Сообщайте об ошибках через Issues
2. Предлагайте улучшения и новые функции
3. Создавайте Pull Requests с вашим кодом

## 📝 Лицензия

MIT License - используйте свободно!

## 👨‍💻 Автор

Создано как демонстрация концепции 3D управления агентами.

## 🚀 Планы развития

- [ ] Сохранение состояния в Local Storage
- [ ] Мультиплеер режим
- [ ] Расширенная система эмоций агентов
- [ ] Система достижений и бонусов
- [ ] Экспорт статистики в PDF
- [ ] Анимация отдельных действий агентов
- [ ] Система обучения агентов
- [ ] Динамическое изменение ландшафта офиса

## ❓ Часто задаваемые вопросы

**Q: Почему агент не движется?**
A: Проверьте, назначен ли ему стол в очереди рабочих мест.

**Q: Как увеличить скорость симуляции?**
A: Измените интервалы в методах класса TaskScheduler.

**Q: Могу ли я добавить больше рабочих мест?**
A: Да, отредактируйте массив `positions` в методе `createWorkstations()` в Office3D.js

**Q: Как изменить внешний вид офиса?**
A: Отредактируйте методы `createFloor()`, `createDesk()` и `createAgentVisual()` в Office3D.js

---

**Приятного использования! 🎉**
