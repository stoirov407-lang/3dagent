/**
 * TaskScheduler - планировщик задач для агентов
 * Автоматически распределяет задачи, управляет приоритетами и сроками
 */
class TaskScheduler {
  constructor(agentController) {
    this.agentController = agentController;
    this.taskTemplates = new Map();
    this.schedules = new Map();
    this.autoScheduleEnabled = false;
  }

  /**
   * Создать шаблон задачи
   */
  createTaskTemplate(templateId, template) {
    this.taskTemplates.set(templateId, {
      id: templateId,
      name: template.name,
      description: template.description,
      duration: template.duration || 60,
      priority: template.priority || 'NORMAL',
      skills: template.skills || [],
      difficulty: template.difficulty || 'MEDIUM', // EASY, MEDIUM, HARD
      category: template.category || 'GENERAL'
    });

    console.log(`📋 Шаблон задачи "${template.name}" создан`);
    return this.taskTemplates.get(templateId);
  }

  /**
   * Получить шаблон задачи
   */
  getTemplate(templateId) {
    return this.taskTemplates.get(templateId);
  }

  /**
   * Создать задачу из шаблона
   */
  createTaskFromTemplate(templateId, agentId, options = {}) {
    const template = this.taskTemplates.get(templateId);
    if (!template) {
      console.error(`Шаблон ${templateId} не найден`);
      return null;
    }

    const task = {
      description: options.title || template.name,
      priority: options.priority || template.priority,
      duration: options.duration || template.duration,
      deadline: options.deadline,
      templateId: templateId
    };

    this.agentController.queueTask(agentId, task);
    return task;
  }

  /**
   * Распределить задачу оптимальному агенту
   */
  assignTaskToOptimalAgent(task) {
    const agentManager = this.agentController.agentManager;
    const workers = agentManager.workers;

    if (workers.length === 0) {
      console.log('Нет доступных рабочих для распределения задачи');
      return null;
    }

    // Выбрать лучшего кандидата
    let bestAgent = null;
    let bestScore = -Infinity;

    workers.forEach(worker => {
      let score = 0;

      // Приоритет: агент с минимальной нагрузкой
      const tasksCount = this.agentController.getAgentTasks(worker.id).length;
      score -= tasksCount * 10;

      // Приоритет: высокая энергия
      const energy = this.agentController.getAgentEnergy(worker.id);
      score += energy * 0.5;

      // Приоритет: статус IDLE лучше чем WORKING
      if (worker.status === 'IDLE') {
        score += 20;
      }

      if (score > bestScore) {
        bestScore = score;
        bestAgent = worker;
      }
    });

    if (bestAgent) {
      this.agentController.queueTask(bestAgent.id, task);
      console.log(`✓ Задача распределена ${bestAgent.name}`);
      return bestAgent;
    }

    return null;
  }

  /**
   * Создать расписание задач (ежедневное)
   */
  createDailySchedule(scheduleId, dailyTasks) {
    this.schedules.set(scheduleId, {
      id: scheduleId,
      type: 'DAILY',
      tasks: dailyTasks, // массив объектов {time: "09:00", templateId: "...", priority: "..."}
      createdAt: new Date(),
      active: true
    });

    console.log(`📅 Ежедневное расписание "${scheduleId}" создано (${dailyTasks.length} задач)`);
    return this.schedules.get(scheduleId);
  }

  /**
   * Создать расписание задач (еженедельное)
   */
  createWeeklySchedule(scheduleId, weeklyTasks) {
    this.schedules.set(scheduleId, {
      id: scheduleId,
      type: 'WEEKLY',
      tasks: weeklyTasks, // массив объектов {day: "MONDAY", time: "09:00", templateId: "..."}
      createdAt: new Date(),
      active: true
    });

    console.log(`📅 Еженедельное расписание "${scheduleId}" создано (${weeklyTasks.length} задач)`);
    return this.schedules.get(scheduleId);
  }

  /**
   * Активировать автоматическое распределение задач
   */
  enableAutoSchedule() {
    this.autoScheduleEnabled = true;
    console.log('🤖 Автоматическое распределение задач активировано');

    this.autoScheduleInterval = setInterval(() => {
      this.processScheduledTasks();
    }, 10000); // Проверять каждые 10 секунд
  }

  /**
   * Отключить автоматическое распределение задач
   */
  disableAutoSchedule() {
    this.autoScheduleEnabled = false;
    if (this.autoScheduleInterval) {
      clearInterval(this.autoScheduleInterval);
    }
    console.log('🤖 Автоматическое распределение задач отключено');
  }

  /**
   * Обработать запланированные задачи
   */
  processScheduledTasks() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

