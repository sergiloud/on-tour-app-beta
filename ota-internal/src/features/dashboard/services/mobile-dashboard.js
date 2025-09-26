// Mobile-Optimized PWA Dashboard with Touch Gestures
class MobileDashboardEngine {
  constructor() {
    this.touchState = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      startTime: 0
    };
    
    this.swipeThreshold = 50;
    this.tapThreshold = 200;
    
    this.mobileBreakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    };
    
    this.currentLayout = 'mobile';
    this.isInstalled = false;
    this.serviceWorker = null;
    
    this.init();
  }

  async init() {
    console.log('📱 Initializing Mobile Dashboard Engine...');
    
    try {
      // Detect device and setup responsive layout
      this.detectDevice();
      
      // Setup PWA features
      await this.setupPWA();
      
      // Initialize mobile-optimized UI
      this.initializeMobileUI();
      
      // Setup touch gestures
      this.setupTouchGestures();
      
      // Setup responsive charts
      this.setupResponsiveCharts();
      
      // Setup offline functionality
      this.setupOfflineMode();
      
      // Setup mobile navigation
      this.setupMobileNavigation();
      
      console.log('✅ Mobile Dashboard Engine initialized');
      
    } catch (error) {
      console.error('❌ Mobile Dashboard Engine initialization failed:', error);
    }
  }

  detectDevice() {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent;
    
    this.deviceInfo = {
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      isTablet: /iPad|Android(?=.*Mobile)/i.test(userAgent) && width >= 768,
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      hasTouch: 'ontouchstart' in window,
      width: width,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1
    };
    
    // Determine layout
    if (width < this.mobileBreakpoints.mobile) {
      this.currentLayout = 'mobile';
    } else if (width < this.mobileBreakpoints.tablet) {
      this.currentLayout = 'tablet';
    } else {
      this.currentLayout = 'desktop';
    }
    
    console.log(`📱 Device detected: ${this.currentLayout}`, this.deviceInfo);
    
    // Apply device-specific CSS classes
    document.body.classList.add(`layout-${this.currentLayout}`);
    if (this.deviceInfo.isMobile) document.body.classList.add('is-mobile');
    if (this.deviceInfo.isIOS) document.body.classList.add('is-ios');
    if (this.deviceInfo.isAndroid) document.body.classList.add('is-android');
  }

  async setupPWA() {
    console.log('📲 Setting up PWA features...');
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        // Only attempt on secure contexts or localhost
        const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        if(!isLocalhost && location.protocol !== 'https:'){
          console.warn('🔒 Skipping SW registration (insecure context)');
        } else {
          // Preflight fetch to ensure correct MIME (avoid HTML fallback served as sw.js)
          const swResp = await fetch('/sw.js', { cache: 'no-store' });
          const ctype = swResp.headers.get('content-type') || '';
          const bodySnippet = (await swResp.clone().text()).slice(0,100).trim();
          if(!swResp.ok || !/javascript|text\/(javascript|ecmascript|jscript)/i.test(ctype)){
            console.warn('⚠️ SW preflight failed; content-type:', ctype, 'status:', swResp.status, 'snippet:', bodySnippet);
          } else {
            const registration = await navigator.serviceWorker.register('/sw.js');
            this.serviceWorker = registration;
            console.log('✅ Service Worker registered');
            registration.addEventListener('updatefound', () => this.showUpdateAvailable());
          }
        }
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
    
    // Setup install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.showInstallPrompt();
    });
    
    // Detect if already installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallPrompt();
    });
    
    // Setup manifest and meta tags
    this.setupPWAManifest();
  }

  setupPWAManifest() {
    // Add mobile-specific meta tags if not present
    const metaTags = [
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, user-scalable=no' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'theme-color', content: '#2980b9' },
      { name: 'msapplication-TileColor', content: '#2980b9' }
    ];
    
    metaTags.forEach(tag => {
      let existingTag = document.querySelector(`meta[name="${tag.name}"]`);
      if (!existingTag) {
        const meta = document.createElement('meta');
        meta.name = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
    
    // Add apple touch icons
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.sizes = '180x180';
    appleTouchIcon.href = '/icons/apple-touch-icon.png';
    document.head.appendChild(appleTouchIcon);
  }

  initializeMobileUI() {
    // Create mobile-optimized container
    const mobileContainer = document.createElement('div');
    mobileContainer.id = 'mobile-dashboard-container';
    mobileContainer.className = 'mobile-dashboard-container';
    
    mobileContainer.innerHTML = `
      <!-- Mobile Header -->
      <div class="mobile-header">
        <div class="mobile-header-content">
          <button class="mobile-menu-toggle" id="mobile-menu-toggle">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          
          <div class="mobile-title">
            <h1>On Tour</h1>
            <div class="connection-status" id="connection-status">
              <span class="status-indicator online"></span>
              <span class="status-text">Online</span>
            </div>
          </div>
          
          <div class="mobile-actions">
            <button class="mobile-action-btn" id="mobile-refresh">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>
            
            <button class="mobile-action-btn" id="mobile-notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="m13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span class="notification-badge" id="notification-badge">3</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile Navigation -->
      <nav class="mobile-nav" id="mobile-nav">
        <div class="mobile-nav-content">
          <div class="mobile-nav-header">
            <div class="mobile-user-info">
              <div class="user-avatar">👤</div>
              <div class="user-details">
                <div class="user-name">Artist Name</div>
                <div class="user-role">Music Professional</div>
              </div>
            </div>
          </div>
          
          <div class="mobile-nav-menu">
            <a href="#dashboard" class="mobile-nav-item active" data-section="dashboard">
              <span class="nav-icon">📊</span>
              <span class="nav-label">Dashboard</span>
            </a>
            
            <a href="#finance" class="mobile-nav-item" data-section="finance">
              <span class="nav-icon">💰</span>
              <span class="nav-label">Finance</span>
            </a>
            
            <a href="#shows" class="mobile-nav-item" data-section="shows">
              <span class="nav-icon">🎭</span>
              <span class="nav-label">Shows</span>
            </a>
            
            <a href="#expenses" class="mobile-nav-item" data-section="expenses">
              <span class="nav-icon">🧾</span>
              <span class="nav-label">Expenses</span>
            </a>
            
            <a href="#reports" class="mobile-nav-item" data-section="reports">
              <span class="nav-icon">📄</span>
              <span class="nav-label">Reports</span>
            </a>
            
            <a href="#settings" class="mobile-nav-item" data-section="settings">
              <span class="nav-icon">⚙️</span>
              <span class="nav-label">Settings</span>
            </a>
          </div>
          
          <div class="mobile-nav-footer">
            <button class="mobile-install-btn" id="mobile-install-app" style="display: none;">
              📲 Install App
            </button>
          </div>
        </div>
      </nav>
      
      <!-- Mobile Main Content -->
      <main class="mobile-main" id="mobile-main">
        <!-- Quick Stats Cards -->
        <div class="mobile-stats-container" id="mobile-stats">
          <div class="mobile-stat-card revenue-card">
            <div class="stat-header">
              <span class="stat-icon">💰</span>
              <span class="stat-trend up">+12%</span>
            </div>
            <div class="stat-value" id="mobile-revenue">$125,000</div>
            <div class="stat-label">Monthly Revenue</div>
          </div>
          
          <div class="mobile-stat-card expense-card">
            <div class="stat-header">
              <span class="stat-icon">🧾</span>
              <span class="stat-trend down">-5%</span>
            </div>
            <div class="stat-value" id="mobile-expenses">$87,500</div>
            <div class="stat-label">Monthly Expenses</div>
          </div>
          
          <div class="mobile-stat-card profit-card">
            <div class="stat-header">
              <span class="stat-icon">📈</span>
              <span class="stat-trend up">+18%</span>
            </div>
            <div class="stat-value" id="mobile-profit">$37,500</div>
            <div class="stat-label">Net Profit</div>
          </div>
        </div>
        
        <!-- Mobile Chart Container -->
        <div class="mobile-chart-section">
          <div class="mobile-chart-header">
            <h3>Financial Overview</h3>
            <div class="mobile-chart-controls">
              <button class="chart-period-btn active" data-period="week">Week</button>
              <button class="chart-period-btn" data-period="month">Month</button>
              <button class="chart-period-btn" data-period="year">Year</button>
            </div>
          </div>
          
          <div class="mobile-chart-container">
            <canvas id="mobile-main-chart" class="mobile-chart"></canvas>
          </div>
        </div>
        
        <!-- Mobile Action Cards -->
        <div class="mobile-actions-grid">
          <div class="mobile-action-card" data-action="add-expense">
            <div class="action-icon">➕</div>
            <div class="action-title">Add Expense</div>
            <div class="action-subtitle">Quick entry</div>
          </div>
          
          <div class="mobile-action-card" data-action="add-income">
            <div class="action-icon">💵</div>
            <div class="action-title">Add Income</div>
            <div class="action-subtitle">Log revenue</div>
          </div>
          
          <div class="mobile-action-card" data-action="scan-receipt">
            <div class="action-icon">📷</div>
            <div class="action-title">Scan Receipt</div>
            <div class="action-subtitle">AI extraction</div>
          </div>
          
          <div class="mobile-action-card" data-action="generate-report">
            <div class="action-icon">📊</div>
            <div class="action-title">Generate Report</div>
            <div class="action-subtitle">PDF export</div>
          </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="mobile-activity-section">
          <div class="mobile-section-header">
            <h3>Recent Activity</h3>
            <button class="see-all-btn">See All</button>
          </div>
          
          <div class="mobile-activity-list" id="mobile-activity">
            <!-- Activity items will be populated dynamically -->
          </div>
        </div>
      </main>
      
      <!-- Mobile Bottom Navigation -->
      <nav class="mobile-bottom-nav">
        <button class="bottom-nav-item active" data-section="dashboard">
          <span class="nav-icon">📊</span>
          <span class="nav-label">Home</span>
        </button>
        
        <button class="bottom-nav-item" data-section="finance">
          <span class="nav-icon">💰</span>
          <span class="nav-label">Finance</span>
        </button>
        
        <button class="bottom-nav-item" data-section="add" id="mobile-add-button">
          <span class="nav-icon add-icon">+</span>
        </button>
        
        <button class="bottom-nav-item" data-section="shows">
          <span class="nav-icon">🎭</span>
          <span class="nav-label">Shows</span>
        </button>
        
        <button class="bottom-nav-item" data-section="profile">
          <span class="nav-icon">👤</span>
          <span class="nav-label">Profile</span>
        </button>
      </nav>
      
      <!-- Mobile Modals and Overlays -->
      <div class="mobile-overlay" id="mobile-overlay"></div>
      
      <!-- Quick Add Modal -->
      <div class="mobile-modal" id="quick-add-modal">
        <div class="modal-header">
          <h3>Quick Add</h3>
          <button class="modal-close" data-modal="quick-add-modal">×</button>
        </div>
        
        <div class="modal-content">
          <div class="quick-add-options">
            <button class="quick-add-option" data-type="expense">
              <span class="option-icon">➖</span>
              <span class="option-label">Expense</span>
            </button>
            
            <button class="quick-add-option" data-type="income">
              <span class="option-icon">➕</span>
              <span class="option-label">Income</span>
            </button>
            
            <button class="quick-add-option" data-type="receipt">
              <span class="option-icon">📷</span>
              <span class="option-label">Scan Receipt</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Update Available Notification -->
      <div class="mobile-update-notification" id="update-notification" style="display: none;">
        <div class="update-content">
          <span class="update-icon">🔄</span>
          <span class="update-text">Update available</span>
          <button class="update-btn" id="update-app">Update</button>
          <button class="update-dismiss" id="dismiss-update">×</button>
        </div>
      </div>
    `;
    
    // Insert mobile container
    const existingContainer = document.querySelector('.finance-dashboard');
    if (existingContainer) {
      existingContainer.style.display = this.currentLayout === 'mobile' ? 'none' : 'block';
    }
    
    document.body.appendChild(mobileContainer);
    
    // Apply mobile styles
    this.injectMobileStyles();
  }

  setupTouchGestures() {
    console.log('👆 Setting up touch gestures...');
    
    const mainContainer = document.getElementById('mobile-main');
    if (!mainContainer) return;
    
    // Swipe to refresh
    mainContainer.addEventListener('touchstart', (e) => {
      this.touchState.startX = e.touches[0].clientX;
      this.touchState.startY = e.touches[0].clientY;
      this.touchState.startTime = Date.now();
      this.touchState.isDragging = false;
    }, { passive: true });
    
    mainContainer.addEventListener('touchmove', (e) => {
      if (!this.touchState.startX || !this.touchState.startY) return;
      
      this.touchState.currentX = e.touches[0].clientX;
      this.touchState.currentY = e.touches[0].clientY;
      
      const deltaX = this.touchState.currentX - this.touchState.startX;
      const deltaY = this.touchState.currentY - this.touchState.startY;
      
      // Detect pull to refresh
      if (deltaY > 50 && Math.abs(deltaX) < 50 && mainContainer.scrollTop === 0) {
        this.showPullToRefresh();
      }
      
      // Detect horizontal swipes for navigation
      if (Math.abs(deltaX) > this.swipeThreshold && Math.abs(deltaY) < 50) {
        this.touchState.isDragging = true;
        
        if (deltaX > 0) {
          // Swipe right
          this.handleSwipeRight();
        } else {
          // Swipe left
          this.handleSwipeLeft();
        }
      }
    }, { passive: true });
    
    mainContainer.addEventListener('touchend', (e) => {
      const deltaY = this.touchState.currentY - this.touchState.startY;
      const duration = Date.now() - this.touchState.startTime;
      
      // Pull to refresh release
      if (deltaY > 100 && duration < 1000) {
        this.triggerRefresh();
      }
      
      // Reset touch state
      this.resetTouchState();
    }, { passive: true });
    
    // Double tap to zoom charts
    let lastTap = 0;
    mainContainer.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 500 && tapLength > 0) {
        // Double tap detected
        const target = e.target.closest('.mobile-chart-container');
        if (target) {
          this.handleChartDoubleTap(target);
        }
      }
      
      lastTap = currentTime;
    });
    
    // Long press for context menus
    let longPressTimer;
    mainContainer.addEventListener('touchstart', (e) => {
      longPressTimer = setTimeout(() => {
        const target = e.target.closest('.mobile-stat-card, .mobile-action-card');
        if (target) {
          this.handleLongPress(target, e);
        }
      }, 800);
    });
    
    mainContainer.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
    });
    
    mainContainer.addEventListener('touchmove', () => {
      clearTimeout(longPressTimer);
    });
  }

  setupResponsiveCharts() {
    console.log('📊 Setting up responsive charts...');
    
    // Wait for Chart.js to be available
    const checkChartJs = () => {
      if (typeof Chart !== 'undefined') {
        this.initializeMobileCharts();
      } else {
        setTimeout(checkChartJs, 100);
      }
    };
    
    checkChartJs();
  }

  initializeMobileCharts() {
    const canvas = document.getElementById('mobile-main-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Mobile-optimized chart configuration
    const mobileChartConfig = {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [8000, 9500, 7200, 11000, 9800, 12500],
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3498db',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#3498db',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: function(context) {
                return `${context[0].label} 2024`;
              },
              label: function(context) {
                return `Revenue: $${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false
            },
            ticks: {
              color: '#7f8c8d',
              font: {
                size: 12
              }
            }
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(127, 140, 141, 0.2)'
            },
            ticks: {
              color: '#7f8c8d',
              font: {
                size: 12
              },
              callback: function(value) {
                return '$' + (value / 1000) + 'k';
              }
            }
          }
        },
        // Mobile-specific optimizations
        elements: {
          point: {
            hitRadius: 15 // Larger hit area for touch
          }
        },
        onHover: (event, activeElements) => {
          event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
        }
      }
    };
    
    this.mobileChart = new Chart(ctx, mobileChartConfig);
    
    // Setup chart period controls
    document.querySelectorAll('.chart-period-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Remove active class from all buttons
        document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        e.target.classList.add('active');
        
        // Update chart data
        this.updateChartData(e.target.dataset.period);
      });
    });
  }

  setupOfflineMode() {
    console.log('📶 Setting up offline mode...');
    
    // Monitor connection status
    window.addEventListener('online', () => {
      this.updateConnectionStatus(true);
      this.syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
      this.updateConnectionStatus(false);
    });
    
    // Initial status
    this.updateConnectionStatus(navigator.onLine);
  }

  setupMobileNavigation() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-overlay');
    
    menuToggle?.addEventListener('click', () => {
      this.toggleMobileMenu();
    });
    
    overlay?.addEventListener('click', () => {
      this.closeMobileMenu();
    });
    
    // Navigation items
    document.querySelectorAll('.mobile-nav-item, .bottom-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        
        if (section === 'add') {
          this.showQuickAddModal();
        } else {
          this.navigateToSection(section);
        }
      });
    });
    
    // Quick actions
    document.querySelectorAll('.mobile-action-card').forEach(card => {
      card.addEventListener('click', () => {
        const action = card.dataset.action;
        this.handleQuickAction(action);
      });
    });
    
    // Install app button
    document.getElementById('mobile-install-app')?.addEventListener('click', () => {
      this.installApp();
    });
  }

  // Touch Gesture Handlers
  handleSwipeRight() {
    // Navigate to previous section or open menu
    console.log('👉 Swipe right detected');
    this.toggleMobileMenu();
  }

  handleSwipeLeft() {
    // Navigate to next section or close menu
    console.log('👈 Swipe left detected');
    this.closeMobileMenu();
  }

  handleChartDoubleTap(chartContainer) {
    console.log('👆👆 Double tap on chart');
    
    // Toggle chart fullscreen
    if (chartContainer.classList.contains('fullscreen')) {
      chartContainer.classList.remove('fullscreen');
    } else {
      chartContainer.classList.add('fullscreen');
    }
    
    // Resize chart
    setTimeout(() => {
      if (this.mobileChart) {
        this.mobileChart.resize();
      }
    }, 300);
  }

  handleLongPress(element, event) {
    console.log('👆⏰ Long press detected');
    
    // Show context menu
    this.showContextMenu(element, event.touches[0]);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  showPullToRefresh() {
    // Add pull-to-refresh indicator
    const indicator = document.querySelector('.pull-refresh-indicator') || 
      this.createPullRefreshIndicator();
    
    indicator.style.display = 'block';
    indicator.style.transform = 'translateY(0)';
  }

  triggerRefresh() {
    console.log('🔄 Pull to refresh triggered');
    
    // Show loading state
    this.showRefreshLoading();
    
    // Simulate data refresh
    setTimeout(() => {
      this.refreshDashboardData();
      this.hideRefreshLoading();
    }, 1500);
  }

  // Navigation Methods
  toggleMobileMenu() {
    const nav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-overlay');
    const body = document.body;
    
    if (nav.classList.contains('open')) {
      this.closeMobileMenu();
    } else {
      nav.classList.add('open');
      overlay.classList.add('active');
      body.classList.add('menu-open');
    }
  }

  closeMobileMenu() {
    const nav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-overlay');
    const body = document.body;
    
    nav.classList.remove('open');
    overlay.classList.remove('active');
    body.classList.remove('menu-open');
  }

  navigateToSection(section) {
    console.log(`📱 Navigating to section: ${section}`);
    
    // Update active navigation items
    document.querySelectorAll('.mobile-nav-item, .bottom-nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.section === section) {
        item.classList.add('active');
      }
    });
    
    // Close mobile menu
    this.closeMobileMenu();
    
    // Load section content
    this.loadSectionContent(section);
  }

  loadSectionContent(section) {
    const main = document.getElementById('mobile-main');
    if (!main) return;
    
    // Section-specific content loading
    switch (section) {
      case 'dashboard':
        this.loadDashboardContent();
        break;
      case 'finance':
        this.loadFinanceContent();
        break;
      case 'shows':
        this.loadShowsContent();
        break;
      case 'expenses':
        this.loadExpensesContent();
        break;
      case 'reports':
        this.loadReportsContent();
        break;
      case 'settings':
        this.loadSettingsContent();
        break;
      default:
        console.log(`Unknown section: ${section}`);
    }
  }

  // Modal Management
  showQuickAddModal() {
    const modal = document.getElementById('quick-add-modal');
    const overlay = document.getElementById('mobile-overlay');
    
    modal.classList.add('active');
    overlay.classList.add('active');
    
    // Setup modal close handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeModal(btn.dataset.modal);
      });
    });
    
    // Quick add option handlers
    document.querySelectorAll('.quick-add-option').forEach(option => {
      option.addEventListener('click', () => {
        const type = option.dataset.type;
        this.handleQuickAdd(type);
        this.closeModal('quick-add-modal');
      });
    });
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('mobile-overlay');
    
    modal.classList.remove('active');
    overlay.classList.remove('active');
  }

  // Quick Actions
  handleQuickAction(action) {
    console.log(`🚀 Quick action: ${action}`);
    
    switch (action) {
      case 'add-expense':
        this.showExpenseForm();
        break;
      case 'add-income':
        this.showIncomeForm();
        break;
      case 'scan-receipt':
        this.openReceiptScanner();
        break;
      case 'generate-report':
        this.showReportGenerator();
        break;
    }
  }

  handleQuickAdd(type) {
    console.log(`➕ Quick add: ${type}`);
    
    switch (type) {
      case 'expense':
        this.showExpenseForm();
        break;
      case 'income':
        this.showIncomeForm();
        break;
      case 'receipt':
        this.openReceiptScanner();
        break;
    }
  }

  // Data Management
  updateChartData(period) {
    if (!this.mobileChart) return;
    
    const data = {
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [1200, 1800, 1500, 2200, 1900, 2500, 2100]
      },
      month: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [8000, 9500, 7200, 11000, 9800, 12500]
      },
      year: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        data: [24700, 29300, 32100, 38000]
      }
    };
    
    this.mobileChart.data.labels = data[period].labels;
    this.mobileChart.data.datasets[0].data = data[period].data;
    this.mobileChart.update('active');
  }

  refreshDashboardData() {
    console.log('🔄 Refreshing dashboard data...');
    
    // Update stats
    this.updateMobileStats();
    
    // Update activity
    this.updateRecentActivity();
    
    // Update chart
    this.updateChartData('month');
  }

  updateMobileStats() {
    // Simulate new data
    const revenue = 125000 + (Math.random() - 0.5) * 10000;
    const expenses = 87500 + (Math.random() - 0.5) * 5000;
    const profit = revenue - expenses;
    
    document.getElementById('mobile-revenue').textContent = this.formatCurrency(revenue);
    document.getElementById('mobile-expenses').textContent = this.formatCurrency(expenses);
    document.getElementById('mobile-profit').textContent = this.formatCurrency(profit);
  }

  updateRecentActivity() {
    const activityList = document.getElementById('mobile-activity');
    if (!activityList) return;
    
    const activities = [
      { icon: '💰', title: 'Show Payment Received', subtitle: '$3,500 • The Fillmore', time: '2h ago' },
      { icon: '🧾', title: 'Travel Expense Added', subtitle: '$450 • Flight to Denver', time: '4h ago' },
      { icon: '🎭', title: 'New Show Booked', subtitle: 'Red Rocks Amphitheatre', time: '6h ago' },
      { icon: '📊', title: 'Monthly Report Generated', subtitle: 'February 2024 Summary', time: '1d ago' }
    ];
    
    activityList.innerHTML = activities.map(activity => `
      <div class="mobile-activity-item">
        <div class="activity-icon">${activity.icon}</div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-subtitle">${activity.subtitle}</div>
        </div>
        <div class="activity-time">${activity.time}</div>
      </div>
    `).join('');
  }

  // Connection Status
  updateConnectionStatus(isOnline) {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    if (statusIndicator && statusText) {
      if (isOnline) {
        statusIndicator.className = 'status-indicator online';
        statusText.textContent = 'Online';
      } else {
        statusIndicator.className = 'status-indicator offline';
        statusText.textContent = 'Offline';
      }
    }
  }

  syncOfflineData() {
    console.log('🔄 Syncing offline data...');
    // Implement offline data synchronization
  }

  // PWA Installation
  showInstallPrompt() {
    const installBtn = document.getElementById('mobile-install-app');
    if (installBtn) {
      installBtn.style.display = 'block';
    }
  }

  hideInstallPrompt() {
    const installBtn = document.getElementById('mobile-install-app');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  }

  async installApp() {
    if (this.installPrompt) {
      const result = await this.installPrompt.prompt();
      console.log('📲 Install prompt result:', result);
      this.installPrompt = null;
      this.hideInstallPrompt();
    }
  }

  showUpdateAvailable() {
    const notification = document.getElementById('update-notification');
    if (notification) {
      notification.style.display = 'block';
      
      document.getElementById('update-app')?.addEventListener('click', () => {
        window.location.reload();
      });
      
      document.getElementById('dismiss-update')?.addEventListener('click', () => {
        notification.style.display = 'none';
      });
    }
  }

  // Utility Methods
  injectMobileStyles() {
    const mobileStyles = `
      <style id="mobile-dashboard-styles">
        /* Mobile Dashboard Styles */
        .mobile-dashboard-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f8f9fa;
          overflow: hidden;
        }
        
        .mobile-header {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          padding: 10px 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
        }
        
        .mobile-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
        }
        
        .mobile-menu-toggle {
          background: none;
          border: none;
          color: white;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .hamburger-line {
          display: block;
          width: 20px;
          height: 2px;
          background: white;
          margin: 3px 0;
          transition: 0.3s;
        }
        
        .mobile-title h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
        }
        
        .connection-status {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
          opacity: 0.9;
        }
        
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .status-indicator.online { background: #2ecc71; }
        .status-indicator.offline { background: #e74c3c; }
        
        .mobile-actions {
          display: flex;
          gap: 10px;
        }
        
        .mobile-action-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          position: relative;
        }
        
        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #e74c3c;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .mobile-nav {
          position: fixed;
          top: 0;
          left: -300px;
          width: 300px;
          height: 100vh;
          background: white;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
          transition: left 0.3s ease;
          z-index: 2000;
        }
        
        .mobile-nav.open {
          left: 0;
        }
        
        .mobile-nav-content {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px 0;
          border-bottom: 1px solid #ecf0f1;
        }
        
        .user-avatar {
          width: 50px;
          height: 50px;
          background: #3498db;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        
        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 0;
          text-decoration: none;
          color: #2c3e50;
          border-radius: 8px;
          margin: 2px 0;
          transition: background 0.2s;
        }
        
        .mobile-nav-item:hover,
        .mobile-nav-item.active {
          background: #ecf0f1;
          color: #3498db;
        }
        
        .nav-icon {
          font-size: 20px;
          width: 24px;
          text-align: center;
        }
        
        .mobile-main {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          padding-bottom: 80px; /* Space for bottom nav */
        }
        
        .mobile-stats-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .mobile-stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .stat-icon {
          font-size: 24px;
        }
        
        .stat-trend {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: bold;
        }
        
        .stat-trend.up {
          background: #d4edda;
          color: #155724;
        }
        
        .stat-trend.down {
          background: #f8d7da;
          color: #721c24;
        }
        
        .stat-value {
          font-size: 1.8rem;
          font-weight: bold;
          color: #2c3e50;
        }
        
        .stat-label {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-top: 5px;
        }
        
        .mobile-chart-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        
        .mobile-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .mobile-chart-controls {
          display: flex;
          gap: 8px;
        }
        
        .chart-period-btn {
          padding: 6px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }
        
        .chart-period-btn.active {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }
        
        .mobile-chart-container {
          height: 200px;
          position: relative;
        }
        
        .mobile-chart-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 3000;
          background: white;
          padding: 20px;
        }
        
        .mobile-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .mobile-action-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .mobile-action-card:active {
          transform: scale(0.95);
          box-shadow: 0 1px 5px rgba(0,0,0,0.15);
        }
        
        .action-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }
        
        .action-title {
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 5px;
        }
        
        .action-subtitle {
          color: #7f8c8d;
          font-size: 0.8rem;
        }
        
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #ecf0f1;
          padding: 10px;
          display: flex;
          justify-content: space-around;
          z-index: 1000;
        }
        
        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 8px;
          min-width: 60px;
        }
        
        .bottom-nav-item.active {
          color: #3498db;
        }
        
        .bottom-nav-item .nav-icon {
          font-size: 20px;
          margin-bottom: 4px;
        }
        
        .bottom-nav-item .nav-label {
          font-size: 10px;
        }
        
        .add-icon {
          background: #3498db;
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
        }
        
        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.5);
          z-index: 1500;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s, visibility 0.3s;
        }
        
        .mobile-overlay.active {
          opacity: 1;
          visibility: visible;
        }
        
        .mobile-modal {
          position: fixed;
          bottom: -100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 20px 20px 0 0;
          padding: 0;
          z-index: 2500;
          transition: bottom 0.3s ease;
          max-height: 80vh;
        }
        
        .mobile-modal.active {
          bottom: 0;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #ecf0f1;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #7f8c8d;
        }
        
        .quick-add-options {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          padding: 30px;
        }
        
        .quick-add-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: #f8f9fa;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .quick-add-option:active {
          background: #e9ecef;
        }
        
        .option-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }
        
        .mobile-activity-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        
        .mobile-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .see-all-btn {
          background: none;
          border: none;
          color: #3498db;
          font-size: 14px;
          cursor: pointer;
        }
        
        .mobile-activity-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #f8f9fa;
        }
        
        .mobile-activity-item:last-child {
          border-bottom: none;
        }
        
        .activity-icon {
          font-size: 24px;
          width: 40px;
          text-align: center;
        }
        
        .activity-content {
          flex: 1;
        }
        
        .activity-title {
          font-weight: 500;
          color: #2c3e50;
          margin-bottom: 4px;
        }
        
        .activity-subtitle {
          color: #7f8c8d;
          font-size: 0.9rem;
        }
        
        .activity-time {
          color: #95a5a6;
          font-size: 0.8rem;
        }
        
        /* Responsive adjustments */
        @media (max-width: 480px) {
          .mobile-actions-grid {
            grid-template-columns: 1fr;
          }
          
          .quick-add-options {
            grid-template-columns: 1fr;
          }
        }
        
        /* Hide desktop elements on mobile */
        @media (max-width: 768px) {
          .finance-dashboard {
            display: none !important;
          }
        }
        
        /* Show mobile elements only on mobile */
        @media (min-width: 769px) {
          .mobile-dashboard-container {
            display: none !important;
          }
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', mobileStyles);
  }

  resetTouchState() {
    this.touchState = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      startTime: 0
    };
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Placeholder methods for future implementation
  loadDashboardContent() { console.log('Loading dashboard content...'); }
  loadFinanceContent() { console.log('Loading finance content...'); }
  loadShowsContent() { console.log('Loading shows content...'); }
  loadExpensesContent() { console.log('Loading expenses content...'); }
  loadReportsContent() { console.log('Loading reports content...'); }
  loadSettingsContent() { console.log('Loading settings content...'); }
  
  showExpenseForm() { console.log('Showing expense form...'); }
  showIncomeForm() { console.log('Showing income form...'); }
  openReceiptScanner() { console.log('Opening receipt scanner...'); }
  showReportGenerator() { console.log('Showing report generator...'); }
  
  createPullRefreshIndicator() { 
    const indicator = document.createElement('div');
    indicator.className = 'pull-refresh-indicator';
    indicator.innerHTML = '🔄 Pull to refresh';
    return indicator;
  }
  
  showRefreshLoading() { console.log('Showing refresh loading...'); }
  hideRefreshLoading() { console.log('Hiding refresh loading...'); }
  
  showContextMenu(element, touch) { 
    console.log('Showing context menu for:', element); 
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.mobileDashboard = new MobileDashboardEngine();
});

// Make it globally available
window.MobileDashboardEngine = MobileDashboardEngine;

export default MobileDashboardEngine;
