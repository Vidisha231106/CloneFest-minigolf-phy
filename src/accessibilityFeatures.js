// src/accessibilityFeatures.js
export class AccessibilityManager {
  constructor() {
    this.isHighContrast = false;
    this.isColorblindMode = false;
    this.screenReaderEnabled = this.detectScreenReader();
    this.keyboardNavigation = true;
    this.keyboardHandlerAttached = false;
    this.lastAnnouncement = 0;
    this.lastMessage = '';
    this.lastMessageTime = 0;

    this.createAccessibilityPanel();
    this.setupKeyboardNavigation();
    this.setupFocusIndicators();
    this.injectAccessibilityCSS();
  }

  detectScreenReader() {
    return window.navigator.userAgent.includes('NVDA') ||
      window.navigator.userAgent.includes('JAWS') ||
      window.speechSynthesis !== undefined;
  }

  createAccessibilityPanel() {
    const accessibilityHTML = `
      <div id="accessibilityPanel" style="
        position: fixed;
        top: 50%;
        left: -300px;
        width: 280px;
        height: auto;
        background: linear-gradient(135deg, #2c3e50, #34495e);
        border-radius: 0 15px 15px 0;
        padding: 20px;
        color: white;
        z-index: 1000;
        transition: left 0.3s ease;
        box-shadow: 2px 0 15px rgba(0, 0, 0, 0.3);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; font-size: 16px;">Accessibility</h3>
          <button id="closeAccessibility" style="
            background: #e74c3c;
            border: none;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            color: white;
            cursor: pointer;
            font-size: 14px;
          ">×</button>
        </div>

        <div class="accessibility-options" style="display: flex; flex-direction: column; gap: 15px;">
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" id="highContrastMode" style="margin-right: 10px;">
            <span>High Contrast Mode</span>
          </label>

          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" id="colorblindMode" style="margin-right: 10px;">
            <span>Colorblind Friendly</span>
          </label>

          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" id="keyboardNavMode" checked style="margin-right: 10px;">
            <span>Keyboard Navigation</span>
          </label>

          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" id="reduceMotion" style="margin-right: 10px;">
            <span>Reduce Motion</span>
          </label>

          <div style="border-top: 1px solid rgba(255, 255, 255, 0.2); padding-top: 15px;">
            <label style="display: block; margin-bottom: 8px;">Text Size</label>
            <select id="textSizeSelect" style="
              width: 100%;
              padding: 5px;
              border: none;
              border-radius: 5px;
              background: #34495e;
              color: white;
            ">
              <option value="small">Small</option>
              <option value="normal" selected>Normal</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>

          <button id="announceGameState" style="
            width: 100%;
            padding: 10px;
            background: #3498db;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-size: 12px;
          ">Announce Game State</button>
        </div>
      </div>

      <!-- Accessibility Toggle Button -->
      <button id="accessibilityToggle" style="
        position: fixed;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        background: linear-gradient(45deg, #9b59b6, #8e44ad);
        border: none;
        border-radius: 0 20px 20px 0;
        color: white;
        cursor: pointer;
        z-index: 999;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
      " title="Accessibility Options" aria-label="Open accessibility options">♿</button>
    `;

    document.body.insertAdjacentHTML('beforeend', accessibilityHTML);
    this.bindAccessibilityEvents();
  }

  bindAccessibilityEvents() {
    document.getElementById('accessibilityToggle').addEventListener('click', () => {
      this.toggleAccessibilityPanel();
    });

    document.getElementById('closeAccessibility').addEventListener('click', () => {
      this.hideAccessibilityPanel();
    });

    document.getElementById('highContrastMode').addEventListener('change', (e) => {
      this.toggleHighContrast(e.target.checked);
    });

    document.getElementById('colorblindMode').addEventListener('change', (e) => {
      this.toggleColorblindMode(e.target.checked);
    });

    document.getElementById('keyboardNavMode').addEventListener('change', (e) => {
      this.toggleKeyboardNavigation(e.target.checked);
    });

    document.getElementById('reduceMotion').addEventListener('change', (e) => {
      this.toggleReducedMotion(e.target.checked);
    });

    document.getElementById('textSizeSelect').addEventListener('change', (e) => {
      this.changeTextSize(e.target.value);
    });

    document.getElementById('announceGameState').addEventListener('click', () => {
      this.announceCurrentGameState();
    });
  }

