# TurboBOS

**TurboBOS** 是一个运行在 TurboWarp 上的操作系统内核模拟项目，包含内存管理、进程调度、文件系统、系统调用和自研脚本语言（BM）。它是 **BTA 体系**（BOS Software Technology Aggregate）的核心组成部分之一。

> 本项目是一个**教学与演示性质**的操作系统内核模拟，并非可直接引导裸机的真实操作系统。

---

## 它能运行软件吗？

可以，但还在完善中。

我们已经设计了 BVM 的指令集架构（ISA），并实现了部分指令。目前项目处于**半成品状态**，后续会继续开发编译器（BMC）和调度器（CFS）。

---

## 如何下载和运行？

### 目录结构
```
TurboBOS-kernel/
├── kernel/ # 内核积木（JSON 导出）
├── Expand/ # iframe 及 SCIO 子系统实现
├── docs/ # 文档（中英文）
├── README.md # 本文件
├── README-EN.md # 英文版 README
└── LICENSE # GPL-3.0 许可证
```

### 下载

请从 [Releases](https://github.com/BTA-System/TurboBOS-kernel/releases) 页面下载最新版本，**避免下载旧版或不稳定版本**。

### 运行方式

1. 访问 [TurboWarp](https://turbowarp.org)
2. 点击左上角工具栏中的「从电脑中打开」，选择下载的 `.sb3` 文件
3. 如果下载的是 `.sprite3` 格式，请先点击「转到源代码」，再在右下角上传

---

## 与其他 ScratchOS 的区别

TurboBOS 和其他 ScratchOS **没有优劣之分**，只是方向不同：

| 方向 | TurboBOS | 其他 ScratchOS |
|------|----------|----------------|
| 核心目标 | 模拟操作系统内核行为 | 构建图形界面和交互体验 |
| 难度来源 | 内存管理、指令集、调度 | UI 设计、动画、事件处理 |
| 侧重点 | 教学与内核实现 | 视觉与用户体验 |

两者都是 Scratch/TurboWarp 生态中的工程探索。

---

## 为什么不能直接“开箱即用”？

TurboBOS 是一个**内核**，本身不包含桌面环境、命令行工具或应用程序。这些将由 BTA 体系中的其他组件提供，例如：

- **Bsh**：命令行界面
- **BMC**：BM 语言编译器
- **BOSP**：官方发行版（BOS Open Source Project）

我们会在内核接近完工时开始开发这些组件。

---

## 设计哲学

### 万物皆我做

尽量少用扩展。只有万不得已时，才会借助外部能力。

### 万物皆解耦

模块分层明确，每个模块只解决一个实际问题。例如：

- BVM 的指令解释器、取指循环和 CFS 调度器相互独立
- 每个模块只做一件事

> 注：BOS 与 BVM 之间存在较大耦合，目前难以完全分离。这是当前架构的现实情况。

---

## 许可证

本项目使用 **GPL-3.0** 许可证，详见 `LICENSE`

---

## 相关链接

- [BTA 技术体系](https://github.com/BTA-System)
- [BOS 官网](https://bta-system.github.io/TurboBOS-kernel/)
- [BOS GitHub 仓库](https://github.com/BTA-System/TurboBOS-kernel)
