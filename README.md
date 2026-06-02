# BOS — 运行在TurboWarp的模拟操作系统内核 (New Version Kernel)
<p align="center">
  <img src="bos-logo.svg" width="120">
</p>

# BOS是什么？
BOS 是一个运行在 TurboWarp 上的 **操作系统内核** ，具备完整的内存管理、进程管理、文件系统、系统调用和脚本语言（BM），并设计了一套简单但可扩展的消息协议（SCIO）。
请注意：BOS 是一个运行在 TurboWarp / Scratch 运行时环境上的操作系统 **内核模拟 / 教学演示项目**，并不是一个可以引导裸机（x86 / RISC-V 等）的**真实操作系统内核**。


设计哲学

- **宏内核**：内核只提供服务，UI/应用由发行版或二级库实现。
- *系统调用入口SYSCALL指令 (BM) + SCIO 协议 (外部通信)。*

---

# 运行环境
    https://turbowarp.org
*加载.sb3或.sprite3文件即可运行*

## SCIO参考：
    [早期SCIO 协议设想](https://www.bilibili.com/opus/1164306032705404933)
    [比较正式的SCIO 协议设想](https://www.bilibili.com/opus/1187999017941860372)
## 注：本项目的SCIO运行环境基于 TURBOWARP 的 iframe 扩展二次深度定制开发,原项目仓库链接
    https://github.com/TurboWarp/extensions
*原作者：TurboWarp,改编维护：qpwq1(XaoDingx)*

## 文档参考：
*BOS文档位于`/doc`路径内，有中文版和英文版两种版本可自由阅读*

# 许可证

本项目不同组件采用不同许可证：

- **BOS 内核** ：GPL-3.0(`/BOS Kernel与其他`)
- **扩展** ：MIT (其中的iframe扩展基于 [TurboWarp 扩展](https://github.com/TurboWarp/extensions) 修改)(`/extensions`)

请在使用各组件前，查看对应目录下的 LICENSE 文件。

# 关于语言统计
GitHub 自动将本仓库标记为 100% JavaScript，是因为只识别到了扩展部分的 JS 文件(.js)。BOS 的实际内核逻辑主要存在于 *.sb3/.sprite* 文件中（Scratch / TurboWarp 项目格式）,其底层是 TurboWarp 虚拟机和积木块逻辑，而非纯 JS 内核。
