BOS UP — Unusual Perfect Kernel

BOS UP is an operating system kernel prototype running on TurboWarp. It features complete memory management, process management, a file system, system calls, and a scripting language (BM), along with a simple yet extensible messaging protocol (SCIO).

Current code (blocks): approx. 1,400 (kernel)

Kernel Features (.UP1.0)

Module | Status | Description
MEM | ✅ Stable | Word-addressed (16-bit), dynamic allocation/free, handle-based memory management
PM | ✅ Stable | Process start/termination, SID/PID identifiers, SEND communication
FS | ✅ Stable | Cluster-based virtual file system (Base64 + hexadecimal storage)
SYS | ✅ Stable | System calls (INFO, BIN, SHUTDOWN, etc.)
CPU | ✅ Stable | ADD/SUB, AND/OR/NOT, base conversion (CONVERT)
GPU | ⚠️ Basic | Dual-color framebuffer operations (240×180), independent addressing
BM | ✅ Fairly stable | Native BOS scripting language with system call support; future additions include JUMP, nested instructions, comments, and direct execution of .bm files
SCIO | ✅ Stable | Simple I/O protocol, message routing, and interpreter integration

Design Philosophy

Microkernel / hybrid kernel style: The kernel only handles core tasks (memory, processes, files, system calls). UI and applications are left to distributions.

Namespaces: BM::MEM, BM::PM, ... with future support for third-party namespaces (e.g., JS::...(?)).

Script-driven: System calls and automation are primarily done via BM scripts rather than hard-coded blocks.

Asynchronous messages: SCIO serves as the sole kernel entry point, responsible for routing and interpreter scheduling.

Runtime Environment

TurboWarp Desktop or TurboWarp Web (https://turbowarp.org)

Load the .sb3 or .sprite3 file to run.

Basic BM Examples

// Memory allocation and write
BM::MEM(NEW buf = SIZE(10));
BM::MEM(WRITE buf:0x0 = FF);

// Additional system library
BM::SYS(INFO);

// Process communication
BM::PM(START game.html -mygame -1);
BM::PM(SEND "hello" -mygame);

// Base conversion
BM::CPU(CONVERT 16, 10, FF);

Articles I've written:

Early SCIO protocol concept (https://www.bilibili.com/opus/1164306032705404933)

More formal SCIO protocol concept (https://www.bilibili.com/opus/1187999017941860372)
//翻译器翻译的就是这样了，我是中国人
