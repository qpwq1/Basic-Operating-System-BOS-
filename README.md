BOS UP — Unusual Perfect Kernel

BOS UP 是一个运行在 TurboWarp 上的**操作系统内核原型**，具备完整的内存管理、进程管理、文件系统、系统调用和脚本语言（BM），并设计了一套简单但可扩展的消息协议（SCIO）。

当前代码（积木）约1400（内核）

内核特性（.UP1.0）

| 模块 | 状态 | 说明 |
|------|------|------|
| **MEM** | ✅ 稳定 | 字寻址（16位）、动态分配/释放、句柄式内存管理 |
| **PM**  | ✅ 稳定 | 进程启动/删除、SID/PID 标识、SEND 通信 |
| **FS**  | ✅ 稳定 | 簇式虚拟文件系统（Base64 + 十六进制存储）|
| **SYS** | ✅ 稳定 | 系统调用（INFO、BIN、SHUTDOWN 等）|
| **CPU** | ✅ 稳定 | ADD/SUB、AND/OR/NOT、进制转换（CONVERT）|
| **GPU** | ⚠️ 基础 | 双色显存操作（240×180），独立寻址 |
| **BM**  | ✅ 较稳定 | BOS 原生脚本语言，支持系统调用等，未来加入JUMP，嵌套指令，注释等，并支持直接运行.bm |
| **SCIO**| ✅ 稳定 | 简单输入输出协议，消息路由与解释器接入 |

---

设计哲学

- **微内核/混合内核风格**：内核只做核心事（内存、进程、文件、系统调用），UI 和应用交给发行版（虽然BOS UP是宏内核）。
- **命名空间**：BM::MEM、BM::PM……未来可扩展第三方命名空间（如 JS::...(?)）。
- **脚本驱动**：系统调用和自动化优先通过 BM 脚本完成，而非硬编码积木。
- **异步消息**：SCIO 作为唯一内核入口，负责路由和解释器调度。

---

运行环境

- TurboWarp Desktop或[TurboWarp 网页版](https://turbowarp.org)
- 加载.sb3或.sprite3文件即可运行

基础BM 示例
// 内存分配与写入
BM::MEM(NEW buf = SIZE(10));
BM::MEM(WRITE buf:0x0 = FF);
// 系统而外库
BM::SYS(INFO);
// 进程通信
BM::PM(START game.html -mygame -1);
BM::PM(SEND "hello" -mygame);
// 进制转换
BM::CPU(CONVERT 16, 10, FF);

以下是我写的一些文章：
[早期SCIO 协议设想](https://www.bilibili.com/opus/1164306032705404933)
[比较正式的SCIO 协议设想](https://www.bilibili.com/opus/1187999017941860372)
