/**
 * AgentController - управление поведением и задачами агентов
 * Контролирует работу, перерывы, встречи и другие действия
 */
class AgentController {
  constructor(agentManager) {
    this.agentManager = agentManager;
    this.taskQueue = [];
    this.schedules = new Map();
    this.behaviors = new Map();
  }

  /**
   * Назначить расписание для агента
   */
  setSchedule(agentId, schedule) {
    this.schedules.set(agentId, {
      agentId: agentId,
      startTime: schedule.startTime || '09:00',
      endTime: schedule.endTime || '18:00',
      breaks: schedule.breaks || ['12:00-13:00'],
      meetings: schedule.meetings || [],
      createdAt: new Date()
    });
    console.log(`📅 Расписание установлено для ${agentId}`);
  }

  /**
   * Назначить поведение агенту
   */
  setBehavior(agentId, behavior) {
    this.behaviors.set(agentId, {
      agentId: agentId,
      type: behavior.type, // 'PRODUCTIVE', 'LAZY', 'SOCIAL', 'FOCUSED'
      energy: behavior.energy || 100,
      motivation: behavior.motivation || 80,
      socialNeeds: behavior.socialNeeds || 50
    });
  }

  /**
   * Добавить задачу в очередь
   */
  queueTask(agentId, task) {
    this.taskQueue.push({
      id: `TASK_${Date.now()}`,
      agentId: agentId,
      description: task.description,
      priority: task.priority || 'NORMAL', // 'LOW', 'NORMAL', 'HIGH', 'URGENT'
      duration: task.duration || 60, // минуты
      deadline: task.deadline,
      status: 'QUEUED',
      createdAt: new Date()
    });
  }

