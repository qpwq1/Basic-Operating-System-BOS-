// Name: BOS Iframe (真实浏览器模式 v6 - 完整版)
// ID: bosIframeV6
// 专为BOS内核设计: 真实浏览器体验 + 动态HTML完美支持 + 消息接收增强 + 进程消息概览

(function (Scratch) {
  "use strict";

  const iframesMap = new Map();
  
  // 全局最后消息记录
  let lastMessageApp = "";
  let lastMessageContent = "";
  
  // BOS 专用配置
  const BOS_CONFIG = {
    handshakeMessage: "你好",
    handshakeResponse: "收到",
    handshakeTimeout: 5000,
  };

  // ========== 优化版沙盒配置 ==========
  const DEFAULT_SANDBOX = [
    "allow-scripts",
    "allow-forms",
    "allow-modals",
    "allow-popups",
    "allow-popups-to-escape-sandbox",
    "allow-same-origin",
    "allow-storage-access-by-user-activation",
    "allow-downloads",
    "allow-orientation-lock",
    "allow-pointer-lock",
    "allow-presentation",
    "allow-top-navigation",
    "allow-top-navigation-by-user-activation",
  ];

  const SANDBOX_PRESETS = {
    "真实浏览器": DEFAULT_SANDBOX,
    "安全模式": [
      "allow-scripts",
      "allow-forms",
      "allow-modals",
      "allow-same-origin",
      "allow-storage-access-by-user-activation",
    ],
    "严格模式": [
      "allow-scripts",
      "allow-same-origin",
    ],
  };

  const featurePolicy = {
    accelerometer: "'self'",
    "ambient-light-sensor": "'self'",
    autoplay: "'self'",
    battery: "'self'",
    camera: "'self'",
    "display-capture": "'self'",
    "document-domain": "'self'",
    "encrypted-media": "'self'",
    fullscreen: "'self'",
    geolocation: "'self'",
    gyroscope: "'self'",
    magnetometer: "'self'",
    microphone: "'self'",
    midi: "'self'",
    payment: "'self'",
    "picture-in-picture": "'self'",
    "publickey-credentials-get": "'self'",
    "speaker-selection": "'self'",
    usb: "'self'",
    vibrate: "'self'",
    vr: "'self'",
    "screen-wake-lock": "'self'",
    "web-share": "'self'",
    "interest-cohort": "'self'",
  };

  const getOverlayMode = (resizeBehavior) =>
    resizeBehavior === "scale" ? "scale-centered" : "manual";

  // 工具函数：检测是否是 Base64 URL
  const isBase64Url = (str) => {
    return str.startsWith('data:') || 
           (str.startsWith('base64,') || str.includes(';base64,'));
  };

  const textToBase64Url = (text, mimeType = 'text/html') => {
    try {
      const base64 = btoa(unescape(encodeURIComponent(text)));
      return `data:${mimeType};base64,${base64}`;
    } catch (e) {
      console.error('Base64转换失败:', e);
      return `data:text/html,${encodeURIComponent(text)}`;
    }
  };

  const processUrlInput = (input, defaultMime = 'text/html') => {
    if (!input) return '';
    if (input.startsWith('http://') || input.startsWith('https://') || 
        input.startsWith('data:') || input.startsWith('file:')) {
      return input;
    }
    if (input.startsWith('base64,') || input.includes(';base64,')) {
      if (!input.startsWith('data:')) {
        return `data:${defaultMime};${input}`;
      }
      return input;
    }
    if (input.includes('<html') || input.includes('<body') || 
        input.includes('<div') || input.includes('<script') ||
        input.includes('<style') || input.includes('<h1')) {
      return textToBase64Url(input, defaultMime);
    }
    return textToBase64Url(input, defaultMime);
  };

  const setupLinkHandling = (iframe) => {
    const handleNavigation = (e) => {
      const target = e.target;
      if (target.tagName === 'A' && target.target === '_blank') {
        console.log('链接尝试打开新窗口:', target.href);
      }
    };

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.addEventListener('click', handleNavigation, true);
      }
    } catch (e) {}

    const reattachHandlers = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.addEventListener('click', handleNavigation, true);
        }
      } catch (e) {}
    };

    iframe.addEventListener('load', reattachHandlers);
    
    return {
      cleanup: () => {
        iframe.removeEventListener('load', reattachHandlers);
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.removeEventListener('click', handleNavigation, true);
          }
        } catch (e) {}
      }
    };
  };

  const USER_AGENTS = {
    "desktop": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "mobile": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    "default": navigator.userAgent,
  };

  const sendMessageToIframe = (name, message) => {
    if (!iframesMap.has(name)) return false;
    const { iframe } = iframesMap.get(name);
    try {
      iframe.contentWindow.postMessage(message, '*');
      return true;
    } catch (e) {
      console.error('BOS sendMessage failed:', e);
      return false;
    }
  };

  const setupMessageListener = (iframe, name, options = {}) => {
    const messageHandler = (event) => {
      if (event.source !== iframe.contentWindow) return;
      
      const data = event.data;
      
      const frameInfo = iframesMap.get(name);
      if (frameInfo) {
        frameInfo.lastMessage = data;
        // 更新全局最后消息
        lastMessageApp = name;
        lastMessageContent = data;
        
        // 触发特定应用的事件块
        if (frameInfo.util && frameInfo.util.startHats) {
          frameInfo.util.startHats('bosIframeV6_onMessage', { NAME: name });
          // 触发全局事件块（不带参数）
          frameInfo.util.startHats('bosIframeV6_onAnyMessage');
        }
      }
      
      if (options.onMessage) {
        options.onMessage(name, data);
      }
      
      if (data === BOS_CONFIG.handshakeMessage) {
        console.log(`BOS: iframe "${name}" 发送了“你好”，自动回复“收到”`);
        iframe.contentWindow.postMessage(BOS_CONFIG.handshakeResponse, '*');
        
        if (frameInfo) {
          frameInfo.handshakeCompleted = true;
          frameInfo.handshakeTime = Date.now();
        }
      }
    };
    
    window.addEventListener('message', messageHandler);
    return messageHandler;
  };

  const createFrame = (src, name, options = {}) => {
    if (iframesMap.has(name)) {
      closeFrame(name);
    }

    const processedUrl = processUrlInput(src, options.mimeType || 'text/html');
    if (!processedUrl) {
      console.error('无效的输入:', src);
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.position = "absolute";
    iframe.style.background = "transparent";
    
    const sandboxLevel = options.sandbox || "真实浏览器";
    const sandboxValue = SANDBOX_PRESETS[sandboxLevel]?.join(" ") || SANDBOX_PRESETS["真实浏览器"].join(" ");
    iframe.setAttribute("sandbox", sandboxValue);
    
    iframe.setAttribute(
      "allow",
      Object.entries(featurePolicy)
        .map(([name, permission]) => `${name} ${permission}`)
        .join("; ")
    );
    
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    
    if (options.userAgent && options.userAgent !== 'default') {
      iframe.setAttribute("data-useragent", options.userAgent);
    }

    iframe.setAttribute("crossorigin", "anonymous");
    
    iframe.src = processedUrl;

    const linkHandler = setupLinkHandling(iframe);
    
    iframe.addEventListener('error', (e) => {
      console.error('Iframe load error:', e, 'URL:', processedUrl);
    });

    const overlay = Scratch.renderer.addOverlay(iframe, getOverlayMode("scale"));
    
    const frameInfo = {
      iframe,
      overlay,
      name,
      url: processedUrl,
      visible: true,
      interactive: true,
      resizeBehavior: "scale",
      x: 0,
      y: 0,
      width: Scratch.vm.runtime.stageWidth,
      height: Scratch.vm.runtime.stageHeight,
      layer: 1,
      userAgent: options.userAgent || 'default',
      sandbox: sandboxLevel,
      linkHandler,
      loadTime: Date.now(),
      pid: `P${Math.floor(Math.random() * 10000)}`,
      handshakeCompleted: false,
      handshakeTime: null,
      messages: [],
      lastMessage: null,
      creationOptions: options,
      util: options.util,
    };

    iframesMap.set(name, frameInfo);

    const messageHandler = setupMessageListener(iframe, name, {
      onMessage: (name, data) => {
        const info = iframesMap.get(name);
        if (info) {
          info.messages.push({
            time: Date.now(),
            data: data,
            direction: 'in'
          });
          if (info.messages.length > 50) info.messages.shift();
        }
      }
    });
    frameInfo.messageHandler = messageHandler;

    updateFrameAttributes(name);
    
    const loadTimeout = setTimeout(() => {
      if (!iframe.contentWindow || iframe.contentWindow.location.href === 'about:blank') {
        console.warn('Iframe load timeout:', name);
      }
    }, 30000);
    
    iframe.addEventListener('load', () => {
      clearTimeout(loadTimeout);
      console.log(`BOS: iframe "${name}" 加载成功`);
      
      if (options.autoHandshake) {
        setTimeout(() => {
          if (iframesMap.has(name)) {
            console.log(`BOS: iframe "${name}" 发送握手消息`);
            iframe.contentWindow.postMessage(BOS_CONFIG.handshakeMessage, '*');
          }
        }, 500);
      }
    }, { once: true });

    return iframe;
  };

  const closeFrame = (name) => {
    if (iframesMap.has(name)) {
      const frameInfo = iframesMap.get(name);
      
      if (frameInfo.messageHandler) {
        window.removeEventListener('message', frameInfo.messageHandler);
      }
      
      if (frameInfo.linkHandler && frameInfo.linkHandler.cleanup) {
        frameInfo.linkHandler.cleanup();
      }
      
      Scratch.renderer.removeOverlay(frameInfo.iframe);
      
      if (frameInfo.iframe.parentNode) {
        frameInfo.iframe.parentNode.removeChild(frameInfo.iframe);
      }
      
      iframesMap.delete(name);
      console.log(`BOS: iframe "${name}" 已关闭`);
    }
  };

  const updateFrameAttributes = (name) => {
    if (!iframesMap.has(name)) return;

    const frameInfo = iframesMap.get(name);
    const { iframe, x, y, width, height, interactive, resizeBehavior } = frameInfo;
    
    iframe.style.pointerEvents = interactive ? "auto" : "none";
    iframe.style.display = frameInfo.visible ? "" : "none";
    iframe.style.opacity = frameInfo.visible ? "1" : "0";
    
    iframe.style.zIndex = frameInfo.layer;

    const { stageWidth, stageHeight } = Scratch.vm.runtime;
    const effectiveWidth = Math.max(width, 1);
    const effectiveHeight = Math.max(height, 1);

    if (resizeBehavior === "scale") {
      iframe.style.width = `${effectiveWidth}px`;
      iframe.style.height = `${effectiveHeight}px`;

      iframe.style.transform = `translate(${-effectiveWidth / 2 + x}px, ${-effectiveHeight / 2 - y}px)`;
      iframe.style.top = "0";
      iframe.style.left = "0";
    } else {
      const widthPercent = Math.min(Math.max((effectiveWidth / stageWidth) * 100, 0), 100);
      const heightPercent = Math.min(Math.max((effectiveHeight / stageHeight) * 100, 0), 100);
      
      iframe.style.width = `${widthPercent}%`;
      iframe.style.height = `${heightPercent}%`;
      iframe.style.transform = "";
      
      const topPercent = (0.5 - effectiveHeight / 2 / stageHeight - y / stageHeight) * 100;
      const leftPercent = (0.5 - effectiveWidth / 2 / stageWidth + x / stageWidth) * 100;
      
      iframe.style.top = `${Math.min(Math.max(topPercent, 0), 100 - heightPercent)}%`;
      iframe.style.left = `${Math.min(Math.max(leftPercent, 0), 100 - widthPercent)}%`;
    }
    
    if (frameInfo.overlay) {
      frameInfo.overlay.mode = getOverlayMode(resizeBehavior);
      Scratch.renderer._updateOverlays();
    }
  };

  let updateTimeout = null;
  const updateAllFrames = () => {
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      for (const name of iframesMap.keys()) {
        updateFrameAttributes(name);
      }
    }, 16);
  };

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:" || 
             url.protocol === "data:" || url.protocol === "file:";
    } catch (_) {
      return false;
    }
  };

  Scratch.vm.on("STAGE_SIZE_CHANGED", updateAllFrames);

  Scratch.vm.runtime.on("RUNTIME_DISPOSED", () => {
    for (const name of iframesMap.keys()) {
      closeFrame(name);
    }
    if (updateTimeout) clearTimeout(updateTimeout);
  });

  class BosIframeExtension {
    getInfo() {
      return {
        name: "BOS Iframe (真实浏览器模式 v6 - 完整版)",
        id: "bosIframeV6",
        color1: "#FF6B6B",
        color2: "#4ECDC4",
        blocks: [
          // ========== 真实浏览器体验 ==========
          {
            opcode: "bosRunHtml",
            blockType: Scratch.BlockType.COMMAND,
            text: "🚀 运行HTML代码 [HTML] 命名为 [NAME]",
            arguments: {
              HTML: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "<h1>你好 BOS</h1><button onclick='alert(\"点击了！\")'>点我</button>",
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "我的应用",
              }
            },
          },
          {
            opcode: "bosRunHtmlAdvanced",
            blockType: Scratch.BlockType.COMMAND,
            text: "⚡ 高级运行HTML [HTML] 命名 [NAME] 沙盒 [SANDBOX]",
            arguments: {
              HTML: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "<h1>高级模式</h1>",
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "高级应用",
              },
              SANDBOX: {
                type: Scratch.ArgumentType.STRING,
                menu: "sandboxMenu",
                defaultValue: "真实浏览器",
              }
            },
          },
          {
            opcode: "bosOpenUrl",
            blockType: Scratch.BlockType.COMMAND,
            text: "🌐 打开网址 [URL] 命名为 [NAME]",
            arguments: {
              URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "https://extensions.turbowarp.org/hello.html",
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页",
              }
            },
          },
          {
            opcode: "bosOpenBase64",
            blockType: Scratch.BlockType.COMMAND,
            text: "🔐 打开Base64编码 [BASE64] 命名为 [NAME]",
            arguments: {
              BASE64: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "base64,PGgxPuaIkeaYr+WQpzwvaDE+",
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Base64应用",
              }
            },
          },
          "---",
          // ========== 通信功能 ==========
          {
            opcode: "bosSendMessage",
            blockType: Scratch.BlockType.COMMAND,
            text: "向应用 [NAME] 发送消息 [MSG]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "App1",
              },
              MSG: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "你好",
              }
            },
          },
          {
            opcode: "bosBroadcastMessage",
            blockType: Scratch.BlockType.COMMAND,
            text: "广播消息 [MSG] 给所有应用",
            arguments: {
              MSG: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "收到",
              }
            },
          },
          {
            opcode: "bosHandshakeCompleted",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "应用 [NAME] 已握手？",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "App1",
              }
            },
          },
          // 消息接收事件（特定应用）
          {
            opcode: "onMessage",
            blockType: Scratch.BlockType.EVENT,
            text: "当应用 [NAME] 收到消息",
            isEdgeActivated: false,
            shouldRestartExistingThreads: true,
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "App1",
              }
            },
          },
          // 消息接收事件（任何应用）
          {
            opcode: "onAnyMessage",
            blockType: Scratch.BlockType.EVENT,
            text: "当任何应用收到消息",
            isEdgeActivated: false,
            shouldRestartExistingThreads: true,
          },
          // 全局最后消息报告器
          {
            opcode: "getLastMessageApp",
            blockType: Scratch.BlockType.REPORTER,
            text: "最后收到消息的应用",
          },
          {
            opcode: "getLastMessageContent",
            blockType: Scratch.BlockType.REPORTER,
            text: "最后收到的消息",
          },
          // 特定应用最后消息
          {
            opcode: "getLastMessage",
            blockType: Scratch.BlockType.REPORTER,
            text: "应用 [NAME] 最后收到的消息",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "App1",
              }
            },
          },
          "---",
          // ========== 进程管理 ==========
          {
            opcode: "bosGetPid",
            blockType: Scratch.BlockType.REPORTER,
            text: "获取应用 [NAME] 的PID",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "App1",
              }
            },
          },
          {
            opcode: "bosTerminate",
            blockType: Scratch.BlockType.COMMAND,
            text: "终止应用 [NAME]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "App1",
              }
            },
          },
          {
            opcode: "bosGetAllApps",
            blockType: Scratch.BlockType.REPORTER,
            text: "获取所有运行中的应用",
          },
          // 新增：带最后消息的进程列表
          {
            opcode: "bosGetAllAppsWithLastMessage",
            blockType: Scratch.BlockType.REPORTER,
            text: "获取所有应用及最后消息",
          },
          "---",
          // ========== 控制功能 ==========
          {
            opcode: "setPosition",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置 [NAME] 位置 x:[X] y:[Y]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "App1",
              },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: "0" },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: "0" },
            },
          },
          {
            opcode: "setSize",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置 [NAME] 尺寸 宽:[W] 高:[H]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "App1",
              },
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: "480" },
              H: { type: Scratch.ArgumentType.NUMBER, defaultValue: "360" },
            },
          },
          {
            opcode: "setSandbox",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置 [NAME] 沙盒模式为 [MODE]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "App1",
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: "sandboxMenu",
              }
            },
          },
        ],
        menus: {
          sandboxMenu: {
            acceptReporters: true,
            items: ["真实浏览器", "安全模式", "严格模式"]
          }
        }
      };
    }

    // ========== 核心方法 ==========
    bosRunHtml(args, util) {
      const html = Scratch.Cast.toString(args.HTML);
      const name = Scratch.Cast.toString(args.NAME);
      
      // 最简单的 data URL，不加任何模板和过滤
      const url = `data:text/html,${encodeURIComponent(html)}`;
      
      createFrame(url, name, { 
        autoHandshake: true, 
        sandbox: "真实浏览器",
        mimeType: 'text/html',
        util: util,
      });
    }

    bosRunHtmlAdvanced(args, util) {
      const html = Scratch.Cast.toString(args.HTML);
      const name = Scratch.Cast.toString(args.NAME);
      const sandbox = Scratch.Cast.toString(args.SANDBOX) || "真实浏览器";
      
      const url = `data:text/html,${encodeURIComponent(html)}`;
      createFrame(url, name, { 
        autoHandshake: true, 
        sandbox: sandbox,
        mimeType: 'text/html',
        util: util,
      });
    }

    bosOpenUrl(args, util) {
      const url = Scratch.Cast.toString(args.URL);
      const name = Scratch.Cast.toString(args.NAME);
      
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        console.error('只支持 http/https 网址');
        return;
      }
      
      createFrame(url, name, { 
        autoHandshake: true, 
        sandbox: "真实浏览器",
        util: util,
      });
    }

    bosOpenBase64(args, util) {
      const base64 = Scratch.Cast.toString(args.BASE64);
      const name = Scratch.Cast.toString(args.NAME);
      
      const processedUrl = processUrlInput(base64);
      if (!processedUrl) {
        console.error('无效的Base64');
        return;
      }
      
      createFrame(processedUrl, name, { 
        autoHandshake: true, 
        sandbox: "真实浏览器",
        util: util,
      });
    }

    bosSendMessage(args) {
      const name = Scratch.Cast.toString(args.NAME);
      const msg = Scratch.Cast.toString(args.MSG);
      return sendMessageToIframe(name, msg);
    }

    bosBroadcastMessage(args) {
      const msg = Scratch.Cast.toString(args.MSG);
      let count = 0;
      for (const name of iframesMap.keys()) {
        if (sendMessageToIframe(name, msg)) count++;
      }
      return count;
    }

    bosHandshakeCompleted(args) {
      const name = Scratch.Cast.toString(args.NAME);
      return iframesMap.has(name) ? iframesMap.get(name).handshakeCompleted : false;
    }

    // 事件块（特定应用）
    onMessage(args, util) {
      // 事件块，无需实现
    }

    // 事件块（任何应用）
    onAnyMessage(args, util) {
      // 事件块，无需实现
    }

    // 最后收到消息的应用
    getLastMessageApp() {
      return lastMessageApp || "";
    }

    // 最后收到的消息内容
    getLastMessageContent() {
      return lastMessageContent !== null && lastMessageContent !== undefined ? String(lastMessageContent) : "";
    }

    // 特定应用最后消息
    getLastMessage(args) {
      const name = Scratch.Cast.toString(args.NAME);
      const frameInfo = iframesMap.get(name);
      return frameInfo && frameInfo.lastMessage !== null ? String(frameInfo.lastMessage) : "";
    }

    bosGetPid(args) {
      const name = Scratch.Cast.toString(args.NAME);
      return iframesMap.has(name) ? iframesMap.get(name).pid : "";
    }

    bosTerminate(args) {
      const name = Scratch.Cast.toString(args.NAME);
      closeFrame(name);
    }

    bosGetAllApps() {
      const apps = [];
      for (const [name, info] of iframesMap.entries()) {
        apps.push(`${name} (${info.pid})`);
      }
      return apps.join(", ");
    }

    // 新增：获取所有应用及最后消息
    bosGetAllAppsWithLastMessage() {
      const apps = [];
      for (const [name, info] of iframesMap.entries()) {
        const lastMsg = info.lastMessage !== null ? String(info.lastMessage) : "(无消息)";
        apps.push(`${name} (${info.pid}) : ${lastMsg}`);
      }
      return apps.join("； ");
    }

    setPosition(args) {
      const name = Scratch.Cast.toString(args.NAME);
      if (iframesMap.has(name)) {
        const frameInfo = iframesMap.get(name);
        frameInfo.x = Scratch.Cast.toNumber(args.X);
        frameInfo.y = Scratch.Cast.toNumber(args.Y);
        updateFrameAttributes(name);
      }
    }

    setSize(args) {
      const name = Scratch.Cast.toString(args.NAME);
      if (iframesMap.has(name)) {
        const frameInfo = iframesMap.get(name);
        frameInfo.width = Math.max(Scratch.Cast.toNumber(args.W), 1);
        frameInfo.height = Math.max(Scratch.Cast.toNumber(args.H), 1);
        updateFrameAttributes(name);
      }
    }

    setSandbox(args) {
      const name = Scratch.Cast.toString(args.NAME);
      const mode = Scratch.Cast.toString(args.MODE);
      
      if (iframesMap.has(name) && SANDBOX_PRESETS[mode]) {
        const frameInfo = iframesMap.get(name);
        const sandboxValue = SANDBOX_PRESETS[mode].join(" ");
        frameInfo.iframe.setAttribute("sandbox", sandboxValue);
        frameInfo.sandbox = mode;
        console.log(`BOS: ${name} 沙盒模式改为 ${mode}`);
      }
    }
  }

  Scratch.extensions.register(new BosIframeExtension());
})(Scratch);