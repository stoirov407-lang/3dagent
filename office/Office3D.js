/**
 * Office3D - 3D офис с агентами
 * Дизайн: белый пол, коричневый стол, черный стул, серый компьютер
 * Агенты движутся к местам работы
 */
import * as THREE from 'three';
import AgentManager from './agents/AgentManager.js';

class Office3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    this.agentManager = new AgentManager();
    this.agentVisuals = new Map();
    this.workstations = [];

    this.setupLighting();
    this.createFloor();
    this.createWorkstations();
    this.setupAnimation();
  }

  /**
   * Настроить освещение
   */
  setupLighting() {
    // Основной свет
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);

    // Окружающий свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
  }

  /**
   * Создать белый пол
   */
  createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Сетка для визуализации
    const gridHelper = new THREE.GridHelper(30, 30, 0xcccccc, 0xeeeeee);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
  }

  /**
   * Создать рабочие станции
   */
  createWorkstations() {
    const positions = [
      { x: -8, z: 0 },
      { x: -8, z: 8 },
      { x: 0, z: 0 },
      { x: 0, z: 8 },
      { x: 8, z: 0 },
      { x: 8, z: 8 }
    ];

    positions.forEach((pos, idx) => {
      const workstation = this.createDesk(pos.x, pos.z, `Рабочее место ${idx + 1}`);
      this.workstations.push({ position: pos, mesh: workstation, occupied: false });
    });
  }

  /**
   * Создать стол с компьютером и стулом
   */
  createDesk(x, z, label) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Коричневый стол
    const deskGeometry = new THREE.BoxGeometry(3, 0.8, 2);
    const deskMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b6914,
      roughness: 0.7,
      metalness: 0.1
    });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.y = 0.4;
    desk.castShadow = true;
    desk.receiveShadow = true;
    group.add(desk);

    // Черный стул
    const chairGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 32);
    const chairMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000000,
      roughness: 0.6,
      metalness: 0.2
    });
    const chair = new THREE.Mesh(chairGeometry, chairMaterial);
    chair.position.set(0, 0.6, 1.2);
    chair.castShadow = true;
    chair.receiveShadow = true;
    group.add(chair);

    // Серый компьютер (монитор)
    const monitorGeometry = new THREE.BoxGeometry(1.5, 1, 0.2);
    const monitorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      roughness: 0.5,
      metalness: 0.3
    });
    const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    monitor.position.set(0, 1.5, -0.8);
    monitor.castShadow = true;
    monitor.receiveShadow = true;
    group.add(monitor);

    // Экран
    const screenGeometry = new THREE.BoxGeometry(1.4, 0.9, 0.05);
    const screenMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      emissive: 0x0066ff,
      emissiveIntensity: 0.3
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 1.5, -0.7);
    group.add(screen);

    this.scene.add(group);
    return group;
  }

  /**
   * Создать визуальное представление агента (персонажа)
   */
  createAgentVisual(agent, startX, startZ) {
    const group = new THREE.Group();
    
    // Голова (сфера)
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf4a460,
      roughness: 0.4
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.9;
    head.castShadow = true;
    group.add(head);

    // Тело (цилиндр)
    const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.3, 1, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: agent.role === 'DIRECTOR' ? 0x4169e1 : 0x32cd32,
      roughness: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    body.castShadow = true;
    group.add(body);

    group.position.set(startX, 0, startZ);
    this.scene.add(group);

    return {
      mesh: group,
      agent: agent,
      targetX: startX,
      targetZ: startZ,
      speed: 0.05
    };
  }

  /**
   * Нанять рабочего и добавить в сцену
   */
  hireWorkerInScene(workerName, taskType = 'GENERAL') {
    const worker = this.agentManager.hireWorker(workerName, taskType);
    if (!worker) return null;

    // Добавить визуальное представление
    const visual = this.createAgentVisual(worker, -12, 10);
    this.agentVisuals.set(worker.id, visual);

    // Назначить ему рабочее место
    const workstation = this.workstations.find(ws => !ws.occupied);
    if (workstation) {
      workstation.occupied = true;
      visual.targetX = workstation.position.x;
      visual.targetZ = workstation.position.z;

      // Автоматически назначить задачу
      this.agentManager.assignTask(worker.id, {
        description: 'Работа на компьютере',
        type: 'WORK'
      });
    }

    return worker;
  }

  /**
   * Уволить рабочего
   */
  fireWorkerFromScene(workerId) {
    const visual = this.agentVisuals.get(workerId);
    if (visual) {
      // Заставить рабочего уйти за пределы офиса
      visual.targetX = -12;
      visual.targetZ = -12;
      visual.leaving = true;
    }

    // Удалить через 2 секунды
    setTimeout(() => {
      if (visual) {
        this.scene.remove(visual.mesh);
        this.agentVisuals.delete(workerId);
      }
      this.agentManager.fireWorker(workerId);

      // Освободить рабочее место
      const workstation = this.workstations.find(
        ws => ws.position.x === visual.targetX && ws.position.z === visual.targetZ
      );
      if (workstation) {
        workstation.occupied = false;
      }
    }, 2000);
  }

  /**
   * Создать директора
   */
  createDirectorInScene(name) {
    const director = this.agentManager.createDirector(name, { x: 0, y: 0, z: -8 });
    
    const visual = this.createAgentVisual(director, 0, -8);
    this.agentVisuals.set(director.id, visual);

    return director;
  }

  /**
   * Настроить анимацию
   */
  setupAnimation() {
    const animate = () => {
      requestAnimationFrame(animate);

      // Обновить позиции агентов
      this.agentVisuals.forEach((visual, agentId) => {
        const agent = visual.agent;
        const mesh = visual.mesh;

        // Вычислить расстояние до цели
        const dx = visual.targetX - mesh.position.x;
        const dz = visual.targetZ - mesh.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance > 0.1) {
          // Движение к цели
          const moveX = (dx / distance) * visual.speed;
          const moveZ = (dz / distance) * visual.speed;
          mesh.position.x += moveX;
          mesh.position.z += moveZ;

          // Поворот в направлении движения
          mesh.rotation.y = Math.atan2(moveX, moveZ);
        }
      });

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  /**
   * Получить статус
   */
  getStatus() {
    return this.agentManager.getStatus();
  }

  /**
   * Обработать изменение размера окна
   */
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

export default Office3D;