  /**
   * Получить следующую задачу для агента
   */
  getNextTask(agentId) {
    const agentTasks = this.taskQueue.filter(t => 
      t.agentId === agentId && t.status === 'QUEUED'
    );
    
    if (agentTasks.length === 0) return null;

    // Сортировать по приоритету
    const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'NORMAL': 2, 'LOW': 3 };
    agentTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return agentTasks[0];
  }

  /**
   * Завершить задачу
   */
  completeTask(taskId) {
    const task = this.taskQueue.find(t => t.id === taskId);
    if (task) {
      task.status = 'COMPLETED';
      task.completedAt = new Date();
      console.log(`✓ Задача "${task.description}" завершена`);
      return true;
    }
    return false;
  }

  /**
   * Отменить задачу
   */
  cancelTask(taskId) {
    const task = this.taskQueue.find(t => t.id === taskId);
    if (task) {
      task.status = 'CANCELLED';
      console.log(`✗ Задача "${task.description}" отменена`);
      return true;
    }
    return false;
  }

  /**
   * Получить энергию агента
   */
  getAgentEnergy(agentId) {
    const behavior = this.behaviors.get(agentId);
    return behavior ? behavior.energy : 100;
  }

  /**
   * Обновить энергию агента
   */
  updateAgentEnergy(agentId, delta) {
    const behavior = this.behaviors.get(agentId);
    if (behavior) {
      behavior.energy = Math.max(0, Math.min(100, behavior.energy + delta));
      return behavior.energy;
    }
    return null;
  }

  /**
   * Проверить, может ли агент работать
   */
  canWork(agentId) {
    const behavior = this.behaviors.get(agentId);
    if (!behavior) return true;

    return behavior.energy > 20; // Нужно минимум 20% энергии
  }

  /**
   * Дать агенту перерыв
   */
  giveBreak(agentId, duration = 15) {
    const agent = this.agentManager.agents.get(agentId);
    if (!agent) return false;

    this.agentManager.assignTask(agentId, {
      description: `Перерыв (${duration} минут)`,
      type: 'BREAK'
    });

    // Восстановить энергию
    this.updateAgentEnergy(agentId, 25);
    
    setTimeout(() => {
      this.agentManager.completeTask(agentId);
    }, duration * 60 * 1000);

    return true;
  }

  /**
   * Организовать встречу
   */
  organizeMeeting(agentIds, meetingTitle, duration = 30) {
    const meeting = {
      id: `MEETING_${Date.now()}`,
      title: meetingTitle,
      participants: agentIds,
      duration: duration,
      startTime: new Date(),
      status: 'SCHEDULED'
    };

    agentIds.forEach(agentId => {
      this.agentManager.assignTask(agentId, {
        description: `Встреча: ${meetingTitle}`,
        type: 'MEETING',
        meetingId: meeting.id
      });
    });

    console.log(`📞 Встреча "${meetingTitle}" организована для ${agentIds.length} участников`);
    return meeting;
  }

  /**
   * Оценить производительность агента
   */
  getPerformance(agentId) {
    const agent = this.agentManager.agents.get(agentId);
    const behavior = this.behaviors.get(agentId);

    if (!agent) return null;

    const completedTasks = this.taskQueue.filter(t => 
      t.agentId === agentId && t.status === 'COMPLETED'
    ).length;

    const performance = {
      agentId: agentId,
      agentName: agent.name,
      completedTasks: completedTasks,
      currentEnergy: behavior ? behavior.energy : 100,
      motivation: behavior ? behavior.motivation : 80,
      efficiency: completedTasks > 0 ? (completedTasks / (this.taskQueue.filter(t => t.agentId === agentId).length || 1)) * 100 : 0
    };

    return performance;
  }

  /**
   * Получить статистику офиса
   */
  getOfficeStatistics() {
    const allAgents = this.agentManager.getAllAgents();
    const stats = {
      totalAgents: allAgents.length,
      activeWorkers: allAgents.filter(a => a.status === 'WORKING').length,
      idleWorkers: allAgents.filter(a => a.status === 'IDLE').length,
      totalTasks: this.taskQueue.length,
      completedTasks: this.taskQueue.filter(t => t.status === 'COMPLETED').length,
      pendingTasks: this.taskQueue.filter(t => t.status === 'QUEUED').length,
      averageEnergy: allAgents.reduce((sum, a) => {
        const behavior = this.behaviors.get(a.id);
        return sum + (behavior ? behavior.energy : 100);
      }, 0) / allAgents.length
    };

    return stats;
  }

  /**
   * Симулировать рабочий день
   */
  simulateWorkDay(duration = 480) { // 8 часов по умолчанию
    console.log(`⏱️ Начало симуляции рабочего дня (${duration} минут)`);

    const workDayInterval = setInterval(() => {
      const allWorkers = this.agentManager.workers;

      allWorkers.forEach(worker => {
        if (this.canWork(worker.id)) {
          const nextTask = this.getNextTask(worker.id);
          if (nextTask) {
            this.agentManager.assignTask(worker.id, {
              description: nextTask.description,
              type: 'WORK'
            });
          }
        } else {
          // Дать перерыв если энергия низкая
          this.giveBreak(worker.id, 10);
        }

        // Снизить энергию если работает
        if (worker.status === 'WORKING') {
          this.updateAgentEnergy(worker.id, -2);
        } else {
          // Восстановить энергию во время простоя
          this.updateAgentEnergy(worker.id, 1);
        }
      });
    }, 5000); // Обновление каждые 5 секунд реального времени

    // Остановить симуляцию через заданное время
    setTimeout(() => {
      clearInterval(workDayInterval);
      console.log('✓ Симуляция рабочего дня завершена');
      console.log(this.getOfficeStatistics());
    }, duration * 1000);
  }

  /**
   * Получить все задачи агента
   */
  getAgentTasks(agentId) {
    return this.taskQueue.filter(t => t.agentId === agentId);
  }

  /**
   * Получить все активные встречи
   */
  getActiveMeetings() {
    const meetings = [];
    const meetingIds = new Set();

    this.taskQueue.forEach(task => {
      if (task.type === 'MEETING' && task.status !== 'COMPLETED') {
        if (!meetingIds.has(task.meetingId)) {
          meetings.push(task);
          meetingIds.add(task.meetingId);
        }
      }
    });

    return meetings;
  }

  /**
   * Уведомить всех агентов
   */
  notifyAll(message) {
    const allAgents = this.agentManager.getAllAgents();
    console.log(`📢 Уведомление всем: ${message}`);
    allAgents.forEach(agent => {
      console.log(`  → ${agent.name}: ${message}`);
    });
  }

  /**
   * Получить отчет о производительности
   */
  getPerformanceReport() {
    const allWorkers = this.agentManager.workers;
    const report = {
      timestamp: new Date(),
      workers: allWorkers.map(w => this.getPerformance(w.id)),
      office: this.getOfficeStatistics()
    };

    return report;
  }
}

export default AgentController;
