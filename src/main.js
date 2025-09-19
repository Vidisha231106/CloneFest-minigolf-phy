// src/main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BallPhysics } from './physics.js';
import { attachAimControls } from './wireAim.js';
import {
  updateHUDStroke,
  updateHUDHole,
  updatePowerUI,
  showHoleComplete,
  hideHoleComplete,
  updateBestText,
} from './ui.js';
import { levels } from './levels.js';
import { initAuth, createAuthUI, isUserAuthenticated } from './auth.js';
import { saveBestScore, getBestScore } from './supabase.js';
import { AccessibilityManager } from './accessibilityFeatures.js';
import { EnhancedScoringDisplay } from './enhancedScoring.js';
import { TutorialSystem } from './tutorial.js';
import { SettingsPanel } from './settings.js';
import { LevelSelector } from './levelSelector.js';
import { LeaderboardSystem } from './leaderboard.js';
import { MobileUIEnhancer } from './mobileUI.js';

// Bridge Functions for UI Integration
function updatePowerUIBridge(power, maxPower = 1) {
  const pct = Math.round((power / (maxPower || 1)) * 100);
  
  // Debug logging to see what's happening
  if (power > 0) {
    console.log('Power update:', power, 'Percentage:', pct + '%');
  }
  
  // Update OLD UI system (basic HUD) - check if it exists and is visible
  const oldPowerFill = document.getElementById('powerfill');
  if (oldPowerFill) {
    oldPowerFill.style.width = Math.min(100, Math.max(0, pct)) + '%';
    oldPowerFill.style.visibility = 'visible';
    oldPowerFill.style.display = 'block';
    console.log('Updated old power fill:', oldPowerFill.style.width);
  }
  
  // Update ENHANCED UI system - this is the one that should be working
  const enhancedPowerFill = document.querySelector('#enhancedHUD #powerfill');
  if (enhancedPowerFill) {
    enhancedPowerFill.style.width = Math.min(100, Math.max(0, pct)) + '%';
    enhancedPowerFill.style.visibility = 'visible';
    enhancedPowerFill.style.display = 'block';
    console.log('Updated enhanced power fill:', enhancedPowerFill.style.width);
  }
  
  // Update power percentage display
  const powerPercentage = document.getElementById('powerPercentage');
  if (powerPercentage) {
    powerPercentage.textContent = pct + '%';
    powerPercentage.style.visibility = 'visible';
    console.log('Updated power percentage:', powerPercentage.textContent);
  }
  
  // Use the enhanced scoring system if available
  if (window.enhancedScoring && typeof window.enhancedScoring.updatePowerDisplay === 'function') {
    window.enhancedScoring.updatePowerDisplay(power, maxPower);
    console.log('Called enhanced scoring power update');
  }
  
  // Force visibility with CSS
  forcePowerBarVisibility();
}

// Add this helper function to ensure power bars stay visible
function forcePowerBarVisibility() {
  const style = document.createElement('style');
  style.id = 'powerBarForceVisible';
  
  // Remove existing style if it exists
  const existing = document.getElementById('powerBarForceVisible');
  if (existing) existing.remove();
  
  style.textContent = `
    #powerfill, #enhancedHUD #powerfill {
      visibility: visible !important;
      display: block !important;
      opacity: 1 !important;
      z-index: 1000 !important;
    }
    
    #powerPercentage {
      visibility: visible !important;
      display: inline !important;
      opacity: 1 !important;
    }
    
    #enhancedHUD {
      z-index: 100 !important;
      visibility: visible !important;
    }
    
    #powerbar {
      visibility: visible !important;
      display: block !important;
    }
  `;
  
  document.head.appendChild(style);
}

function updateStrokesBridge(strokes) {
  // Update both systems
  if (typeof updateHUDStroke === 'function') {
    updateHUDStroke(strokes);
  }
  
  if (window.enhancedScoring) {
    window.enhancedScoring.updateStrokes(strokes);
  }
  
  // Announce for accessibility
  if (window.accessibilityManager && strokes > 0) {
    window.accessibilityManager.announceToScreenReader(`Stroke ${strokes}`);
  }
}