  toggleAccessibilityPanel() {
    const panel = document.getElementById('accessibilityPanel');
    const isVisible = panel.style.left === '0px';
    panel.style.left = isVisible ? '-300px' : '0px';
  }

  hideAccessibilityPanel() {
    document.getElementById('accessibilityPanel').style.left = '-300px';
  }

  toggleHighContrast(enabled) {
    this.isHighContrast = enabled;
    document.body.classList.toggle('high-contrast', enabled);

    if (enabled) {
      this.injectHighContrastCSS();
    } else {
      this.removeHighContrastCSS();
    }

    this.announceToScreenReader(enabled ? 'High contrast mode enabled' : 'High contrast mode disabled');
  }

  toggleColorblindMode(enabled) {
    this.isColorblindMode = enabled;
    document.body.classList.toggle('colorblind-friendly', enabled);

    if (enabled) {
      this.injectColorblindCSS();
    } else {
      this.removeColorblindCSS();
    }

    this.announceToScreenReader(enabled ? 'Colorblind friendly mode enabled' : 'Colorblind friendly mode disabled');
  }

  toggleKeyboardNavigation(enabled) {
    this.keyboardNavigation = enabled;
    document.body.classList.toggle('keyboard-nav', enabled);

    if (enabled) {
      this.setupKeyboardNavigation();
    } else {
      this.removeKeyboardNavigation();
    }
  }

  toggleReducedMotion(enabled) {
    document.body.classList.toggle('reduce-motion', enabled);

    if (enabled) {
      this.injectReducedMotionCSS();
    } else {
      this.removeReducedMotionCSS();
    }
  }

  changeTextSize(size) {
    document.body.classList.remove('text-small', 'text-normal', 'text-large', 'text-extra-large');
    document.body.classList.add(`text-${size}`);
    this.announceToScreenReader(`Text size changed to ${size}`);
  }

  setupKeyboardNavigation() {
    if (!this.keyboardNavigation || this.keyboardHandlerAttached) return;

    const gameElements = document.querySelectorAll('button, canvas, [data-interactive]');
    gameElements.forEach(el => {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
    });

    this.keyboardHandler = (e) => this.handleKeyboardInput(e);
    document.addEventListener('keydown', this.keyboardHandler);
    this.keyboardHandlerAttached = true;
  }

  removeKeyboardNavigation() {
    if (this.keyboardHandler && this.keyboardHandlerAttached) {
      document.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandlerAttached = false;
    }
  }

