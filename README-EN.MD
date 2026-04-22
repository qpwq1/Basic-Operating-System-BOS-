# BOS UP — New Version Kernel

BOS UP is an **operating system kernel** running on TurboWarp, featuring complete memory management, process management, file system, system calls, and a scripting language (BM), along with a simple yet extensible messaging protocol (SCIO).

Current code (blocks) count: ~1400 (kernel)

## Kernel Features (UP1.0)

| Module  | Status       | Description                                                                 |
|---------|--------------|-----------------------------------------------------------------------------|
| **MEM** | ✅ Stable    | Word-addressed (16‑bit), dynamic allocation/free, handle‑based memory management |
| **PM**  | ✅ Stable    | Process start/delete, SID/PID identifiers, SEND communication               |
| **FS**  | ✅ Stable    | Cluster‑based virtual file system (Base64 + hexadecimal storage)            |
| **SYS** | ✅ Stable    | System calls (INFO, BIN, SHUTDOWN, etc.)                                   |
| **CPU** | ✅ Stable    | ADD/SUB, AND/OR/NOT, base conversion (CONVERT)                              |
| **GPU** | ⚠️ Basic     | Dual‑colour framebuffer (240×180), independent addressing                   |
| **BM**  | ✅ Fairly stable | Native BOS scripting language, supports system calls. Future additions: JUMP, nested instructions, comments, direct execution of `.bm` files |
| **SCIO**| ✅ Stable    | Simple I/O protocol, message routing, interpreter dispatch                  |

---

## Design Philosophy

- **Microkernel / Hybrid kernel style**: the kernel handles only core tasks (memory, processes, files, system calls); UI and applications are left to distributions (although BOS UP is a monolithic kernel).
- **Namespaces**: `BM::MEM`, `BM::PM`, … third‑party namespaces (e.g., `JS::…`) can be added later.
- **Script‑driven**: system calls and automation are primarily done through BM scripts, not hard‑coded blocks.
- **Asynchronous messaging**: SCIO is the single kernel entry point, responsible for routing and interpreter dispatch.

---

## Runtime Environment

- TurboWarp Desktop or [TurboWarp web version](https://turbowarp.org)
- Load the `.sb3` or `.sprite3` file to run.

---

## Basic BM Examples

```bm
// Memory allocation and writing
BM::MEM(NEW buf = SIZE(10));
BM::MEM(WRITE buf:0x0 = FF);

// System library call
BM::SYS(INFO);

// Process communication
BM::PM(START game.html -mygame -1);
BM::PM(SEND "hello" -mygame);

// Base conversion
BM::CPU(CONVERT 16, 10, FF);