// Button handling functions
function setupButtonIntegration() {
  // Remove old event listeners to avoid conflicts
  const oldButtons = document.querySelectorAll('#resetBtn, #nextBtn, #followBtn');
  oldButtons.forEach(btn => {
    if (btn) {
      // Clone node to remove all event listeners
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
    }
  });

  // Add new unified event delegation
  document.addEventListener('click', (e) => {
    const target = e.target;
    
    if (target.id === 'resetBtn' || target.classList.contains('reset-btn')) {
      handleResetClick();
      e.preventDefault();
    } else if (target.id === 'nextBtn' || target.classList.contains('next-btn')) {
      handleNextClick();
      e.preventDefault();
    } else if (target.id === 'followBtn' || target.classList.contains('follow-btn')) {
      handleFollowClick(target);
      e.preventDefault();
    } else if (target.id === 'nextLevelBtn') {
      handleNextLevelClick();
      e.preventDefault();
    } else if (target.id === 'replayBtn') {
      handleReplayClick();
      e.preventDefault();
    }
  });
}

function handleResetClick() {
  if (window.ballPhysics) {
    window.ballPhysics.resetToStart();
    updateStrokesBridge(0);
    hideHoleComplete();
    restoreBallVisual();
    
    if (window.accessibilityManager) {
      window.accessibilityManager.announceToScreenReader('Ball reset to starting position.');
    }
  }
}

function handleNextClick() {
  if (typeof nextLevel === 'function') {
    nextLevel();
  }
}

function handleFollowClick(button) {
  if (typeof followBall !== 'undefined') {
    window.followBall = !window.followBall;
    const followText = `Follow: ${window.followBall ? 'On' : 'Off'}`;
    button.innerText = followText;
    button.setAttribute('aria-label', `Camera following ball is ${window.followBall ? 'enabled' : 'disabled'}`);
    button.setAttribute('aria-pressed', window.followBall.toString());

    if (window.accessibilityManager) {
      window.accessibilityManager.announceToScreenReader(`Camera following ${window.followBall ? 'enabled' : 'disabled'}.`);
    }
  }
}

function handleNextLevelClick() {
  hideHoleComplete();
  nextLevel();
}

function handleReplayClick() {
  hideHoleComplete();
  loadLevel(levelIndex);
}

// Initialize auth system
initAuth().then(() => {
  console.log('Auth initialized');
}).catch(err => {
  console.error('Auth init failed:', err);
});

// Create auth UI
createAuthUI();

// Initialize all UI systems
let accessibilityManager;
let enhancedScoring;
let tutorialSystem;
let settingsPanel;
let levelSelector;
let leaderboardSystem;
let mobileUI;

try {
  // Initialize accessibility manager
  accessibilityManager = new AccessibilityManager();
  accessibilityManager.loadPreferences();
  window.accessibilityManager = accessibilityManager;
  console.log('Accessibility features initialized');

  // Initialize enhanced scoring display
  enhancedScoring = new EnhancedScoringDisplay();
  window.enhancedScoring = enhancedScoring;
  console.log('Enhanced scoring initialized');

  // Initialize tutorial system
  tutorialSystem = new TutorialSystem();
  window.tutorialSystem = tutorialSystem;
  console.log('Tutorial system initialized');

  // Initialize settings panel
  settingsPanel = new SettingsPanel();
  window.settingsPanel = settingsPanel;
  console.log('Settings panel initialized');

  // Initialize mobile UI enhancements
  if (MobileUIEnhancer.isMobileDevice()) {
    mobileUI = new MobileUIEnhancer();
    console.log('Mobile UI initialized');
  }

} catch (err) {
  console.error('Failed to initialize UI systems:', err);
}

/* ----------------- START OVERLAY HANDLING ----------------- */
const startOverlay = document.getElementById('startOverlay');
const playBtn = document.getElementById('playBtn');
const settingsBtn = document.getElementById('settingsBtn');
const howtoBtn = document.getElementById('howtoBtn');

function showStartScreen() {
  startOverlay.style.display = 'flex';

  // Announce to screen readers
  if (accessibilityManager) {
    accessibilityManager.announceToScreenReader('Welcome to Minigolf Mania! Press Play to begin.');
  }
}

function hideStartScreen() {
  startOverlay.style.display = 'none';

  // Announce game start
  if (accessibilityManager) {
    accessibilityManager.announceToScreenReader('Game started. You are now on the playing field.');
  }
}

// Button interactions
playBtn.addEventListener('click', () => {
  hideStartScreen();

  // Show tutorial for first-time players
  const hasSeenTutorial = localStorage.getItem('minigolf_tutorial_seen');
  if (!hasSeenTutorial && tutorialSystem) {
    setTimeout(() => {
      tutorialSystem.show();
      localStorage.setItem('minigolf_tutorial_seen', 'true');
    }, 1000);
  }
});

