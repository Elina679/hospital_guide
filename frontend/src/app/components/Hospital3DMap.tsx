import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { Button } from '@/app/components/ui/button';
import { PathPoint } from '@/app/services/navigationApi';

const FLOOR_HEIGHT = 3;
const ACTIVE_FLOOR_OPACITY = 1;
const FOCUSED_ROUTE_OPACITY = 0.96;
const PATH_ELEVATION = 0.06;
// 相机位置拉远，保证整个楼层平面（±10.2 × ±3.94）在窄屏容器内完整可见
const CAMERA_POSITION = new THREE.Vector3(0, 28, 40);
const ENABLE_WEBXR = false;
const MODEL_MATERIAL_COLORS: Record<string, number> = {
  road: 0xb8d8c7,
  '厕所': 0xb9d9ee,
  '楼梯': 0xf2d79e,
  '电梯': 0xaedfc9,
  '科室': 0xd8c2f0,
  '诊室': 0xd8c2f0,
  '白色': 0xddebf0,
  ball: 0xf3b59e,
  'ball.001': 0xb5d4f3,
  r: 0xb5d4f3,
  '字体': 0x334155,
  字: 0x334155,
  材质: 0x334155,
};
//const NAV_CENTER_X = 160;
//const NAV_CENTER_Y = 110;
//const NAV_SCALE = 0.1;

interface Hospital3DMapProps {
  pathPoints?: PathPoint[];
  startPoint?: PathPoint;
  endPoint?: PathPoint;
  currentFloor?: number;
  onFloorChange?: (floor: number) => void;
  onClose?: () => void;
  showControls?: boolean;
  locationLabels?: DepartmentLabel[];
}

interface FloorModelConfig {
  floor: number;
  obj: string;
  mtl: string;
  name: string;
}

export interface DepartmentLabel {
  id: number;
  name: string;
  floor: number;
  x: number;
  y: number;
  type?: string;
}

