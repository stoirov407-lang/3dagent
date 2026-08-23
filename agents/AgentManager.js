/**
 * AgentManager - Управляет агентами офиса
 * Директор может создавать/увольнять рабочих агентов
 */
class AgentManager {
  constructor() {
    this.agents = new Map();
    this.director = null;
    this.workers = [];
    this.nextAgentId = 1;
  }

  /**
   * Создать директора
   */
  createDirector(name, position) {
    this.director = {
      id: 'DIRECTOR_001',
      name: name,
      role: 'DIRECTOR',
      position: position,
      workersManaged: [],
      canHire: true,
      canFire: true,
      status: 'ACTIVE'
    };
    this.agents.set(this.director.id, this.director);
    console.log(`✓ Директор "${name}" создан`);
    return this.director;
  }

  /**
   * Директор нанимает рабочего
   */
  hireWorker(workerName, taskType = 'GENERAL') {
    if (!this.director) {
      console.error('Директор не существует!');
      return null;
    }

    const workerId = `WORKER_${String(this.nextAgentId).padStart(3, '0')}`;
    this.nextAgentId++;

    const worker = {
      id: workerId,
      name: workerName,
      role: 'WORKER',
      taskType: taskType,
      position: { x: 0, y: 0, z: 0 }, // Будет установлено в 3D сцене
      currentTask: null,
      status: 'IDLE',
      createdBy: this.director.id,
      hireDate: new Date()
    };

    this.agents.set(workerId, worker);
    this.workers.push(worker);
    this.director.workersManaged.push(workerId);

    console.log(`✓ Рабочий "${workerName}" нанят (${workerId})`);
    return worker;
  }

  /**
   * Директор увольняет рабочего
   */
  fireWorker(workerId) {
    if (!this.director) {
      console.error('Директор не существует!');
      return false;
    }

    const worker = this.agents.get(workerId);
    if (!worker || worker.role !== 'WORKER') {
      console.error(`Рабочий ${workerId} не найден`);
      return false;
    }

    // Удалить из списка
    this.workers = this.workers.filter(w => w.id !== workerId);
    this.director.workersManaged = this.director.workersManaged.filter(id => id !== workerId);
    this.agents.delete(workerId);

    console.log(`✗ Рабочий "${worker.name}" уволен`);
    return true;
  }

  /**
   * Назначить задачу рабочему
   */
  assignTask(workerId, task) {
    const worker = this.agents.get(workerId);
    if (!worker) {
      console.error(`Агент ${workerId} не найден`);
      return false;
    }

    worker.currentTask = task;
    worker.status = 'WORKING';
    console.log(`→ Задача назначена ${worker.name}: ${task.description}`);
    return true;
  }

  /**
   * Завершить задачу
   */
  completeTask(workerId) {
    const worker = this.agents.get(workerId);
    if (!worker) return false;

    worker.currentTask = null;
    worker.status = 'IDLE';
    console.log(`✓ ${worker.name} завершил задачу`);
    return true;
  }

  /**
   * Получить статус всех агентов
   */
  getStatus() {
    const status = {
      director: this.director,
      totalWorkers: this.workers.length,
      workers: this.workers.map(w => ({
        id: w.id,
        name: w.name,
        status: w.status,
        task: w.currentTask?.description || 'нет'
      }))
    };
    return status;
  }

  /**
   * Получить всех агентов
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }
}

export default AgentManager;
