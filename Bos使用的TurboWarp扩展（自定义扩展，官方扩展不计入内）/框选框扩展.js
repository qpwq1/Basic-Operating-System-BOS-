// 框选框扩展 - BOS定制版（修复版）
// 修复内容：确保舞台就绪、动态绑定事件、坐标转换容错、样式默认值保护、边界检查健壮性

(function (Scratch) {
  'use strict';

  if (!(Scratch && Scratch.extensions && Scratch.extensions.register)) {
    throw new Error('请在 TurboWarp 扩展环境中加载。');
  }

  const A = Scratch.ArgumentType;
  const B = Scratch.BlockType;

  // BOS 主题色
  const BOS_COLORS = {
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
    accent: "#FFE66D"
  };

  // 舞台逻辑尺寸
  const STAGE_W = 480;
  const STAGE_H = 360;

  // ====== VM/Renderer 获取（带容错与等待）======
  const getVM = () => Scratch.vm || (Scratch.runtime && Scratch.runtime.vm);
  const getRuntime = () => getVM()?.runtime || null;
  const getRenderer = () => getRuntime()?.renderer || null;
  const getStageCanvas = () => getRenderer()?.canvas || null;

  // 等待舞台就绪（用于异步初始化）
  function waitForStageReady() {
    return new Promise((resolve) => {
      const check = () => {
        const canvas = getStageCanvas();
        if (canvas && canvas.parentElement) {
          resolve(canvas);
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  function getStageHost() {
    const canvas = getStageCanvas();
    if (!canvas) return null;
    let host = canvas.parentElement;
    while (host && !host.classList?.contains('stage-wrapper') && host !== document.body) {
      host = host.parentElement;
    }
    if (!host) host = canvas.parentElement || canvas;
    host.style.position ||= 'relative';
    return host;
  }

  // ====== 舞台缩放因子 ======
  function getStageScale() {
    const canvas = getStageCanvas();
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    return rect.width / STAGE_W;
  }

  // ====== 坐标换算（修复滚动偏移）======
  function screenToStage(clientX, clientY) {
    const canvas = getStageCanvas();
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // 确保坐标在画布范围内
    const nx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const ny = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    return {
      x: nx * STAGE_W - STAGE_W / 2,
      y: STAGE_H / 2 - ny * STAGE_H
    };
  }

  function stageToPagePixels(x, y) {
    const canvas = getStageCanvas();
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (x + STAGE_W / 2) / STAGE_W * rect.width + rect.left,
      y: (STAGE_H / 2 - y) / STAGE_H * rect.height + rect.top
    };
  }

  function normRect(x1, y1, x2, y2) {
    const left = Math.min(x1, x2), right = Math.max(x1, x2);
    const bottom = Math.min(y1, y2), top = Math.max(y1, y2);
    return { left, right, top, bottom, width: right - left, height: top - bottom };
  }

  // ====== 颜色工具 ======
  function hexToRGB(hex) {
    let h = String(hex || '').trim();
    if (h.startsWith('#')) h = h.slice(1);
    if (h.length === 3) return {
      r: parseInt(h[0]+h[0], 16),
      g: parseInt(h[1]+h[1], 16),
      b: parseInt(h[2]+h[2], 16)
    };
    if (h.length >= 6) return {
      r: parseInt(h.slice(0,2), 16),
      g: parseInt(h.slice(2,4), 16),
      b: parseInt(h.slice(4,6), 16)
    };
    return { r: 0x4E, g: 0xCD, b: 0xC4 }; // BOS secondary
  }

  // ====== 覆盖层（SVG）======
  let overlay = null, svgEl = null, rectEl = null;
  let overlayActive = false;
  let isDragging = false;
  let dragStart = null, dragEnd = null;
  let lastRect = null;
  const selection = new Set(); // 存储选中角色的名称

  // 样式状态（单位：舞台像素）
  const styleState = {
    strokeColor: BOS_COLORS.primary,
    fillColor: BOS_COLORS.secondary,
    strokeAlpha: 0.1,    // 透明度：0=不透明，1=全透明
    fillAlpha: 0.8,
    strokeWidthBase: 2,
    dashLenBase: 0,
    dashGapBase: 0,
    cornerBase: 4
  };

  // 确保覆盖层存在（异步等待舞台）
  async function ensureOverlay() {
    await waitForStageReady(); // 等待舞台就绪
    const host = getStageHost();
    if (!host) return;
    if (overlay) return;

    overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      right: '0',
      bottom: '0',
      pointerEvents: 'none',
      zIndex: 1000
    });
    host.appendChild(overlay);

    svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('width', '100%');
    svgEl.setAttribute('height', '100%');
    svgEl.style.position = 'absolute';
    svgEl.style.left = '0';
    svgEl.style.top = '0';
    svgEl.style.display = 'block';
    svgEl.style.pointerEvents = 'none';
    overlay.appendChild(svgEl);

    rectEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectEl.style.display = 'none';
    svgEl.appendChild(rectEl);

    // 监听舞台大小变化
    const resizeObserver = new ResizeObserver(() => redraw());
    resizeObserver.observe(host);
    window.addEventListener('resize', redraw);
    document.addEventListener('fullscreenchange', redraw);
  }

  // 应用样式到矩形
  function applyStyleToRect() {
    if (!rectEl) return;
    const scale = getStageScale();
    const sRGB = hexToRGB(styleState.strokeColor);
    const fRGB = hexToRGB(styleState.fillColor);

    rectEl.setAttribute('stroke', `rgb(${sRGB.r},${sRGB.g},${sRGB.b})`);
    rectEl.setAttribute('fill', `rgb(${fRGB.r},${fRGB.g},${fRGB.b})`);
    // 透明度：值越小越透明，这里直接使用设置值（0=不透明，1=全透明）
    rectEl.setAttribute('stroke-opacity', String(1 - Math.min(1, Math.max(0, styleState.strokeAlpha))));
    rectEl.setAttribute('fill-opacity', String(1 - Math.min(1, Math.max(0, styleState.fillAlpha))));
    rectEl.setAttribute('stroke-width', String(Math.max(0.1, styleState.strokeWidthBase * scale)));
    rectEl.setAttribute('rx', String(Math.max(0, styleState.cornerBase * scale)));
    rectEl.setAttribute('ry', String(Math.max(0, styleState.cornerBase * scale)));

    const dashLen = Math.max(0, styleState.dashLenBase * scale);
    const dashGap = Math.max(0, styleState.dashGapBase * scale);
    if (dashLen > 0 || dashGap > 0) {
      rectEl.setAttribute('stroke-dasharray', `${dashLen} ${dashGap}`);
    } else {
      rectEl.removeAttribute('stroke-dasharray');
    }
  }

  // 绘制矩形
  function drawBox(rect) {
    if (!overlay || !svgEl || !rectEl || !rect) return;

    const host = getStageHost();
    if (!host) return;

    const hostRect = host.getBoundingClientRect();
    const p1 = stageToPagePixels(rect.left, rect.top);
    const p2 = stageToPagePixels(rect.right, rect.bottom);

    const left = Math.min(p1.x, p2.x) - hostRect.left;
    const top = Math.min(p1.y, p2.y) - hostRect.top;
    const width = Math.abs(p2.x - p1.x);
    const height = Math.abs(p2.y - p1.y);

    rectEl.setAttribute('x', String(left));
    rectEl.setAttribute('y', String(top));
    rectEl.setAttribute('width', String(width));
    rectEl.setAttribute('height', String(height));
    applyStyleToRect();
    rectEl.style.display = (width > 1 && height > 1) ? 'block' : 'none';
  }

  function hideBox() {
    if (rectEl) rectEl.style.display = 'none';
  }

  function redraw() {
    if (lastRect) drawBox(lastRect);
  }

  // 更新选中的角色（改进边界检查）
  function refreshSelection(rect) {
    selection.clear();
    if (!rect) return;

    const runtime = getRuntime();
    if (!runtime) return;

    for (const target of runtime.targets) {
      if (!target || target.isStage) continue;
      // 获取角色边界（带容错）
      let bounds = null;
      try {
        bounds = target.getBounds?.();
      } catch(e) {}
      if (!bounds) continue;

      // 边界值可能为undefined，确保是数字
      const left = bounds.left ?? -Infinity;
      const right = bounds.right ?? Infinity;
      const top = bounds.top ?? Infinity;
      const bottom = bounds.bottom ?? -Infinity;

      // 检查边界框是否与矩形相交
      const hit = !(right < rect.left ||
                    left > rect.right ||
                    top < rect.bottom ||
                    bottom > rect.top);
      if (hit) {
        const name = target.getName?.() || target.sprite?.name || '';
        if (name) selection.add(name);
      }
    }
  }

  // 获取所有角色名称（用于菜单）
  function allSpriteNames() {
    const runtime = getRuntime();
    if (!runtime) return ['无角色'];
    const names = [];
    for (const target of runtime.targets) {
      if (target && !target.isStage) {
        const name = target.getName?.() || target.sprite?.name;
        if (name) names.push(name);
      }
    }
    return names.length ? names : ['无角色'];
  }

  // ====== 鼠标事件处理（动态添加/移除监听，确保绑定正确宿主）======
  let mouseListenersAttached = false;

  function attachMouseHandlers() {
    if (mouseListenersAttached) return;

    const host = getStageHost();
    if (!host) {
      // 如果宿主还未就绪，延迟重试
      setTimeout(() => attachMouseHandlers(), 100);
      return;
    }

    const onMouseDown = (e) => {
      if (!overlayActive || e.button !== 0) return;
      const { x, y } = screenToStage(e.clientX, e.clientY);
      isDragging = true;
      dragStart = { x, y };
      dragEnd = { x, y };
      lastRect = normRect(dragStart.x, dragStart.y, dragEnd.x, dragEnd.y);
      drawBox(lastRect);
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!overlayActive || !isDragging) return;
      const { x, y } = screenToStage(e.clientX, e.clientY);
      dragEnd = { x, y };
      lastRect = normRect(dragStart.x, dragStart.y, dragEnd.x, dragEnd.y);
      drawBox(lastRect);
      refreshSelection(lastRect);
      e.preventDefault();
    };

    const onMouseUp = () => {
      if (overlayActive) {
        isDragging = false;
      }
    };

    host.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 保存以便移除
    host._bosMarqueeHandlers = { onMouseDown, onMouseMove, onMouseUp };
    mouseListenersAttached = true;
  }

  function detachMouseHandlers() {
    if (!mouseListenersAttached) return;
    const host = getStageHost();
    if (!host) return;

    const handlers = host._bosMarqueeHandlers;
    if (handlers) {
      host.removeEventListener('mousedown', handlers.onMouseDown);
      window.removeEventListener('mousemove', handlers.onMouseMove);
      window.removeEventListener('mouseup', handlers.onMouseUp);
      delete host._bosMarqueeHandlers;
    }
    mouseListenersAttached = false;
  }

  // ====== 扩展类 ======
  class BOSMarqueeExtension {
    getInfo() {
      return {
        id: 'bosMarquee',
        name: 'BOS 框选框',
        color1: BOS_COLORS.primary,
        color2: BOS_COLORS.secondary,
        color3: BOS_COLORS.accent,
        blocks: [
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🖱️ 框选控制'
          },
          {
            opcode: 'enableMarquee',
            blockType: Scratch.BlockType.COMMAND,
            text: '启用鼠标框选 [STATE]',
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'onoffMenu',
                defaultValue: '开'
              }
            }
          },
          {
            opcode: 'createBox',
            blockType: Scratch.BlockType.COMMAND,
            text: '创建框选矩形 左 [L] 右 [R] 下 [B] 上 [T]',
            arguments: {
              L: { type: Scratch.ArgumentType.NUMBER, defaultValue: -100 },
              R: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
              B: { type: Scratch.ArgumentType.NUMBER, defaultValue: -80 },
              T: { type: Scratch.ArgumentType.NUMBER, defaultValue: 80 }
            }
          },
          {
            opcode: 'clearBox',
            blockType: Scratch.BlockType.COMMAND,
            text: '清除框选'
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: '🔍 查询'
          },
          {
            opcode: 'isDragging',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '正在框选？'
          },
          {
            opcode: 'isSelected',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '角色 [NAME] 被选中？',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, menu: 'spriteMenu' }
            }
          },
          {
            opcode: 'selectedList',
            blockType: Scratch.BlockType.REPORTER,
            text: '所有被选中的角色'
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: '📐 框选区域信息'
          },
          {
            opcode: 'boxLeft',
            blockType: Scratch.BlockType.REPORTER,
            text: '框选左边界'
          },
          {
            opcode: 'boxRight',
            blockType: Scratch.BlockType.REPORTER,
            text: '框选右边界'
          },
          {
            opcode: 'boxBottom',
            blockType: Scratch.BlockType.REPORTER,
            text: '框选下边界'
          },
          {
            opcode: 'boxTop',
            blockType: Scratch.BlockType.REPORTER,
            text: '框选上边界'
          },
          {
            opcode: 'boxWidth',
            blockType: Scratch.BlockType.REPORTER,
            text: '框选宽度'
          },
          {
            opcode: 'boxHeight',
            blockType: Scratch.BlockType.REPORTER,
            text: '框选高度'
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: '🎨 样式设置'
          },
          {
            opcode: 'setStrokeColor',
            blockType: Scratch.BlockType.COMMAND,
            text: '边框颜色 [COLOR]',
            arguments: {
              COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: BOS_COLORS.primary }
            }
          },
          {
            opcode: 'setFillColor',
            blockType: Scratch.BlockType.COMMAND,
            text: '填充颜色 [COLOR]',
            arguments: {
              COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: BOS_COLORS.secondary }
            }
          },
          {
            opcode: 'setStrokeAlpha',
            blockType: Scratch.BlockType.COMMAND,
            text: '边框透明度 [A]%',
            arguments: {
              A: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
            }
          },
          {
            opcode: 'setFillAlpha',
            blockType: Scratch.BlockType.COMMAND,
            text: '填充透明度 [A]%',
            arguments: {
              A: { type: Scratch.ArgumentType.NUMBER, defaultValue: 80 }
            }
          },
          {
            opcode: 'setStrokeWidth',
            blockType: Scratch.BlockType.COMMAND,
            text: '边框粗细 [W]',
            arguments: {
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 }
            }
          },
          {
            opcode: 'setDash',
            blockType: Scratch.BlockType.COMMAND,
            text: '虚线模式 段长 [LEN] 间隔 [GAP]',
            arguments: {
              LEN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              GAP: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 }
            }
          },
          {
            opcode: 'setCornerRadius',
            blockType: Scratch.BlockType.COMMAND,
            text: '圆角半径 [R]',
            arguments: {
              R: { type: Scratch.ArgumentType.NUMBER, defaultValue: 4 }
            }
          }
        ],
        menus: {
          onoffMenu: {
            acceptReporters: true,
            items: ['开', '关']
          },
          spriteMenu: {
            acceptReporters: true,
            items: 'getSpriteNames'
          }
        }
      };
    }

    // 菜单数据
    getSpriteNames() {
      return allSpriteNames().map(name => ({ text: name, value: name }));
    }

    // 启用/禁用鼠标框选（异步等待舞台）
    async enableMarquee(args) {
      await ensureOverlay(); // 确保覆盖层已创建
      overlayActive = String(args.STATE) === '开';
      if (overlayActive) {
        attachMouseHandlers();
        redraw();
      } else {
        detachMouseHandlers();
        isDragging = false;
        dragStart = dragEnd = null;
        hideBox();
      }
    }

    // 手动创建框选矩形
    async createBox(args) {
      await ensureOverlay();
      attachMouseHandlers(); // 确保事件存在（不会重复）
      const left = Number(args.L) || 0;
      const right = Number(args.R) || 0;
      const bottom = Number(args.B) || 0;
      const top = Number(args.T) || 0;
      lastRect = normRect(left, bottom, right, top);
      drawBox(lastRect);
      refreshSelection(lastRect);
    }

    clearBox() {
      selection.clear();
      lastRect = null;
      hideBox();
    }

    // 状态查询
    isDragging() {
      return isDragging;
    }

    isSelected(args) {
      if (lastRect) refreshSelection(lastRect);
      return selection.has(String(args.NAME || ''));
    }

    selectedList() {
      if (lastRect) refreshSelection(lastRect);
      return Array.from(selection).join(', ');
    }

    // 框选区域信息
    boxLeft()   { return lastRect ? lastRect.left : 0; }
    boxRight()  { return lastRect ? lastRect.right : 0; }
    boxBottom() { return lastRect ? lastRect.bottom : 0; }
    boxTop()    { return lastRect ? lastRect.top : 0; }
    boxWidth()  { return lastRect ? lastRect.width : 0; }
    boxHeight() { return lastRect ? lastRect.height : 0; }

    // 样式设置（同步更新）
    setStrokeColor(args) {
      styleState.strokeColor = args.COLOR || BOS_COLORS.primary;
      applyStyleToRect();
      redraw();
    }
    setFillColor(args) {
      styleState.fillColor = args.COLOR || BOS_COLORS.secondary;
      applyStyleToRect();
      redraw();
    }
    setStrokeAlpha(args) {
      styleState.strokeAlpha = Math.min(1, Math.max(0, Number(args.A) / 100));
      applyStyleToRect();
      redraw();
    }
    setFillAlpha(args) {
      styleState.fillAlpha = Math.min(1, Math.max(0, Number(args.A) / 100));
      applyStyleToRect();
      redraw();
    }
    setStrokeWidth(args) {
      styleState.strokeWidthBase = Math.max(0, Number(args.W) || 0);
      applyStyleToRect();
      redraw();
    }
    setDash(args) {
      styleState.dashLenBase = Math.max(0, Number(args.LEN) || 0);
      styleState.dashGapBase = Math.max(0, Number(args.GAP) || 0);
      applyStyleToRect();
      redraw();
    }
    setCornerRadius(args) {
      styleState.cornerBase = Math.max(0, Number(args.R) || 0);
      applyStyleToRect();
      redraw();
    }
  }

  // 延迟注册扩展，避免抢占资源
  setTimeout(() => {
    // 先初始化覆盖层（异步等待舞台）
    ensureOverlay().catch(console.warn);
    Scratch.extensions.register(new BOSMarqueeExtension());
  }, 0);
})(Scratch);