    this.schedules.forEach((schedule, scheduleId) => {
      if (!schedule.active) return;

      if (schedule.type === 'DAILY') {
        schedule.tasks.forEach(taskConfig => {
          if (taskConfig.time === currentTime) {
            const template = this.taskTemplates.get(taskConfig.templateId);
            if (template) {
              const task = {
                description: template.name,
                priority: taskConfig.priority || template.priority,
                duration: template.duration
              };
              this.assignTaskToOptimalAgent(task);
            }
          }
        });
      }
    });
  }

  /**
   * Получить статистику задач по категориям
   */
  getTaskStatisticsByCategory() {
    const allTasks = this.agentController.taskQueue;
    const stats = {};

    allTasks.forEach(task => {
      const template = this.taskTemplates.get(task.templateId);
      const category = template ? template.category : 'UNCATEGORIZED';

      if (!stats[category]) {
        stats[category] = {
          total: 0,
          completed: 0,
          pending: 0,
          queued: 0
        };
      }

      stats[category].total++;

      if (task.status === 'COMPLETED') {
        stats[category].completed++;
      } else if (task.status === 'QUEUED') {
        stats[category].queued++;
      } else {
        stats[category].pending++;
      }
    });

    return stats;
  }

  /**
   * Получить перегруженного агента
   */
  getOverloadedAgents() {
    const workers = this.agentController.agentManager.workers;
    const overloaded = [];
    const avgTasksPerWorker = this.agentController.taskQueue.length / workers.length;

    workers.forEach(worker => {
      const workerTasks = this.agentController.getAgentTasks(worker.id).length;
      if (workerTasks > avgTasksPerWorker * 1.5) {
        overloaded.push({
          workerId: worker.id,
          name: worker.name,
          tasksCount: workerTasks,
          avgTasks: avgTasksPerWorker
        });
      }
    });

    return overloaded;
  }

  /**
   * Балансировать нагрузку между агентами
   */
  balanceWorkload() {
    const overloaded = this.getOverloadedAgents();

    overloaded.forEach(agent => {
      const agentTasks = this.agentController.getAgentTasks(agent.workerId)
        .filter(t => t.status === 'QUEUED')
        .sort((a, b) => {
          const priorityOrder = { 'LOW': 3, 'NORMAL': 2, 'HIGH': 1, 'URGENT': 0 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

      // Переместить низкоприоритетные задачи другим агентам
      const lowPriorityTasks = agentTasks.filter(t => t.priority === 'LOW').slice(0, 2);

      lowPriorityTasks.forEach(task => {
        const otherAgent = this.agentController.agentManager.workers.find(w => {
          const taskCount = this.agentController.getAgentTasks(w.id).length;
          return taskCount < agentTasks.length && w.id !== agent.workerId;
        });

        if (otherAgent) {
          task.agentId = otherAgent.id;
          console.log(`⚖️  Задача перемещена от ${agent.name} к ${otherAgent.name}`);
        }
      });
    });
  }

  /**
   * Установить срок выполнения задачи
   */
  setTaskDeadline(taskId, deadline) {
    const task = this.agentController.taskQueue.find(t => t.id === taskId);
    if (task) {
      task.deadline = deadline;
      console.log(`⏰ Срок установлен для задачи: ${deadline}`);
      return true;
    }
    return false;
  }

  /**
   * Получить задачи, близкие к сроку
   */
  getTasksNearDeadline(hoursAhead = 2) {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    return this.agentController.taskQueue.filter(task => {
      if (!task.deadline || task.status === 'COMPLETED') return false;
      const deadline = new Date(task.deadline);
      return deadline <= futureTime && deadline >= now;
    });
  }

  /**
   * Получить просроченные задачи
   */
  getOverdueTasks() {
    const now = new Date();
    return this.agentController.taskQueue.filter(task => {
      if (!task.deadline || task.status === 'COMPLETED') return false;
      return new Date(task.deadline) < now;
    });
  }

  /**
   * Отправить напоминания о сроках
   */
  sendDeadlineReminders() {
    const tasksNearDeadline = this.getTasksNearDeadline(1);
    const overdue = this.getOverdueTasks();

    tasksNearDeadline.forEach(task => {
      const agent = this.agentController.agentManager.agents.get(task.agentId);
      if (agent) {
        console.log(`⏰ Напоминание для ${agent.name}: "${task.description}" заканчивается вскоре`);
      }
    });

    overdue.forEach(task => {
      const agent = this.agentController.agentManager.agents.get(task.agentId);
      if (agent) {
        console.log(`🚨 СРОЧНО ${agent.name}: "${task.description}" просрочена!`);
      }
    });
  }

  /**
   * Получить рекомендации по оптимизации
   */
  getOptimizationSuggestions() {
    const suggestions = [];

    // Проверка перегруженности
    const overloaded = this.getOverloadedAgents();
    if (overloaded.length > 0) {
      suggestions.push({
        type: 'WORKLOAD_IMBALANCE',
        severity: 'HIGH',
        message: `${overloaded.length} агент(ов) перегружены. Рекомендуется балансировка нагрузки.`,
        affectedAgents: overloaded.map(a => a.name)
      });
    }

    // Проверка просроченных задач
    const overdue = this.getOverdueTasks();
    if (overdue.length > 0) {
      suggestions.push({
        type: 'OVERDUE_TASKS',
        severity: 'CRITICAL',
        message: `${overdue.length} задач просрочены!`,
        count: overdue.length
      });
    }

    // Проверка энергии агентов
    const lowEnergyAgents = this.agentController.agentManager.workers.filter(w => {
      const energy = this.agentController.getAgentEnergy(w.id);
      return energy < 30;
    });

    if (lowEnergyAgents.length > 0) {
      suggestions.push({
        type: 'LOW_ENERGY',
        severity: 'MEDIUM',
        message: `${lowEnergyAgents.length} агент(ов) нуждаются в отдыхе.`,
        affectedAgents: lowEnergyAgents.map(a => a.name)
      });
    }

    return suggestions;
  }

  /**
   * Получить отчет по плану выполнения
   */
  getScheduleReport() {
    return {
      timestamp: new Date(),
      totalSchedules: this.schedules.size,
      activeSchedules: Array.from(this.schedules.values()).filter(s => s.active).length,
      totalTaskTemplates: this.taskTemplates.size,
      autoScheduleEnabled: this.autoScheduleEnabled,
      taskStatistics: this.getTaskStatisticsByCategory(),
      suggestions: this.getOptimizationSuggestions()
    };
  }
}

export default TaskScheduler;
