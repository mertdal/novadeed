import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStarStore } from '../../stores/useStarStore';

const MOVE_SPEED = 80;
const ORBIT_DISTANCE = 25; // distance from star in orbit mode
const ORBIT_MIN = 12;
const ORBIT_MAX = 80;

export default function CameraControls() {
  const { camera, gl } = useThree();
  const isFocusMode = useStarStore((s) => s.isFocusMode);
  const focusedStar = useStarStore((s) => s.focusedStar);
  const isMoving = useStarStore((s) => s.isMoving);
  const setIsMoving = useStarStore((s) => s.setIsMoving);
  const setCameraPosition = useStarStore((s) => s.setCameraPosition);

  // Drag state
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  // Free navigation euler
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  // Orbit mode state
  const orbitSpherical = useRef(new THREE.Spherical(ORBIT_DISTANCE, Math.PI / 2, 0));
  const orbitCenter = useRef(new THREE.Vector3());

  // Movement (forward/backward/side)
  const moveStart = useRef(new THREE.Vector3());
  const moveEnd = useRef(new THREE.Vector3());
  const moveProgress = useRef(1);
  const moveDuration = useRef(1.0);

  // Track saved position to restore on exit focus
  const savedPosition = useRef(new THREE.Vector3());
  const savedQuaternion = useRef(new THREE.Quaternion());

  // Init
  useEffect(() => {
    camera.lookAt(new THREE.Vector3(0, 0, -100));
    euler.current.setFromQuaternion(camera.quaternion);
  }, [camera]);

  // Cinematic fly-to-star with GSAP
  useEffect(() => {
    if (focusedStar && isFocusMode) {
      savedPosition.current.copy(camera.position);
      savedQuaternion.current.copy(camera.quaternion);

      const starPos = focusedStar.position;
      orbitCenter.current.copy(starPos);

      const dir = new THREE.Vector3()
        .subVectors(camera.position, starPos)
        .normalize();
      const targetPos = new THREE.Vector3()
        .copy(starPos)
        .add(dir.multiplyScalar(ORBIT_DISTANCE));

      const posObj = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      };

      setIsMoving(true);

      gsap.to(posObj, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 2.5,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.position.set(posObj.x, posObj.y, posObj.z);
          camera.lookAt(starPos);
        },
        onComplete: () => {
          const offset = new THREE.Vector3().subVectors(
            camera.position,
            orbitCenter.current
          );
          orbitSpherical.current.setFromVector3(offset);
          setIsMoving(false);
        },
      });
    }
  }, [focusedStar, isFocusMode, camera, setIsMoving]);

  // Restore camera on focus exit
  const exitFocusFn = useStarStore((s) => s.exitFocus);
  useEffect(() => {
    (window as any).__starbound_exitFocus = () => {
      if (!isFocusMode) return;

      const posObj = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      };

      setIsMoving(true);
      exitFocusFn();

      gsap.to(posObj, {
        x: savedPosition.current.x,
        y: savedPosition.current.y,
        z: savedPosition.current.z,
        duration: 2.0,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.position.set(posObj.x, posObj.y, posObj.z);
          camera.quaternion.slerp(savedQuaternion.current, 0.05);
        },
        onComplete: () => {
          camera.quaternion.copy(savedQuaternion.current);
          euler.current.setFromQuaternion(camera.quaternion);
          setIsMoving(false);
        },
      });
    };

    return () => {
      delete (window as any).__starbound_exitFocus;
    };
  }, [isFocusMode, camera, exitFocusFn, setIsMoving]);

  // Handle keyboard movement
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Handle Escape always
      if (e.key === 'Escape' && (window as any).__starbound_exitFocus) {
        (window as any).__starbound_exitFocus();
        return;
      }

      if (isMoving || isFocusMode) return;
      
      const direction = new THREE.Vector3();
      const right = new THREE.Vector3();
      
      if (key === 'w' || key === 's') {
        camera.getWorldDirection(direction).normalize();
        const dist = key === 'w' ? MOVE_SPEED : -MOVE_SPEED;
        moveStart.current.copy(camera.position);
        moveEnd.current.copy(camera.position).add(direction.multiplyScalar(dist));
        moveProgress.current = 0;
        moveDuration.current = 1.0;
        setIsMoving(true);
      } else if (key === 'a' || key === 'd') {
        camera.getWorldDirection(direction).normalize();
        right.crossVectors(camera.up, direction).normalize();
        const dist = key === 'a' ? MOVE_SPEED : -MOVE_SPEED;
        moveStart.current.copy(camera.position);
        moveEnd.current.copy(camera.position).add(right.multiplyScalar(dist));
        moveProgress.current = 0;
        moveDuration.current = 1.0;
        setIsMoving(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [camera, isMoving, isFocusMode, setIsMoving]);

  // Mouse/Wheel handlers
  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0) {
        isDragging.current = true;
        previousMouse.current = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
      }
    };

    const onPointerUp = () => {
      isDragging.current = false;
      canvas.style.cursor = isFocusMode ? 'default' : 'grab';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - previousMouse.current.x;
      const deltaY = e.clientY - previousMouse.current.y;
      previousMouse.current = { x: e.clientX, y: e.clientY };

      if (isFocusMode) {
        orbitSpherical.current.theta -= deltaX * 0.005;
        orbitSpherical.current.phi -= deltaY * 0.005;
        orbitSpherical.current.phi = Math.max(0.2, Math.min(Math.PI - 0.2, orbitSpherical.current.phi));
      } else {
        euler.current.y -= deltaX * 0.003;
        euler.current.x -= deltaY * 0.003;
        euler.current.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, euler.current.x));
        camera.quaternion.setFromEuler(euler.current);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isFocusMode) {
        let dynamicOrbitMin = ORBIT_MIN;
        if (focusedStar) {
          const sphereRadius = Math.max(2, focusedStar.size * 1.2);
          dynamicOrbitMin = sphereRadius + 3.5;
        }
        orbitSpherical.current.radius += e.deltaY * 0.05;
        orbitSpherical.current.radius = Math.max(dynamicOrbitMin, Math.min(ORBIT_MAX, orbitSpherical.current.radius));
      } else {
        if (isMoving) return;
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        const speed = e.deltaY > 0 ? -30 : 30;
        moveStart.current.copy(camera.position);
        moveEnd.current.copy(camera.position).add(direction.multiplyScalar(speed));
        moveProgress.current = 0;
        moveDuration.current = 0.5;
        setIsMoving(true);
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [camera, gl, isFocusMode, isMoving, setIsMoving, focusedStar]);

  // Global methods for arrows
  useEffect(() => {
    (window as any).__starbound_moveForward = () => {
      if (isMoving || isFocusMode) return;
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction).normalize();
      moveStart.current.copy(camera.position);
      moveEnd.current.copy(camera.position).add(direction.multiplyScalar(MOVE_SPEED));
      moveProgress.current = 0;
      moveDuration.current = 1.2;
      setIsMoving(true);
    };

    (window as any).__starbound_moveBackward = () => {
      if (isMoving || isFocusMode) return;
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction).normalize();
      moveStart.current.copy(camera.position);
      moveEnd.current.copy(camera.position).add(direction.multiplyScalar(-MOVE_SPEED));
      moveProgress.current = 0;
      moveDuration.current = 1.2;
      setIsMoving(true);
    };

    return () => {
      delete (window as any).__starbound_moveForward;
      delete (window as any).__starbound_moveBackward;
    };
  }, [camera, isMoving, isFocusMode, setIsMoving]);

  const frameCount = useRef(0);

  useFrame(() => {
    if (isFocusMode && focusedStar && !isMoving) {
      const offset = new THREE.Vector3().setFromSpherical(orbitSpherical.current);
      camera.position.copy(orbitCenter.current).add(offset);
      camera.lookAt(orbitCenter.current);
    }

    if (!isFocusMode && moveProgress.current < 1) {
      moveProgress.current += 0.016 / moveDuration.current;
      moveProgress.current = Math.min(moveProgress.current, 1);
      const t = moveProgress.current;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      camera.position.lerpVectors(moveStart.current, moveEnd.current, ease);
      if (moveProgress.current >= 1) setIsMoving(false);
    }

    frameCount.current++;
    if (frameCount.current % 12 === 0) {
      setCameraPosition([
        Math.round(camera.position.x * 10) / 10,
        Math.round(camera.position.y * 10) / 10,
        Math.round(camera.position.z * 10) / 10,
      ]);
    }
  });

  return null;
}
