# BOS — 运行在 TurboWarp 上的操作系统内核

> 当前主线版本：**TurboBOS**

---

## TurboBOS 是什么？

TurboBOS 是一个运行在 **TurboWarp** 上的**操作系统内核**，具备完整的内存管理、进程调度、文件系统、系统调用和自研脚本语言（BM），并设计了一套简单但可扩展的通信协议（SCIO）。

它是 **BTA 技术体系**（BOS Software Technology Aggregate）的核心组成部分之一。

> **请注意**：BOS 是一个运行在 TurboWarp / Scratch 运行时环境上的**内核模拟 / 教学演示项目**，并不是一个可以引导裸机（x86 / RISC-V 等）的**真实操作系统内核**。

---

## 设计哲学

- **宏内核**：内核只提供核心服务，UI 和应用由发行版或二级库实现。
- **系统调用入口**：BM 程序使用 `SYSCALL` 指令，外部通信使用 SCIO 协议。

---

## 目录结构
```
TurboBOS-kernel/
├── kernel/       # 内核积木（JSON 导出）
├── Expand/       # iframe 及 SCIO 子系统实现
├── docs/         # 文档（中英文）
├── README.md     # 本文件
├── README-EN.md  # 英文版 README
├── LICENSE       # 许可证
```

---

## 运行环境

- 在线运行：[TurboWarp](https://turbowarp.org)
- 使用方法：点击右下角「添加角色」，将 BOS 的 `.sprite3` 文件加载到项目中，即可查看源码。
- 你也可以下载 BOS 内核的 `.sb3` 版本，在 TurboWarp 中离线运行。

---

## SCIO 协议

SCIO 是 BOS 与外部环境（如 iframe）通信的协议，基于 TurboWarp 的 iframe 扩展深度定制开发。
**注**：本项目的 SCIO 运行环境基于 TurboWarp 的 iframe 扩展二次深度定制开发，具体见`./Expand/READMD.MD`。  

---

## 文档参考

TurboBOS 的完整文档位于 `/docs` 目录中，包含中文版和英文版，可自由阅读。

---

## 关于语言统计

GitHub 自动将本仓库标记为 **HTML 与 JavaScript**，是因为只识别到了扩展部分的 `.js` 文件。

BOS 的实际内核逻辑主要存在于 **`.sb3` / `.sprite3`** 文件中（Scratch / TurboWarp 项目格式），其底层是 TurboWarp 虚拟机和积木块逻辑，而非纯 JavaScript 内核。

---

## 未来愿景

1. 优化 README 和项目文档
2. 持续推进字节码改革
3. 使用 BM 脚本开发一个命令行界面（BOS Shell，简称 **Bsh**），并以 MIT 许可证开源
4. 开发 **BMC 编译器**，摆脱手写字节码的困境
5. 创建第三方应用仓库，允许 BM 脚本开发者自由上传自己的作品

---

## 许可证

本项目使用 **GPL-3.0** 许可证。

---

## 相关链接

- [BTA 技术体系](https://github.com/BTA-System)
- [BOS 官网](https://bta-system.github.io/TurboBOS-kernel/)
- [BOS GitHub 仓库](https://github.com/BTA-System/TurboBOS-kernel)