  handleKeyboardInput(e) {
    if (!this.keyboardNavigation) return;

    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (document.activeElement && document.activeElement.click) {
          document.activeElement.click();
          e.preventDefault();
        }
        break;
      case 'Tab':
        this.handleTabNavigation(e);
        break;
      case 'Escape':
        this.closeOpenModals();
        break;
      case 'F1':
        if (window.tutorialSystem) {
          window.tutorialSystem.show();
          e.preventDefault();
        }
        break;
    }
  }

  handleTabNavigation(e) {
    const focusableElements = Array.from(document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));

    const currentIndex = focusableElements.indexOf(document.activeElement);
    let nextIndex;

    if (e.shiftKey) {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
    } else {
      nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
    }

    focusableElements[nextIndex].focus();
    e.preventDefault();
  }

  closeOpenModals() {
    const modals = document.querySelectorAll('[id$="Overlay"]');
    modals.forEach(modal => {
      if (modal.style.display !== 'none') {
        modal.style.display = 'none';
      }
    });
    this.hideAccessibilityPanel();
  }

  setupFocusIndicators() {
    const focusCSS = `
      <style id="focusIndicators">
        *:focus {
          outline: 3px solid #3498db !important;
          outline-offset: 2px !important;
        }
        
        .keyboard-nav *:focus {
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5) !important;
        }
        
        button:focus, [role="button"]:focus {
          background-color: rgba(52, 152, 219, 0.1) !important;
        }
      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', focusCSS);
  }

  // FIXED: Better game state announcement that works with both UI systems
  announceCurrentGameState() {
    // Throttle announcements
    if (this.lastAnnouncement && Date.now() - this.lastAnnouncement < 1000) {
      return;
    }
    this.lastAnnouncement = Date.now();

    // Try enhanced scoring elements first, fallback to basic UI
    const holeElement = document.getElementById('holeDisplay') || document.getElementById('hole');
    const strokesElement = document.getElementById('strokesDisplay') || document.getElementById('strokes');
    const parElement = document.getElementById('parDisplay') || document.getElementById('par');
    const statusElement = document.getElementById('scoreStatus');
    const powerElement = document.getElementById('powerPercentage');

    if (!holeElement || !strokesElement || !parElement) {
      this.announceToScreenReader('Game information not available');
      return;
    }

    // Extract game state information
    let holeNum = 'Unknown';
    let currentStrokes = '0';
    let par = 'Unknown';
    let status = '';
    let power = '0%';

    // Parse hole number
    const holeMatch = holeElement.textContent.match(/\d+/);
    if (holeMatch) holeNum = holeMatch[0];

    // Parse strokes - handle both formats
    if (strokesElement.textContent.includes('Strokes:')) {
      const strokeMatch = strokesElement.textContent.match(/\d+/);
      if (strokeMatch) currentStrokes = strokeMatch[0];
    } else {
      currentStrokes = strokesElement.textContent || '0';
    }

    // Parse par
    const parMatch = parElement.textContent.match(/\d+/);
    if (parMatch) par = parMatch[0];

    // Get status and power if available
    if (statusElement) status = statusElement.textContent || '';
    if (powerElement) power = powerElement.textContent || '0%';

    // Build comprehensive announcement
    let announcement = `Playing hole ${holeNum}, par ${par}. Current strokes: ${currentStrokes}. `;

    if (status && status !== 'Ready to play') {
      announcement += `Status: ${status}. `;
    }

    if (power !== '0%') {
      announcement += `Current power: ${power}. `;
    }

    // Add contextual hints
    const strokesNum = parseInt(currentStrokes);
    const parNum = parseInt(par);

    if (strokesNum === 0) {
      announcement += 'Ready to take your first shot.';
    } else if (strokesNum > parNum) {
      announcement += 'You are over par.';
    } else if (strokesNum < parNum) {
      announcement += 'You are under par!';
    } else if (strokesNum === parNum) {
      announcement += 'You are at par.';
    }

    this.announceToScreenReader(announcement);
  }

  announceToScreenReader(message) {
    // Throttle announcements to prevent multiple rapid announcements
    if (this.lastMessage === message && Date.now() - (this.lastMessageTime || 0) < 2000) {
      return;
    }
    this.lastMessage = message;
    this.lastMessageTime = Date.now();

    // Clear any existing speech
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    // Create or get announcer element
    let announcer = document.getElementById('sr-announcements');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcements';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(announcer);
    }

    // Clear and set new content
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 50);

    // Fallback to speech synthesis
    if ('speechSynthesis' in window) {
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.8;
        utterance.volume = 0.3;
        speechSynthesis.speak(utterance);
      }, 100);
    }
  }

  injectAccessibilityCSS() {
    const accessibilityCSS = `
      <style id="accessibilityStyles">
        /* High Contrast Mode */
        .high-contrast {
          filter: contrast(150%) brightness(120%);
        }
        
        .high-contrast button {
          border: 2px solid white !important;
          font-weight: bold !important;
        }
        
        .high-contrast #enhancedHUD {
          background: rgba(0, 0, 0, 0.9) !important;
          border: 2px solid white !important;
        }

        /* Colorblind Friendly Mode */
        .colorblind-friendly {
          --success-color: #0066cc;
          --warning-color: #ff9900;
          --error-color: #cc0000;
        }
        
        .colorblind-friendly #powerfill {
          background: linear-gradient(90deg, #0066cc, #ff9900, #cc0000) !important;
        }

        /* Text Size Options */
        .text-small { font-size: 12px; }
        .text-normal { font-size: 14px; }
        .text-large { font-size: 18px; }
        .text-extra-large { font-size: 24px; }
        
        .text-large #enhancedHUD, .text-extra-large #enhancedHUD {
          padding: 20px !important;
          font-size: inherit !important;
        }

        /* Reduced Motion */
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .reduce-motion [id*="powerfill"] {
          transition: none !important;
        }

        /* Keyboard Navigation Enhancements */
        .keyboard-nav canvas {
          border: 2px solid transparent;
        }
        
        .keyboard-nav canvas:focus {
          border-color: #3498db;
        }

        /* Screen Reader Only Content */
        .sr-only {
          position: absolute;
          left: -10000px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', accessibilityCSS);
  }

  injectHighContrastCSS() {
    const highContrastCSS = `
      <style id="highContrastCSS">
        .high-contrast * {
          background-color: black !important;
          color: white !important;
          border-color: white !important;
        }
        
        .high-contrast button {
          background-color: #333 !important;
          border: 2px solid white !important;
        }
        
        .high-contrast button:hover {
          background-color: white !important;
          color: black !important;
        }
      </style>
    `;

    if (!document.getElementById('highContrastCSS')) {
      document.head.insertAdjacentHTML('beforeend', highContrastCSS);
    }
  }

  removeHighContrastCSS() {
    const style = document.getElementById('highContrastCSS');
    if (style) style.remove();
  }

  injectColorblindCSS() {
    const colorblindCSS = `
      <style id="colorblindCSS">
        .colorblind-friendly #powerfill {
          background: repeating-linear-gradient(
            45deg,
            #0066cc,
            #0066cc 10px,
            #ff9900 10px,
            #ff9900 20px,
            #cc0000 20px,
            #cc0000 30px
          ) !important;
        }
      </style>
    `;

    if (!document.getElementById('colorblindCSS')) {
      document.head.insertAdjacentHTML('beforeend', colorblindCSS);
    }
  }

  removeColorblindCSS() {
    const style = document.getElementById('colorblindCSS');
    if (style) style.remove();
  }

  injectReducedMotionCSS() {
    const reducedMotionCSS = `
      <style id="reducedMotionCSS">
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
        
        .reduce-motion [id*="achievement"] {
          animation: none !important;
        }
        
        .reduce-motion .trajectory-line {
          animation: none !important;
        }
      </style>
    `;

    if (!document.getElementById('reducedMotionCSS') && document.body.classList.contains('reduce-motion')) {
      document.head.insertAdjacentHTML('beforeend', reducedMotionCSS);
    }
  }

  removeReducedMotionCSS() {
    const style = document.getElementById('reducedMotionCSS');
    if (style) style.remove();
  }

  dispose() {
    this.removeKeyboardNavigation();

    const elementsToRemove = [
      'accessibilityPanel',
      'accessibilityToggle',
      'sr-announcements',
      'accessibilityStyles',
      'focusIndicators',
      'highContrastCSS',
      'colorblindCSS',
      'reducedMotionCSS'
    ];

    elementsToRemove.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.remove();
    });
  }

  savePreferences() {
    const preferences = {
      highContrast: this.isHighContrast,
      colorblindMode: this.isColorblindMode,
      keyboardNavigation: this.keyboardNavigation,
      textSize: document.body.className.match(/text-(\w+)/)?.[1] || 'normal',
      reduceMotion: document.body.classList.contains('reduce-motion')
    };

    try {
      localStorage.setItem('accessibility_preferences', JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save accessibility preferences:', e);
    }
  }

  loadPreferences() {
    try {
      const saved = localStorage.getItem('accessibility_preferences');
      if (saved) {
        const preferences = JSON.parse(saved);

        if (preferences.highContrast) {
          document.getElementById('highContrastMode').checked = true;
          this.toggleHighContrast(true);
        }

        if (preferences.colorblindMode) {
          document.getElementById('colorblindMode').checked = true;
          this.toggleColorblindMode(true);
        }

        if (preferences.keyboardNavigation !== undefined) {
          document.getElementById('keyboardNavMode').checked = preferences.keyboardNavigation;
          this.toggleKeyboardNavigation(preferences.keyboardNavigation);
        }

        if (preferences.reduceMotion) {
          document.getElementById('reduceMotion').checked = true;
          this.toggleReducedMotion(true);
        }

        if (preferences.textSize) {
          document.getElementById('textSizeSelect').value = preferences.textSize;
          this.changeTextSize(preferences.textSize);
        }
      }
    } catch (e) {
      console.warn('Failed to load accessibility preferences:', e);
    }
  }
}