// Update settings button to use the settings panel
settingsBtn.addEventListener('click', () => {
  if (settingsPanel) {
    settingsPanel.show();
  } else if (accessibilityManager) {
    accessibilityManager.toggleAccessibilityPanel();
  } else {
    alert('Settings panel loading...');
  }
});

// Update how-to button to use tutorial system
howtoBtn.addEventListener('click', () => {
  if (tutorialSystem) {
    tutorialSystem.show();
  } else {
    alert('Tutorial system loading...');
  }
});

// renderer
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Make renderer globally accessible
window.renderer = renderer;

const scene = new THREE.Scene();
window.scene = scene;

// texture loader
const texLoader = new THREE.TextureLoader();

// textures
let grassTex;
try {
  grassTex = texLoader.load('/textures/grass.jpg');
  grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
  grassTex.repeat.set(20, 20);
} catch (e) {
  console.warn('Grass texture not found, using solid color');
  grassTex = null;
}

let wallTex;
try {
  wallTex = texLoader.load('/textures/wood.jpg');
  wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
} catch (e) {
  console.warn('Wall texture not found, using solid color');
  wallTex = null;
}

// sky
try {
  const skyTex = texLoader.load('/textures/sky.jpg');
  const skyGeo = new THREE.SphereGeometry(100, 32, 32);
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyMesh);
} catch (e) {
  scene.background = new THREE.Color(0x88caff);
}

// camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 6, 10);
window.camera = camera;

// controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.2, 0);
controls.update();
window.controls = controls;

// lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.5));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 10, 5);
dir.castShadow = true;
scene.add(dir);
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

// ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  grassTex ?
    new THREE.MeshStandardMaterial({ map: grassTex }) :
    new THREE.MeshStandardMaterial({ color: 0x4a7c59 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ball
const BALL_RADIUS = 0.12;
const ballGeo = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
const ballMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.2,
  roughness: 0.3,
});
const ball = new THREE.Mesh(ballGeo, ballMat);
ball.castShadow = true;
scene.add(ball);

// helpers
let levelIndex = 0;
let levelMeshes = [];
let holeMesh = null;

function makeWall(x, z, w, d, h = 0.5) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = wallTex ?
    new THREE.MeshStandardMaterial({ map: wallTex }) :
    new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, h / 2, z);
  m.receiveShadow = true;
  scene.add(m);
  levelMeshes.push(m);
  return m;
}