export function Hospital3DMap({
  pathPoints = [],
  currentFloor = 1,
  onFloorChange,
  showControls = true,
  locationLabels = [],
}: Hospital3DMapProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const viewedFloorRef = useRef(currentFloor);
  const floorObjectsRef = useRef<Map<number, THREE.Object3D>>(new Map());
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const labelGroupsRef = useRef<Map<number, THREE.Group>>(new Map());
  const pathGroupRef = useRef<THREE.Group | null>(null);
  const xrSessionRef = useRef<XRSession | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVrSupported, setIsVrSupported] = useState(false);
  const [vrSupportMessage, setVrSupportMessage] = useState('正在检测 WebXR 支持...');
  const [isVrActive, setIsVrActive] = useState(false);
  const [isVrPending, setIsVrPending] = useState(false);

  const floorModels: FloorModelConfig[] = [
    { floor: 1, obj: 'm1F.obj', mtl: 'm1F.mtl', name: '1F' },
    { floor: 2, obj: 'm2F.obj', mtl: 'm2F.mtl', name: '2F' },
    { floor: 3, obj: 'm3F.obj', mtl: 'm3F.mtl', name: '3F' },
    { floor: 4, obj: 'm4F.obj', mtl: 'm4F.mtl', name: '4F' },
  ];

  const focusFloor = currentFloor;

  const setMountedState = <T,>(setter: (value: T) => void, value: T) => {
    if (isMountedRef.current) {
      setter(value);
    }
  };

  const getFloorOffset = (floor: number) => (floor - 1) * FLOOR_HEIGHT;

  const getFocusY = () => getFloorOffset(currentFloor);

  const disposeObject = (object: THREE.Object3D) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else {
          child.material.dispose();
        }
      }

      if (child instanceof THREE.Line) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
  };

  const setupLighting = (scene: THREE.Scene) => {
    scene.add(new THREE.AmbientLight(0xffffff, 1.15));

    const topAmbientLight = new THREE.HemisphereLight(0xffffff, 0xe2edf2, 0.45);
    topAmbientLight.position.set(0, 40, 0);
    scene.add(topAmbientLight);

    const primaryLight = new THREE.DirectionalLight(0xffffff, 0.75);
    primaryLight.position.set(24, 30, 18);
    scene.add(primaryLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillLight.position.set(-18, 18, -12);
    scene.add(fillLight);
  };

  const addEnvironmentElements = (scene: THREE.Scene) => {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(140, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xdff2ff,
        side: THREE.BackSide,
      })
    );
    scene.add(sky);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshBasicMaterial({ color: 0xf3f4f4 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    const grid = new THREE.GridHelper(30, 30, 0xe7eef0, 0xf2f6f7);
    grid.position.y = -0.49;
    scene.add(grid);
  };

  const applyFloorOpacity = (object: THREE.Object3D, opacity: number) => {
    object.visible = true;
    object.renderOrder = opacity === ACTIVE_FLOOR_OPACITY ? 10 : 1;

    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        material.transparent = opacity < 0.999;
        material.opacity = opacity;
        material.depthWrite = opacity > 0.45;
        material.needsUpdate = true;
      });
    });
  };

  const syncCameraTarget = () => {
    if (!cameraRef.current || !controlsRef.current) {
      return;
    }

    const floorOffset = (currentFloor - viewedFloorRef.current) * FLOOR_HEIGHT;
    controlsRef.current.target.y += floorOffset;

    if (!isVrActive && floorOffset !== 0) {
      cameraRef.current.position.y += floorOffset;
    }

    viewedFloorRef.current = currentFloor;
    controlsRef.current.update();
  };

  const updateFloorVisibility = () => {
    floorObjectsRef.current.forEach((object, floor) => {
      if (floor !== focusFloor) {
        object.visible = false;
        return;
      }

      applyFloorOpacity(object, ACTIVE_FLOOR_OPACITY);
    });

    labelGroupsRef.current.forEach((group, floor) => {
      group.visible = floor === focusFloor;
    });

    syncCameraTarget();
  };

  const createFallbackFloorModel = (floor: number) => {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(20.4, 0.2, 7.86),
      new THREE.MeshLambertMaterial({ color: 0xe0e8e8 })
    );
    mesh.position.set(0, 0, 0);
    group.add(mesh);
    group.position.set(0, getFloorOffset(floor), 0);
    group.userData = { type: 'floor_model', floor };
    return group;
  };

  const setupFloorModel = (object: THREE.Group, floor: number) => {
    object.position.set(0, getFloorOffset(floor), 0);
    object.scale.set(1, 1, 1);
    object.userData = { type: 'floor_model', floor };

    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          // 模型里的文字（材质"字体/字/材质"）与房间错配，且 2F/3F 无文字：
          // 全部隐藏，改由前端用数据库坐标统一标注
          const matName = material.name || '';
          if (matName.includes('字体') || matName === '字' || matName === '材质') {
            child.visible = false;
            return;
          }
          // 隐藏模型自带的小圆球（ball/r 装饰球），不再显示
          if (matName === 'ball' || matName.startsWith('ball.') || matName === 'r') {
            child.visible = false;
            return;
          }

          const color = MODEL_MATERIAL_COLORS[material.name];
          if (color === undefined || !('color' in material)) {
            return;
          }

          (material as THREE.MeshPhongMaterial).color.setHex(color);
          if ('specular' in material) {
            (material as THREE.MeshPhongMaterial).specular.setHex(0x40505a);
          }
          material.needsUpdate = true;
        });
      }
    });
  };

  const loadSingleFloorModel = async (floorData: FloorModelConfig) => {
    const modelBasePath = '/models/';

    try {
      const object = await new Promise<THREE.Group>((resolve, reject) => {
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();

        mtlLoader.load(
          `${modelBasePath}${floorData.mtl}`,
          (materials) => {
            materials.preload();
            objLoader.setMaterials(materials);
            objLoader.load(
              `${modelBasePath}${floorData.obj}`,
              (loadedObject) => resolve(loadedObject),
              undefined,
              (loadError) => reject(loadError)
            );
          },
          undefined,
          (loadError) => reject(loadError)
        );
      });

      setupFloorModel(object, floorData.floor);
      return object;
    } catch (loadError) {
      console.error(`Failed to load floor ${floorData.floor}`, loadError);
      return createFallbackFloorModel(floorData.floor);
    }
  };

  const loadAllFloorModels = async () => {
    if (!sceneRef.current) {
      return;
    }

    setMountedState(setIsLoading, true);
    setMountedState(setError, null);

    const loadedObjects = await Promise.all(floorModels.map((floor) => loadSingleFloorModel(floor)));

    loadedObjects.forEach((object, index) => {
      const floor = floorModels[index].floor;
      sceneRef.current?.add(object);
      floorObjectsRef.current.set(floor, object);
    });

    updateFloorVisibility();
    setMountedState(setIsLoading, false);
  };

  const clearPathGroup = () => {
    if (!sceneRef.current || !pathGroupRef.current) {
      return;
    }

    sceneRef.current.remove(pathGroupRef.current);
    disposeObject(pathGroupRef.current);
    pathGroupRef.current = null;
  };

  // 后端的平面 y 来自 OBJ 的 Z 坐标，保持原方向，不做镜像翻转。
  const pointToVector = (point: PathPoint) =>
    new THREE.Vector3(
      point.x,
      getFloorOffset(point.floor) + PATH_ELEVATION,
      point.y
    );

  const getRouteOpacityForFloor = (floor: number) => {
    return floor === focusFloor ? FOCUSED_ROUTE_OPACITY : 0;
  };

  const renderFrame = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!renderer || !scene || !camera) {
      return;
    }

    if (controls?.enabled) {
      controls.update();
    }

    renderer.render(scene, camera);

    if (labelRendererRef.current) {
      labelRendererRef.current.render(scene, camera);
    }
  };

  const stopStandardRenderLoop = () => {
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  };

  const startStandardRenderLoop = () => {
    const renderer = rendererRef.current;

    if (!renderer || xrSessionRef.current) {
      return;
    }

    renderer.setAnimationLoop(null);
    stopStandardRenderLoop();

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      renderFrame();
    };

    animate();
  };

  const restoreStandardMode = () => {
    const renderer = rendererRef.current;
    const controls = controlsRef.current;

    if (renderer) {
      renderer.setAnimationLoop(null);
    }

    if (controls) {
      controls.enabled = true;
      controls.update();
    }

    xrSessionRef.current = null;
    setMountedState(setIsVrActive, false);
    setMountedState(setIsVrPending, false);
    startStandardRenderLoop();
  };

  const handleVrSessionEnded = () => {
    restoreStandardMode();
  };

  const drawNavigationPath = (points: PathPoint[]) => {
    console.log('drawNavigationPath called, points =', points);
    if (!sceneRef.current) {
      return;
    }

    clearPathGroup();

    if (points.length === 0) {
      return;
    }

    const group = new THREE.Group();
    group.userData = { type: 'navigation_path' };

    for (let index = 0; index < points.length - 1; index += 1) {
      const start = points[index];
      const end = points[index + 1];

  // 跨楼层时不画线
      if (start.floor !== end.floor) {
        continue;
      }

      const startVector = pointToVector(start);
      const endVector = pointToVector(end);
      const segmentOpacity = start.floor === focusFloor ? FOCUSED_ROUTE_OPACITY : 0;

      const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([startVector, endVector]),
      new THREE.LineBasicMaterial({
        color: 0x6d9eb8,
        transparent: true,
        opacity: segmentOpacity,
      })
    );

      group.add(line);
  }

    sceneRef.current.add(group);
    pathGroupRef.current = group;
  };

  const clearFloorLabels = () => {
    labelGroupsRef.current.forEach((group) => {
      sceneRef.current?.remove(group);
      group.traverse((child) => {
        if (child instanceof CSS2DObject) {
          child.element.remove();
        }
      });
    });
    labelGroupsRef.current.clear();
  };

  // 用数据库坐标在模型上渲染科室名称标注（与路径终点同一坐标系，天然对齐）
  const createFloorLabels = (labels: DepartmentLabel[]) => {
    if (!sceneRef.current) {
      return;
    }

    clearFloorLabels();

    const byFloor = new Map<number, DepartmentLabel[]>();
    labels.forEach((label) => {
      const name = label.name || '';
      // 只标注科室/楼梯/电梯/厕所等真实功能点，跳过网格走廊点和内部节点
      if (label.type === 'grid' || label.type === 'path_node') {
        return;
      }
      if (
        !name ||
        name.startsWith('科室_') ||
        name.startsWith('corner') ||
        name.startsWith('hub') ||
        name.startsWith('走廊点_') ||
        name.startsWith('接驳点_') ||
        name.startsWith('楼梯口_')
      ) {
        return;
      }
      const list = byFloor.get(label.floor) || [];
      list.push(label);
      byFloor.set(label.floor, list);
    });

    byFloor.forEach((list, floor) => {
      const group = new THREE.Group();
      group.userData = { type: 'floor_labels', floor };
      list.forEach((label) => {
        const el = document.createElement('div');
        el.textContent = label.name;
        el.style.position = 'absolute';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.fontSize = '18px';
        el.style.color = '#1e293b';
        el.style.background = 'rgba(255,255,255,0.94)';
        el.style.padding = '2px 8px';
        el.style.borderRadius = '6px';
        el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.22)';
        el.style.pointerEvents = 'none';
        el.style.whiteSpace = 'nowrap';
        el.style.lineHeight = '1.5';
        el.style.fontWeight = '600';
        const labelObject = new CSS2DObject(el);
        labelObject.position.set(
          label.x,
          getFloorOffset(label.floor) + 0.45,
          label.y
        );
        group.add(labelObject);
      });
      sceneRef.current?.add(group);
      labelGroupsRef.current.set(floor, group);
    });

    updateFloorVisibility();
  };

  const exitVrSession = async () => {
    const session = xrSessionRef.current;

    if (!session) {
      restoreStandardMode();
      return;
    }

    setMountedState(setIsVrPending, true);

    try {
      await session.end();
    } catch (sessionError) {
      console.error('Failed to end VR session', sessionError);
      restoreStandardMode();
    }
  };

  const enterVrSession = async () => {
    if (!ENABLE_WEBXR) {
      setMountedState(setIsVrSupported, false);
      setMountedState(setVrSupportMessage, 'VR 功能已临时关闭');
      return;
    }
    const renderer = rendererRef.current;
    const controls = controlsRef.current;

    if (!renderer || !navigator.xr || isVrPending || xrSessionRef.current) {
      return;
    }

    setMountedState(setIsVrPending, true);

    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor'],
      });

      xrSessionRef.current = session;
      session.addEventListener('end', handleVrSessionEnded);

      stopStandardRenderLoop();
      renderer.xr.enabled = ENABLE_WEBXR;
      await renderer.xr.setSession(session);

      if (controls) {
        controls.enabled = false;
      }

      renderer.setAnimationLoop(() => {
        renderFrame();
      });

      setMountedState(setIsVrActive, true);
      setMountedState(setIsVrPending, false);
    } catch (sessionError) {
      console.error('Failed to start VR session', sessionError);
      xrSessionRef.current = null;
      setMountedState(setIsVrActive, false);
      setMountedState(setIsVrPending, false);
      setMountedState(
        setVrSupportMessage,
        '无法进入 VR，请确认使用支持 WebXR 的浏览器，并在 HTTPS 或 localhost 环境访问。'
      );
      startStandardRenderLoop();
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (!mountRef.current) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdff2ff);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      58,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.copy(CAMERA_POSITION);
    camera.lookAt(0, getFocusY(), 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.xr.enabled = ENABLE_WEBXR;
    renderer.domElement.style.touchAction = 'none';
    rendererRef.current = renderer;

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    labelRendererRef.current = labelRenderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.screenSpacePanning = true;
    controls.minDistance = 6;
    controls.maxDistance = 150;
    controls.zoomSpeed = 1.1;
    controls.panSpeed = 1.1;
    controls.rotateSpeed = 0.9;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controls.target.set(0, getFocusY(), 0);
    controlsRef.current = controls;

    setupLighting(scene);
    addEnvironmentElements(scene);
    void loadAllFloorModels();

    mountRef.current.appendChild(renderer.domElement);
    mountRef.current.appendChild(labelRenderer.domElement);
    startStandardRenderLoop();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) {
        return;
      }

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
      labelRendererRef.current?.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMountedRef.current = false;
      stopStandardRenderLoop();
      renderer.setAnimationLoop(null);

      const session = xrSessionRef.current;
      if (session) {
        session.removeEventListener('end', handleVrSessionEnded);
        void session.end().catch((sessionError) => {
          console.error('Failed to end VR session during cleanup', sessionError);
        });
        xrSessionRef.current = null;
      }

      window.removeEventListener('resize', handleResize);
      clearPathGroup();
      clearFloorLabels();
      floorObjectsRef.current.forEach((object) => disposeObject(object));
      floorObjectsRef.current.clear();
      controls.dispose();
      renderer.dispose();
      labelRendererRef.current = null;

      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
  if (!ENABLE_WEBXR) {
    setIsVrSupported(false);
    setVrSupportMessage('VR 功能已临时关闭');
    return;
  }

  let cancelled = false;

  const detectVrSupport = async () => {
    if (!navigator.xr) {
      if (!cancelled) {
        setMountedState(setIsVrSupported, false);
        setMountedState(setVrSupportMessage, '当前浏览器不支持 WebXR，无法进入 VR。');
      }
      return;
    }

    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr');

      if (!cancelled) {
        setMountedState(setIsVrSupported, supported);
        setMountedState(
          setVrSupportMessage,
          supported ? '当前设备支持 WebXR，可进入 VR 模式。' : '当前设备或浏览器不支持沉浸式 VR。'
        );
      }
    } catch (supportError) {
      console.error('Failed to detect WebXR support', supportError);

      if (!cancelled) {
        setMountedState(setIsVrSupported, false);
        setMountedState(setVrSupportMessage, 'WebXR 检测失败，请确认浏览器权限和运行环境。');
      }
    }
  };

  void detectVrSupport();

  return () => {
    cancelled = true;
  };
}, []);

  useEffect(() => {
    updateFloorVisibility();
  }, [currentFloor, isVrActive]);

  useEffect(() => {
    drawNavigationPath(pathPoints);
  }, [pathPoints, currentFloor]);

  useEffect(() => {
    createFloorLabels(locationLabels);
  }, [locationLabels]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <div ref={mountRef} className="h-full w-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm text-slate-600 backdrop-blur-[1px]">
          正在加载楼层模型...
        </div>
      )}

      {error && (
        <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 shadow">
          {error}
        </div>
      )}
{/*
      <div className="absolute right-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-col items-end gap-2">
        <div className="rounded-lg border border-slate-200 bg-white/92 px-3 py-2 text-xs text-slate-600 shadow-md">
          {isVrActive ? 'VR 模式已开启，头显接管视角控制。' : '拖动旋转，双指平移缩放。'}
        </div>

        <div className="flex flex-col items-end gap-2 rounded-lg border border-slate-200 bg-white/92 p-2 shadow-md backdrop-blur-sm">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (isVrActive) {
                void exitVrSession();
              } else {
                void enterVrSession();
              }
            }}
            disabled={(!isVrSupported && !isVrActive) || isVrPending}
            className="min-w-[7rem]"
          >
            {isVrPending ? '处理中...' : isVrActive ? '退出 VR' : '进入 VR'}
          </Button>
          <p className="max-w-[15rem] text-right text-[11px] leading-4 text-slate-500">
            {vrSupportMessage}
          </p>
        </div>
      </div>
*/}
      {showControls && (
        <div className="absolute left-2 top-[calc(50%-82px)] z-10 flex -translate-y-1/2 flex-col gap-1 rounded-lg border border-gray-200 bg-white/90 p-2 shadow-lg backdrop-blur-sm">
          <div className="mb-1 text-center text-xs font-semibold text-gray-600">楼层</div>
          {floorModels.map((floor) => (
            <Button
              key={floor.floor}
              size="sm"
              variant={currentFloor === floor.floor ? 'default' : 'outline'}
              onClick={() => {
                onFloorChange?.(floor.floor);
              }}
              className={`min-w-[2.4rem] px-2 py-1 text-xs font-medium transition-all duration-200 ${
                currentFloor === floor.floor
                  ? 'scale-105 bg-sky-100 text-sky-800 shadow-md'
                  : 'bg-white text-gray-700 hover:border-sky-200 hover:bg-sky-50'
              }`}
              title={floor.name}
            >
              {floor.floor}F
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
