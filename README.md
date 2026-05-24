## BOS — 操作系统内核 (New Version Kernel)
# BOS是什么？
BOS 是一个运行在 TurboWarp 上的**操作系统内核**，具备完整的内存管理、进程管理、文件系统、系统调用和脚本语言（BM），并设计了一套简单但可扩展的消息协议（SCIO）。


设计哲学

- **宏内核**：内核只提供服务，UI/应用由发行版或二级库实现。
- *系统调用入口SYSCALL指令 (BM) + SCIO 协议 (外部通信)。*

---

运行环境

- TurboWarp Desktop或[TurboWarp 网页版](https://turbowarp.org)
- 加载.sb3或.sprite3文件即可运行

参考：
[早期SCIO 协议设想](https://www.bilibili.com/opus/1164306032705404933)
[比较正式的SCIO 协议设想](https://www.bilibili.com/opus/1187999017941860372)
## 注：本项目的SCIO运行环境基于 TURBOWARP 的 iframe 扩展二次深度定制开发
    原项目地址：https://github.com/TurboWarp/extensions
    原作者：TurboWarp
    改编维护：qpwq1(XaoDingx)

# 许可证

本项目不同组件采用不同许可证：

- **BOS 内核** (`/BOS Kernel与其他`)：GPL-3.0
- **扩展** (`/extensions`)：MIT (其中的iframe扩展基于 [TurboWarp 扩展](https://github.com/TurboWarp/extensions) 修改)

请在使用各组件前，查看对应目录下的 LICENSE 文件。
