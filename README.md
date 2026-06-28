# BOS — 运行在TurboWarp的模拟操作系统内核
*此版本为BOS的主要分支TurboBOS*


# TurboBOS是什么？
TurboBOS 是一个运行在 TurboWarp 上的 **操作系统内核** ，具备完整的内存管理、进程管理、文件系统、系统调用和脚本语言（BM），并设计了一套简单但可扩展的消息协议（SCIO），属于BTA体系中的重要组成部分之一。
请注意：BOS 是一个运行在 TurboWarp / Scratch 运行时环境上的操作系统 **内核模拟 / 教学演示项目**，并不是一个可以引导裸机（x86 / RISC-V 等）的**真实操作系统内核**。


设计哲学

- **宏内核**：内核只提供服务，UI/应用由发行版或二级库实现。
- *系统调用入口SYSCALL指令 (BM) + SCIO 协议 (外部通信)。*

---

# 目录
```
TurboBOS-kernel/
├── kernel/          # 内核积木（JSON 导出）
├── Expand/          # iframe以及SCIO的子系统实现
├── docs/            # 文档
├── README.md        # 本文件
├── README-EN.md     # 英文版README.MD
├── LICENSE          # GPL 3.0许可证
└── index.html       # BOS官网HTML界面
```

# 运行环境
    https://turbowarp.org
*点击右下角添加角色一栏把BOS的.sprite3文件加载到项目中即可查看源码，或下载BOS内核SB3版*

## SCIO参考：
    [早期SCIO 协议设想](https://www.bilibili.com/opus/1164306032705404933)
    [比较正式的SCIO 协议设想](https://www.bilibili.com/opus/1187999017941860372)
## 注：本项目的SCIO运行环境基于 TURBOWARP 的 iframe 扩展二次深度定制开发,原项目仓库链接
    https://github.com/TurboWarp/extensions
*原作者：TurboWarp,改编维护：qpwq1(XaoDingx)*

## 文档参考：
*TurboBOS文档位于`/doc`路径内，有中文版和英文版两种版本可自由阅读*

# 关于语言统计
GitHub 自动将本仓库标记为 HTML 与 JavaScript，是因为只识别到了扩展部分的 JS 文件(.js)。BOS 的实际内核逻辑主要存在于 **.sb3/.sprite** 文件中（Scratch / TurboWarp 项目格式）,其底层是 TurboWarp 虚拟机和积木块逻辑，而非纯 JS 内核。


# 未来愿景
1. 做一个更好的README.MD
2. 继续进行字节码改革
3. 使用BM脚本制作一个命令行界面（BOS shell,Bsh）并使用MIT开源
4. 制作BMC编译器，摆脱手写字节码的困境
5. 创建一个仓库，让BM脚本开发者能够自由上传自己的软件到该软件仓库中