function makeHoleMesh(pos, radius) {
  const group = new THREE.Group();

  const topRadius = radius * 1.05;
  const bottomRadius = radius * 0.95;
  const cupDepth = 0.22;
  const cupGeo = new THREE.CylinderGeometry(
    topRadius,
    bottomRadius,
    cupDepth,
    64,
    1,
    true
  );
  const cupMat = new THREE.MeshStandardMaterial({
    color: 0x202020,
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const cup = new THREE.Mesh(cupGeo, cupMat);
  cup.position.set(pos.x, -cupDepth / 2, pos.z);
  cup.castShadow = false;
  cup.receiveShadow = true;
  group.add(cup);

  const baseGeo = new THREE.CircleGeometry(bottomRadius, 64);
  baseGeo.rotateX(-Math.PI / 2);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.9,
    metalness: 0.0,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.set(pos.x, -cupDepth, pos.z);
  base.castShadow = false;
  base.receiveShadow = true;
  group.add(base);

  const rimInner = radius * 1.02;
  const rimOuter = radius * 1.18;
  const rimGeo = new THREE.RingGeometry(rimInner, rimOuter, 64);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.6,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = -Math.PI / 2;
  rim.position.set(pos.x, 0.003, pos.z);
  rim.castShadow = false;
  rim.receiveShadow = true;
  group.add(rim);

  scene.add(group);
  levelMeshes.push(group);
  return group;
}

// sound
let sinkSound;
try {
  sinkSound = new Audio('/sounds/plop.wav');
} catch (e) {
  console.warn('Sound file not found');
  sinkSound = {
    play: () => Promise.resolve(),
    currentTime: 0
  };
}

// physics with enhanced integration
const ballPhysics = new BallPhysics(ball, {
  radius: BALL_RADIUS,
  groundY: 0,
  friction: 1.5,
  restitution: 0.55,
  colliders: [],
  hole: { position: new THREE.Vector3(5, 0, 0), radius: 0.25 },
  onHole: ({ strokes }) => handleHoleComplete(strokes),
  onStroke: (s) => {
    updateStrokesBridge(s); // Use bridge function

    // Show contextual tutorial hints
    if (tutorialSystem) {
      if (s === 1) {
        tutorialSystem.showContextualHint('first-shot');
      }
    }
  },
  onSinkSound: () => {
    sinkSound.currentTime = 0;
    sinkSound.play().catch(() => { });
  },
});

window.ballPhysics = ballPhysics;

// game state
let totalStrokes = 0;
let followBall = false;
let currentLevelInfo = null;

window.followBall = followBall;

// Enhanced storage with cloud backup
const STORAGE_KEY = 'minigolf_highscores';

function loadBests() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveBests(b) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
}

// Cloud score management
async function saveScoreToCloud(levelId, strokes) {
  if (isUserAuthenticated()) {
    try {
      await saveBestScore(levelId, strokes, {
        completed_at: new Date().toISOString(),
        par: currentLevelInfo?.par || 3,
        is_new_best: true
      });
      console.log('Score saved to cloud');
    } catch (error) {
      console.error('Failed to save to cloud:', error);
    }
  }
}

async function loadBestFromCloud(levelId) {
  if (isUserAuthenticated()) {
    try {
      const { data } = await getBestScore(levelId);
      return data?.best_score || null;
    } catch (error) {
      console.error('Failed to load from cloud:', error);
      return null;
    }
  }
  return null;
}

// levels
function clearLevelMeshes() {
  for (const m of levelMeshes) scene.remove(m);
  levelMeshes = [];
  holeMesh = null;
}

async function loadLevel(idx) {
  clearLevelMeshes();
  const info = levels[idx];
  if (!info) return;

  const colliders = [];
  for (const w of info.walls) {
    colliders.push(makeWall(w.x, w.z, w.w, w.d, w.h));
  }

  const holePos = new THREE.Vector3(...info.hole.pos);
  holeMesh = makeHoleMesh(holePos, info.hole.radius);

  ballPhysics.setColliders(colliders);
  ballPhysics.setHole({ position: holePos, radius: info.hole.radius });
  ballPhysics.teleport(new THREE.Vector3(...info.start));

  restoreBallVisual();
  
  // Update both UI systems
  updateHUDHole(info.id, info.par);
  updateStrokesBridge(0);

  if (enhancedScoring) {
    enhancedScoring.updateHoleInfo(info.id, info.par);
    enhancedScoring.resetHole();
  }

  // Load best score with better error handling
  let bestScore = null;
  try {
    bestScore = await loadBestFromCloud(info.id);
  } catch (error) {
    console.warn('Failed to load from cloud, trying local:', error);
  }
  
  if (!bestScore) {
    const bests = loadBests();
    const key = `level_${info.id}`;
    bestScore = bests[key];
  }

  // Update UI with best score
  if (bestScore) {
    updateBestText(`Best: ${bestScore} strokes`);
    if (enhancedScoring) {
      enhancedScoring.setPreviousBest(bestScore);
    }
  } else {
    updateBestText('');
    if (enhancedScoring) {
      enhancedScoring.setPreviousBest(null);
    }
  }

  currentLevelInfo = info;

  // Accessibility announcement
  if (accessibilityManager) {
    const announcement = `Level ${info.id} loaded. Par ${info.par}. ${bestScore ? `Your best score is ${bestScore} strokes.` : 'No previous score recorded.'}`;
    accessibilityManager.announceToScreenReader(announcement);
  }
}

// sinking animation
let animatingSink = false;
function animateBallSink(onDone) {
  if (animatingSink) return;
  animatingSink = true;
  const duration = 1000;
  const start = performance.now();
  const startPos = ball.position.clone();
  const holePos = ballPhysics.hole.position.clone();

  function step(ts) {
    const t = Math.min(1, (ts - start) / duration);

    const targetXZ = new THREE.Vector3(holePos.x, startPos.y, holePos.z);
    ball.position.lerpVectors(startPos, targetXZ, t * 0.9);
    ball.position.y = startPos.y - 0.25 * t;

    ball.rotation.y += 0.2;
    const s = 1 - 0.85 * t;
    ball.scale.setScalar(s);
    ball.material.transparent = true;
    ball.material.opacity = 1 - t;

    if (t < 1) requestAnimationFrame(step);
    else {
      animatingSink = false;
      ball.material.opacity = 1;
      ball.material.transparent = false;
      if (onDone) onDone();
    }
  }
  requestAnimationFrame(step);
}

function restoreBallVisual() {
  ball.visible = true;
  ball.scale.set(1, 1, 1);
  ball.material.opacity = 1;
  ball.material.transparent = false;
}

async function handleHoleComplete(strokes) {
  totalStrokes += strokes;

  // Update enhanced scoring first
  if (enhancedScoring) {
    enhancedScoring.onHoleComplete(strokes);
  }

  // Save score to both local and cloud with better error handling
  const bests = loadBests();
  const key = `level_${currentLevelInfo.id}`;
  const prevLocal = bests[key];
  let isNewBest = false;

  // Check if it's a new local best
  if (!prevLocal || strokes < prevLocal) {
    bests[key] = strokes;
    saveBests(bests);
    isNewBest = true;
  }

  // Save to cloud with retry logic
  try {
    await saveScoreToCloud(currentLevelInfo.id, strokes);
  } catch (error) {
    console.warn('Failed to save to cloud, but local save succeeded:', error);
    // Don't break the game flow if cloud save fails
  }

  // Refresh dependent systems
  try {
    if (leaderboardSystem) {
      await leaderboardSystem.refresh();
    }
    if (levelSelector) {
      await levelSelector.refreshLevel(currentLevelInfo.id);
    }
  } catch (error) {
    console.warn('Failed to refresh UI systems:', error);
  }

  // Show tutorial hints
  if (tutorialSystem) {
    tutorialSystem.showContextualHint('hole-complete');
  }

  // Enhanced accessibility announcement
  if (accessibilityManager) {
    const par = currentLevelInfo.par;
    let announcement = `Hole completed in ${strokes} strokes. `;

    if (strokes === 1) {
      announcement += 'Hole in one! Excellent shot!';
    } else if (strokes < par) {
      announcement += `${par - strokes} under par! Great performance!`;
    } else if (strokes === par) {
      announcement += 'Par achieved! Well done!';
    } else {
      announcement += `${strokes - par} over par. Keep practicing!`;
    }

    if (isNewBest) {
      announcement += ' New personal best!';
    }

    accessibilityManager.announceToScreenReader(announcement);
  }

  // Animate ball sink
  animateBallSink(() => {
    ball.visible = false;
    showHoleComplete(strokes);

    if (isNewBest) {
      updateBestText(`New best: ${strokes} strokes`);
    } else {
      updateBestText(`Best: ${prevLocal || strokes} strokes`);
    }
  });
}

function nextLevel() {
  levelIndex = (levelIndex + 1) % levels.length;
  loadLevel(levelIndex);
  totalStrokes = 0;
}

window.nextLevel = nextLevel;
window.loadLevel = loadLevel;

// Initialize level selector after we have the getBestScore function
async function getBestScoreForLevel(levelId) {
  let bestScore = await loadBestFromCloud(levelId);
  if (!bestScore) {
    const bests = loadBests();
    const key = `level_${levelId}`;
    bestScore = bests[key];
  }
  return bestScore;
}

// Initialize level selector and leaderboard after dependencies are ready
setTimeout(() => {
  try {
    levelSelector = new LevelSelector(
      levels,
      (levelIndex) => loadLevel(levelIndex),
      (levelId) => getBestScoreForLevel(levelId)
    );

    leaderboardSystem = new LeaderboardSystem();
    
    window.levelSelector = levelSelector;
    window.leaderboardSystem = leaderboardSystem;

    console.log('Level selector and leaderboard initialized');
  } catch (err) {
    console.error('Failed to initialize level selector/leaderboard:', err);
  }
}, 100);

// Setup button integration after UI systems are loaded
setTimeout(() => {
  setupButtonIntegration();
  console.log('Button integration initialized');
}, 200);

// aim controls with enhanced integration
setTimeout(() => {
  attachAimControls(renderer, camera, ball, ballPhysics, scene, {
    groundY: 0,
    powerScale: 4,
    maxPower: 30,
    updatePowerUI: updatePowerUIBridge, // Use the bridge function
    onAimStart: () => {
      controls.enabled = false;
      if (tutorialSystem) {
        const shotCount = ballPhysics.strokes || 0;
        if (shotCount === 0) {
          tutorialSystem.showContextualHint('first-shot');
        }
      }
      if (accessibilityManager) {
        accessibilityManager.announceToScreenReader('Aiming mode activated. Adjust your shot direction and power.');
      }
    },
    onAimEnd: () => {
      controls.enabled = true;
      if (accessibilityManager) {
        accessibilityManager.announceToScreenReader('Shot taken.');
      }
    },
    onAimMove: (ballPos, direction, power) => {
      // This can be used for trajectory visualization if you add that system
      if (window.trajectoryVisualizer) {
        window.trajectoryVisualizer.updateTrajectoryPreview(ballPos, direction, power);
      }
    }
  });
}, 300);

// UI buttons with enhanced accessibility
const resetBtn = document.getElementById('resetBtn');
const nextBtn = document.getElementById('nextBtn');
const followBtn = document.getElementById('followBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const replayBtn = document.getElementById('replayBtn');

// Add ARIA labels for better accessibility
if (resetBtn) resetBtn.setAttribute('aria-label', 'Reset ball to starting position');
if (nextBtn) nextBtn.setAttribute('aria-label', 'Go to next hole');
if (followBtn) followBtn.setAttribute('aria-label', 'Toggle camera following ball');
if (nextLevelBtn) nextLevelBtn.setAttribute('aria-label', 'Continue to next level');
if (replayBtn) replayBtn.setAttribute('aria-label', 'Replay current level');

nextLevelBtn?.addEventListener('click', () => {
  hideHoleComplete();
  nextLevel();
});

replayBtn?.addEventListener('click', () => {
  hideHoleComplete();
  loadLevel(levelIndex);
});

// Initialize first level
loadLevel(levelIndex);

// animate
let lastTime = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  ballPhysics.update(delta);

  if (followBall) {
    const targetPos = new THREE.Vector3(
      ball.position.x,
      camera.position.y,
      ball.position.z + 8
    );
    camera.position.lerp(targetPos, 0.06);
    controls.target.lerp(ball.position.clone(), 0.08);
    controls.update();
  } else {
    controls.update();
  }

  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Enhanced keyboard controls for accessibility and tutorial
document.addEventListener('keydown', (e) => {
  // Don't interfere if user is in an input field
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
    return;
  }

  switch (e.key.toLowerCase()) {
    case 'r':
      handleResetClick();
      break;
    case 'n':
      handleNextClick();
      break;
    case 'f':
      const followButton = document.getElementById('followBtn');
      if (followButton) {
        handleFollowClick(followButton);
      }
      break;
    case 'a':
      // Toggle accessibility panel
      if (accessibilityManager) {
        accessibilityManager.toggleAccessibilityPanel();
      }
      break;
    case 'h':
    case 'f1':
      // Show tutorial/help
      if (tutorialSystem) {
        tutorialSystem.show();
      }
      e.preventDefault();
      break;
    case 's':
      // Show settings
      if (settingsPanel) {
        settingsPanel.show();
      }
      break;
    case 'l':
      // Show level selector
      if (levelSelector) {
        levelSelector.show();
      }
      break;
    case 'b':
      // Show leaderboard
      if (leaderboardSystem) {
        leaderboardSystem.show();
      }
      break;
    case 'g':
      // Announce current game state
      if (accessibilityManager) {
        accessibilityManager.announceCurrentGameState();
      }
      break;
    case 'escape':
      // Close any open modals
      hideHoleComplete();
      if (accessibilityManager) {
        accessibilityManager.hideAccessibilityPanel();
      }
      if (tutorialSystem) {
        tutorialSystem.hide();
      }
      if (settingsPanel && settingsPanel.hide) {
        settingsPanel.hide();
      }
      break;
  }
});

// Save accessibility preferences on page unload
window.addEventListener('beforeunload', () => {
  if (accessibilityManager) {
    accessibilityManager.savePreferences();
  }
});

// Auto-enable accessibility features based on system preferences
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('reduce-motion');

  setTimeout(() => {
    const reduceMotionCheckbox = document.getElementById('reduceMotion');
    if (reduceMotionCheckbox && accessibilityManager) {
      reduceMotionCheckbox.checked = true;
      accessibilityManager.toggleReducedMotion(true);
    }
  }, 100);
}

if (window.matchMedia('(prefers-contrast: high)').matches) {
  setTimeout(() => {
    const highContrastCheckbox = document.getElementById('highContrastMode');
    if (highContrastCheckbox && accessibilityManager) {
      highContrastCheckbox.checked = true;
      accessibilityManager.toggleHighContrast(true);
    }
  }, 100);
}

requestAnimationFrame(animate);

// start
showStartScreen();