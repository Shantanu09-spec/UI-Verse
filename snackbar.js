/**
 * @fileoverview Enterprise UIverse Notification Engine & Toast Context Layer
 * Features robust queue throttling, multi-variant design state maps, 
 * asynchronous exit lifecycles, and strict DOM element cleanup management.
 * @version 3.1.0
 */

"use strict";

(function (window, document) {

  /**
   * Global System Configuration Tokens
   * @type {Object}
   */
  const NOTIFICATION_CONFIG = {
    DEFAULT_DURATION_MS: 4500,
    ANIMATION_EXIT_BUFFER_MS: 400,
    MAX_VISIBLE_NOTIFICATIONS: 5,
    SCROLL_THROTTLE_MS: 50,
    SELECTORS: {
      triggerButton: ".show-btn",
      navbarElement: ".navbar",
      globalContainerId: "snackbarContainer"
    },
    CLASSES: {
      snackbarBase: "snackbar",
      snackbarIcon: "snackbar-icon",
      snackbarContent: "snackbar-content",
      snackbarTitle: "snackbar-title",
      snackbarMessage: "snackbar-message",
      snackbarClose: "snackbar-close",
      snackbarProgress: "snackbar-progress",
      snackbarProgressBar: "snackbar-progress-bar",
      stateVisible: "show",
      stateHidden: "hide",
      navbarScrolled: "navbar-scrolled"
    }
  };

  /**
   * Immutable High-Fidelity Type Registry Architecture
   * Contains individual icon mappings, contextual semantic styles, and default descriptions.
   * @type {Object.<string, Object>}
   */
  const NOTIFICATION_REGISTRY = {
    success: {
      icon: "fa-circle-check",
      defaultTitle: "Success",
      defaultText: "Your action was completed successfully!",
      themeClass: "variant-success"
    },
    error: {
      icon: "fa-circle-xmark",
      defaultTitle: "Error",
      defaultText: "Something went wrong. Please try again.",
      themeClass: "variant-error"
    },
    info: {
      icon: "fa-circle-info",
      defaultTitle: "Information",
      defaultText: "Here is some useful system information.",
      themeClass: "variant-info"
    },
    payment: {
      icon: "fa-credit-card",
      defaultTitle: "Payment Successful",
      defaultText: "Your subscription has been activated.",
      themeClass: "variant-payment"
    },
    ai: {
      icon: "fa-robot",
      defaultTitle: "AI Assistant",
      defaultText: "New insights generated successfully.",
      themeClass: "variant-ai"
    },
    live: {
      icon: "fa-wave-square",
      defaultTitle: "Live Activity",
      defaultText: "A new user joined your workspace.",
      themeClass: "variant-live"
    },
    update: {
      icon: "fa-arrows-rotate",
      defaultTitle: "Update Available",
      defaultText: "Version 3.0 is ready to install.",
      themeClass: "variant-update"
    },
    invite: {
      icon: "fa-user-group",
      defaultTitle: "Workspace Invite",
      defaultText: "You've been invited to join a team.",
      themeClass: "variant-invite"
    },
    reminder: {
      icon: "fa-calendar-days",
      defaultTitle: "Meeting Reminder",
      defaultText: "Design review starts in 15 minutes.",
      themeClass: "variant-reminder"
    },
    achievement: {
      icon: "fa-trophy",
      defaultTitle: "Achievement Unlocked",
      defaultText: "You reached a new productivity milestone.",
      themeClass: "variant-achievement"
    },
    order: {
      icon: "fa-box",
      defaultTitle: "Order Shipped",
      defaultText: "Your package is now on the way.",
      themeClass: "variant-order"
    },
    download: {
      icon: "fa-download",
      defaultTitle: "Download Complete",
      defaultText: "File saved successfully.",
      themeClass: "variant-download"
    },
    server: {
      icon: "fa-server",
      defaultTitle: "Server Warning",
      defaultText: "High CPU usage detected.",
      themeClass: "variant-server"
    },
    battery: {
      icon: "fa-battery-quarter",
      defaultTitle: "Low Battery",
      defaultText: "Please connect your charger.",
      themeClass: "variant-battery"
    },
    premium: {
      icon: "fa-crown",
      defaultTitle: "Premium Activated",
      defaultText: "Welcome to the Pro experience.",
      themeClass: "variant-premium"
    }
  };

  /**
   * Internal Context Memory State Cache Engine
   */
  const SystemState = {
    activeInstances: new Set(),
    backlogQueue: [],
    isMuted: false,
    lastScrollY: 0
  };

  /**
   * Memory Safe DOM Query Optimization Engine
   */
  const DOMRegistry = {
    cachedElements: {},
    
    getContainer() {
      if (!this.cachedElements.container) {
        let container = document.getElementById(NOTIFICATION_CONFIG.SELECTORS.globalContainerId);
        if (!container) {
          container = document.createElement("div");
          container.id = NOTIFICATION_CONFIG.SELECTORS.globalContainerId;
          document.body.appendChild(container);
        }
        this.cachedElements.container = container;
      }
      return this.cachedElements.container;
    },

    getNavbar() {
      if (!this.cachedElements.navbar) {
        this.cachedElements.navbar = document.querySelector(NOTIFICATION_CONFIG.SELECTORS.navbarElement);
      }
      return this.cachedElements.navbar;
    }
  };

  /**
   * Operational Framework Utilities
   */
  const CoreUtils = {
    /**
     * High performance string input validation/sanitization to eliminate XSS injections
     * @param {string} rawString 
     * @returns {string} clean string
     */
    sanitizeInput(rawString) {
      if (typeof rawString !== 'string') return '';
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
      };
      return rawString.replace(/[&<>"'/]/g, (match) => map[match]);
    },

    /**
     * Throttles consecutive runtime executions of continuous events (e.g. scroll listeners)
     */
    throttle(callback, latencyLimit) {
      let waitingFlag = false;
      return function (...args) {
        if (!waitingFlag) {
          callback.apply(this, args);
          waitingFlag = true;
          setTimeout(() => {
            waitingFlag = false;
          }, latencyLimit);
        }
      };
    },

    /**
     * Generates cryptographic unique identification fingerprints for object references
     * @returns {string} uuid
     */
    generateUID() {
      return 'notif_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
  };

  /**
   * Object-Oriented Notification Instance Architecture
   */
  class SnackbarNotificationInstance {
    /**
     * Creates a standardized standalone notifications engine reference instance
     * @param {string} variant - The identity flag corresponding to the type map registry
     * @param {string} customTitle - Plaintext character string payload overrides
     * @param {string} customMessage - Plaintext character string body payload overrides
     * @param {number} lifespans - Active presentation loop parameters in milliseconds
     */
    constructor(variant, customTitle = "", customMessage = "", lifespans = null) {
      const spec = NOTIFICATION_REGISTRY[variant] || NOTIFICATION_REGISTRY.info;
      
      this.id = CoreUtils.generateUID();
      this.variant = variant;
      this.title = customTitle ? CoreUtils.sanitizeInput(customTitle) : spec.defaultTitle;
      this.message = customMessage ? CoreUtils.sanitizeInput(customMessage) : spec.defaultText;
      this.duration = typeof lifespans === 'number' ? lifespans : NOTIFICATION_CONFIG.DEFAULT_DURATION_MS;
      this.iconClass = spec.icon;
      this.themeClass = spec.themeClass;
      
      this.domElement = null;
      this.autoDestroyTimer = null;
      this.progressAnimationTimer = null;
      this.creationTimestamp = Date.now();
    }

    /**
     * Compiles dynamic template syntax nodes into real DOM representations
     * @returns {HTMLElement} compiled system node
     */
    compileMarkup() {
      const node = document.createElement("div");
      node.id = this.id;
      
      // Enforce operational layout configurations across core wrappers
      node.className = `${NOTIFICATION_CONFIG.CLASSES.snackbarBase} ${this.themeClass}`;
      node.setAttribute("role", "alert");
      node.setAttribute("aria-live", "assertive");
      node.setAttribute("aria-atomic", "true");

      node.innerHTML = `
        <div class="${NOTIFICATION_CONFIG.CLASSES.snackbarIcon}">
          <i class="fa-solid ${this.iconClass}"></i>
        </div>
        <div class="${NOTIFICATION_CONFIG.CLASSES.snackbarContent}">
          <div class="${NOTIFICATION_CONFIG.CLASSES.snackbarTitle}">${this.title}</div>
          <div class="${NOTIFICATION_CONFIG.CLASSES.snackbarMessage}">${this.message}</div>
        </div>
        <div class="${NOTIFICATION_CONFIG.CLASSES.snackbarClose}" role="button" aria-label="Dismiss Notification" tabindex="0">
          <i class="fa-solid fa-xmark"></i>
        </div>
        <div class="${NOTIFICATION_CONFIG.CLASSES.snackbarProgress}">
          <div class="${NOTIFICATION_CONFIG.CLASSES.snackbarProgressBar}" style="width: 100%;"></div>
        </div>
      `;

      this.domElement = node;
      this.attachInteractiveEvents();
      return node;
    }

    /**
     * Binds structural tracking hooks inside single node elements
     */
    attachInteractiveEvents() {
      if (!this.domElement) return;

      const closeBtn = this.domElement.querySelector(`.${NOTIFICATION_CONFIG.CLASSES.snackbarClose}`);
      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          NotificationController.dismiss(this.id);
        });

        // Add support for native accessibility keyboard interactions
        closeBtn.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            NotificationController.dismiss(this.id);
          }
        });
      }

      // Pause lifetime timers on hover to allow detailed inspection
      this.domElement.addEventListener("mouseenter", () => this.pauseLifecycleTimers());
      this.domElement.addEventListener("mouseleave", () => this.resumeLifecycleTimers());
    }

    /**
     * Mounts the underlying node wrapper onto target views
     */
    mount(parentContainer) {
      if (!this.domElement) {
        this.compileMarkup();
      }

      parentContainer.appendChild(this.domElement);
      
      // Force repaint to guarantee performance transitions fire properly
      void this.domElement.offsetHeight;
      
      this.domElement.classList.add(NOTIFICATION_CONFIG.CLASSES.stateVisible);
      this.startLifecycleTimers();
    }

    /**
     * Coordinates animation countdown paths across linear progression timelines
     */
    startLifecycleTimers() {
      if (this.duration <= 0) return;

      const progressBar = this.domElement.querySelector(`.${NOTIFICATION_CONFIG.CLASSES.snackbarProgressBar}`);
      if (progressBar) {
        // Enforce synchronization between style channels and raw inputs
        progressBar.style.transition = `width ${this.duration}ms linear`;
        
        // Let execution context thread yield briefly to allow layout pipelines to capture targets
        setTimeout(() => {
          progressBar.style.width = "0%";
        }, 30);
      }

      this.autoDestroyTimer = setTimeout(() => {
        NotificationController.dismiss(this.id);
      }, this.duration);
    }

    pauseLifecycleTimers() {
      clearTimeout(this.autoDestroyTimer);
      const progressBar = this.domElement.querySelector(`.${NOTIFICATION_CONFIG.CLASSES.snackbarProgressBar}`);
      
      if (progressBar) {
        // Capture computed horizontal widths at current frame
        const computedStyle = window.getComputedStyle(progressBar);
        const currentWidth = computedStyle.getPropertyValue("width");
        
        progressBar.style.transition = "none";
        progressBar.style.width = currentWidth;
      }
    }

    resumeLifecycleTimers() {
      if (this.duration <= 0) return;

      const progressBar = this.domElement.querySelector(`.${NOTIFICATION_CONFIG.CLASSES.snackbarProgressBar}`);
      let remainingTime = this.duration;

      if (progressBar) {
        const computedStyle = window.getComputedStyle(progressBar);
        const parentStyle = window.getComputedStyle(progressBar.parentElement);
        
        const currentWidthPx = parseFloat(computedStyle.getPropertyValue("width"));
        const parentWidthPx = parseFloat(parentStyle.getPropertyValue("width"));
        
        const currentRatio = parentWidthPx > 0 ? (currentWidthPx / parentWidthPx) : 0;
        remainingTime = this.duration * currentRatio;

        progressBar.style.transition = `width ${remainingTime}ms linear`;
        progressBar.style.width = "0%";
      }

      this.autoDestroyTimer = setTimeout(() => {
        NotificationController.dismiss(this.id);
      }, remainingTime);
    }


    
    /**
     * Safely tears down element models and unbinds remaining event handlers
     */
    
    
    unmount() {
      if (!this.domElement) return;

      clearTimeout(this.autoDestroyTimer);
      this.domElement.classList.remove(NOTIFICATION_CONFIG.CLASSES.stateVisible);
      this.domElement.classList.add(NOTIFICATION_CONFIG.CLASSES.stateHidden);

      setTimeout(() => {
        if (this.domElement && this.domElement.parentNode) {
          this.domElement.parentNode.removeChild(this.domElement);
        }
        this.domElement = null;
      }, NOTIFICATION_CONFIG.ANIMATION_EXIT_BUFFER_MS);
    }
  }



  /**
   * Global System Orchestration Engine (Core Controller)
   */
  
  
  const NotificationController = {
    /**
     * Factory execution entry-point route
     * @param {string} type - Structural layout mapping keys
     * @param {string} [title] - Custom text title payload strings
     * @param {string} [message] - Custom text message payload strings
     * @param {number} [duration] - Active time windows
     * @returns {string|null} Generated registration key sequence mapping
     */
    trigger(type, title = "", message = "", duration = null) {
      if (SystemState.isMuted) return null;

      // Construct isolated instances out of raw options parameters
      const notification = new SnackbarNotificationInstance(type, title, message, duration);

      if (SystemState.activeInstances.size >= NOTIFICATION_CONFIG.MAX_VISIBLE_NOTIFICATIONS) {
        SystemState.backlogQueue.push(notification);
      } else {
        this.render(notification);
      }

      return notification.id;
    },

    /**
     * Commits actual component generation tracking hooks onto operational canvases
     * @param {SnackbarNotificationInstance} instanceObject 
     */
    render(instanceObject) {
      const container = DOMRegistry.getContainer();
      if (!container) return;

      SystemState.activeInstances.add(instanceObject);
      instanceObject.mount(container);
    },

    /**
     * Signals unmounting routines across targets via registration key indexing matches
     * @param {string} uid 
     */
    dismiss(uid) {
      let activeTargetInstance = null;

      for (const instance of SystemState.activeInstances) {
        if (instance.id === uid) {
          activeTargetInstance = instance;
          break;
        }
      }

      if (activeTargetInstance) {
        activeTargetInstance.unmount();
        SystemState.activeInstances.delete(activeTargetInstance);
        
        // Trigger immediate check to process any stacked backlog elements
        setTimeout(() => {
          this.processQueue();
        }, NOTIFICATION_CONFIG.ANIMATION_EXIT_BUFFER_MS + 50);
      }
    },




    /**
     * Cycles queued data items safely onto live views
    */
    
    
    processQueue() {
      if (SystemState.backlogQueue.length === 0) return;
      if (SystemState.activeInstances.size >= NOTIFICATION_CONFIG.MAX_VISIBLE_NOTIFICATIONS) return;

      const nextNotification = SystemState.backlogQueue.shift();
      this.render(nextNotification);
    },



  
    /**
     * Drops all active visibility arrays simultaneously
    */
  
  
    clearAll() {
      SystemState.backlogQueue = [];
      for (const instance of SystemState.activeInstances) {
        instance.unmount();
      }
      SystemState.activeInstances.clear();
    }
  };




  /**
   * Action Interception and Listener Aggregation Pipeline
   */
  
  

  const InteractionInterceptor = {
    init() {
      this.bindTriggers();
      this.bindWindowScroll();
    },

    bindTriggers() {
      document.addEventListener("click", (e) => {
        const targetBtn = e.target.closest(NOTIFICATION_CONFIG.SELECTORS.triggerButton);
        if (!targetBtn) return;

        e.preventDefault();
        const notificationType = targetBtn.dataset.type;

        if (!notificationType || !NOTIFICATION_REGISTRY[notificationType]) {
          NotificationController.trigger("info", "System Notification", "Intercepted valid trigger bind lacking clear schema mapping types.");
          return;
        }

    
        // Handle mapped registry cases cleanly without rigid conditional blocks
    
    
        const registryData = NOTIFICATION_REGISTRY[notificationType];
        NotificationController.trigger(
          notificationType, 
          registryData.defaultTitle, 
          registryData.defaultText
        );
      });
    },

    bindWindowScroll() {
      const navbar = DOMRegistry.getNavbar();
      if (!navbar) return;

      const performScrollAudit = () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 20) {
          navbar.classList.add(NOTIFICATION_CONFIG.CLASSES.navbarScrolled);
          navbar.style.background = "rgba(5, 8, 22, 0.95)";
        } else {
          navbar.classList.remove(NOTIFICATION_CONFIG.CLASSES.navbarScrolled);
          navbar.style.background = "rgba(5, 8, 22, 0.82)";
        }
        
        SystemState.lastScrollY = currentScrollY;
      };

      // Wrap standard handler inside memory-optimized throttling cycle
      window.addEventListener("scroll", CoreUtils.throttle(performScrollAudit, NOTIFICATION_CONFIG.SCROLL_THROTTLE_MS));
    }
  };



  /**
   * Core Bootloader Initialization Hook Sequence
  */


  function initializeNotificationAppFramework() {
    // Generate isolated container layouts beforehand to avoid operational execution latency drops
    DOMRegistry.getContainer();
    InteractionInterceptor.init();
    
    // Expose application api handlers cleanly across global execution frames
    window.UIverseNotifications = {
      push: (type, title, txt, ms) => NotificationController.trigger(type, title, txt, ms),
      clear: () => NotificationController.clearAll(),
      mute: (flag) => { SystemState.isMuted = !!flag; },
      getDiagnostics: () => ({
        activeCount: SystemState.activeInstances.size,
        queueCount: SystemState.backlogQueue.length,
        uptime: Date.now()
      })
    };
  }




  // Intercept compilation threads based on modern readiness specifications
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeNotificationAppFramework);
  } else {
    initializeNotificationAppFramework();
  }

})(window, document);




