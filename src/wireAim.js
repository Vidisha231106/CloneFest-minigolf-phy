// src/wireAim.js
import * as THREE from 'three';
import { updatePowerUI } from './ui.js';

export function attachAimControls(renderer, camera, ballMesh, ballPhysics, scene, opts = {}) {
  const dom = renderer.domElement;
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const groundY = opts.groundY ?? 0;
  const powerScale = opts.powerScale ?? 3.6;
  const maxPower = opts.maxPower ?? 18;
  const requireShift = (opts.requireShift === undefined) ? (!('ontouchstart' in window)) : opts.requireShift;
  
  // Use custom update function if provided, otherwise fallback to default
  const updatePowerDisplay = opts.updatePowerUI || updatePowerUI;
  
  let isAiming = false;

  const arrow = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), ballMesh.position.clone(), 0.001, 0xffdd00);
  arrow.visible = false;
  scene.add(arrow);

  function screenToGroundPoint(clientX, clientY) {
    const rect = dom.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    ray.setFromCamera(pointer, camera);
    const t = (groundY - ray.ray.origin.y) / ray.ray.direction.y;
    return ray.ray.at(t, new THREE.Vector3());
  }

  dom.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (requireShift && !e.shiftKey) return;
    e.preventDefault();
    isAiming = true;
    arrow.visible = true;
    arrow.position.copy(ballMesh.position);

    // Disable OrbitControls while aiming
    if (opts.onAimStart) opts.onAimStart();
  });

  dom.addEventListener('pointermove', (e) => {
    if (!isAiming) return;
    const p = screenToGroundPoint(e.clientX, e.clientY);
    const dir = p.clone().sub(ballMesh.position);
    const rawDist = dir.length();
    const clamped = Math.min(rawDist, 10);
    const power = Math.min(clamped * powerScale, maxPower);
    
    // Update power display using the provided function
    updatePowerDisplay(power, maxPower);
    
    if (dir.length() > 0.001) {
      dir.normalize();
      arrow.setDirection(dir);
      arrow.setLength(Math.min(3, (power / maxPower) * 3));
      arrow.position.copy(ballMesh.position);
    }

    // Call custom aim move callback if provided
    if (opts.onAimMove) {
      opts.onAimMove(ballMesh.position, dir, power);
    }
  });

  dom.addEventListener('pointerup', (e) => {
    if (!isAiming) return;
    isAiming = false;
    arrow.visible = false;

    // Re-enable OrbitControls after aiming
    if (opts.onAimEnd) opts.onAimEnd();

    const endPoint = screenToGroundPoint(e.clientX, e.clientY);
    const dir = endPoint.clone().sub(ballMesh.position);
    dir.y = 0;
    const dist = dir.length();
    if (dist < 0.02) {
      updatePowerDisplay(0, maxPower);
      return;
    }
    dir.normalize();
    const power = Math.min(dist * powerScale, maxPower);
    ballPhysics.applyShot(dir, power);
    updatePowerDisplay(0, maxPower);
  });
}