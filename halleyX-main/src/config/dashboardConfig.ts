/**
 * Dashboard Configuration
 * Customize drag-and-drop behavior, layout, and appearance
 */

export const dashboardConfig = {
  // ===== DRAG & DROP SETTINGS =====
  dragDrop: {
    // Enable drag-drop by default on load
    enabledByDefault: true,
    
    // Show helpful hint when drag mode is active
    showDragHint: true,
    
    // Automatically hide hint after (ms), set to 0 to disable
    dragHintTimeout: 0,
    
    // Allow resize by dragging corners
    allowResize: true,
    
    // Snap to grid
    compactType: 'vertical' as const,
    
    // Prevent widget collision
    preventCollision: false,
  },

  // ===== LAYOUT SETTINGS =====
  layout: {
    // Grid row height in pixels
    rowHeight: 100,
    
    // Margin between widgets [horizontal, vertical] in pixels
    margin: [16, 16],
    
    // Container padding [horizontal, vertical] in pixels
    containerPadding: [16, 16],
    
    // Responsive breakpoints
    breakpoints: {
      lg: 1200,
      md: 996,
      sm: 768,
      xs: 480,
      xxs: 0,
    },
    
    // Grid columns for each breakpoint
    cols: {
      lg: 12,
      md: 10,
      sm: 6,
      xs: 4,
      xxs: 2,
    },
  },

  // ===== WIDGET DEFAULTS =====
  widgets: {
    // Default sizes for different widget types
    defaultSizes: {
      KPI: { w: 3, h: 2 },
      Bar: { w: 6, h: 4 },
      Line: { w: 6, h: 4 },
      Area: { w: 6, h: 4 },
      Pie: { w: 4, h: 4 },
      Table: { w: 12, h: 5 },
    },
    
    // Persist layout changes to localStorage
    persistLayout: true,
    
    // Persist widget state
    persistState: true,
  },

  // ===== APPEARANCE SETTINGS =====
  appearance: {
    // Show grid background
    showGrid: false,
    
    // Enable animations
    enableAnimations: true,
    
    // Transition duration (ms)
    transitionDuration: 200,
    
    // Border radius for widgets (pixels)
    borderRadius: 8,
    
    // Enable shadow effects
    enableShadows: true,
    
    // Enable gradients
    enableGradients: true,
  },

  // ===== UX SETTINGS =====
  ux: {
    // Show "Add Widget" button
    showAddWidgetButton: true,
    
    // Show theme toggle
    showThemeToggle: true,
    
    // Show drag mode toggle
    showDragToggle: true,
    
    // Show empty state message
    showEmptyState: true,
    
    // Enable mobile touch optimization
    enableTouchOptimization: true,
  },

  // ===== ACCESSIBILITY =====
  accessibility: {
    // Keyboard shortcuts enabled
    enableKeyboardShortcuts: true,
    
    // Reduce motion for users who prefer it
    respectReducedMotion: true,
    
    // Focus visible indicator
    showFocusIndicator: true,
  },
};

/**
 * Preset Configurations
 * Use these for different use cases
 */

export const dashboardPresets = {
  // Production - stable, minimal changes
  production: {
    dragDrop: {
      enabledByDefault: false,
      showDragHint: true,
      dragHintTimeout: 5000,
    },
    appearance: {
      enableAnimations: false,
    },
  },

  // Development - all features enabled
  development: {
    dragDrop: {
      enabledByDefault: true,
      showDragHint: true,
      dragHintTimeout: 0,
    },
    appearance: {
      showGrid: true,
      enableAnimations: true,
    },
  },

  // Mobile-optimized
  mobile: {
    layout: {
      rowHeight: 80,
      margin: [8, 8],
      containerPadding: [8, 8],
    },
    ux: {
      enableTouchOptimization: true,
    },
    dragDrop: {
      allowResize: false, // Disable resize on mobile
    },
  },

  // Minimal - clean, simple interface
  minimal: {
    ux: {
      showAddWidgetButton: true,
      showThemeToggle: false,
      showDragToggle: false,
      showEmptyState: false,
    },
    appearance: {
      enableAnimations: false,
      enableShadows: false,
      enableGradients: false,
    },
  },
};

/**
 * Get merged config with preset
 * @param preset - Config preset name or custom config
 */
export function getConfig(preset?: keyof typeof dashboardPresets) {
  let config = { ...dashboardConfig };
  
  if (preset && dashboardPresets[preset]) {
    const presetConfig = dashboardPresets[preset] as any;
    config = {
      ...config,
      ...(presetConfig.dragDrop && { dragDrop: { ...config.dragDrop, ...presetConfig.dragDrop } }),
      ...(presetConfig.layout && { layout: { ...config.layout, ...presetConfig.layout } }),
      ...(presetConfig.appearance && { appearance: { ...config.appearance, ...presetConfig.appearance } }),
      ...(presetConfig.ux && { ux: { ...config.ux, ...presetConfig.ux } }),
    };
  }
  
  return config;
}
