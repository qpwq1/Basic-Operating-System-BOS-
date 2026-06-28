# BOS — An Operating System Kernel Running on TurboWarp

> Current mainline version: **TurboBOS**

---

## What is TurboBOS?

TurboBOS is an **operating system kernel** that runs on **TurboWarp**, featuring complete memory management, process scheduling, file systems, system calls, and a self-developed scripting language (BM), along with a simple yet extensible communication protocol (SCIO) designed from the ground up.

It is one of the core components of the **BTA technology ecosystem** (BOS Software Technology Aggregate).

> **Please note**: BOS is a **kernel simulation / educational demonstration project** running on the TurboWarp / Scratch runtime environment. It is **not** a real operating system kernel capable of booting on bare metal (x86 / RISC-V, etc.).

---

## Design Philosophy

- **Monolithic kernel**: The kernel provides only core services; UI and applications are implemented by distributions or secondary libraries.
- **System call interface**: BM programs use the `SYSCALL` instruction, while external communication uses the SCIO protocol.

---

## Directory Structure
```
TurboBOS-kernel/
├── kernel/ # Kernel blocks (JSON export)
├── Expand/ # iframe and SCIO subsystem implementation
├── docs/ # Documentation (Chinese and English)
├── README.md # This file
├── README-EN.md # English README
├── LICENSE # License
```


---

## Runtime Environment

- Run online: [TurboWarp](https://turbowarp.org)
- Usage: Click the "Choose a Sprite" button in the bottom-right corner, load the BOS `.sprite3` file into the project, and you can view the source code.

---

## SCIO Protocol

SCIO is the protocol used by BOS to communicate with external environments (such as iframes), developed with deep customization based on TurboWarp's iframe extension.

**Note**: The SCIO runtime environment in this project is built upon a deeply customized version of TurboWarp's iframe extension. For details, see `./Expand/README.MD`.

---

## Documentation Reference

The complete documentation for TurboBOS is located in the `/docs` directory, available in both Chinese and English for free reading.

---

## About Language Statistics

GitHub automatically marks this repository as **HTML and JavaScript** because it only recognizes the `.js` files in the extension portion.

The actual kernel logic of BOS primarily resides in **`.sb3` / `.sprite3`** files (Scratch / TurboWarp project formats), whose underlying implementation is based on the TurboWarp virtual machine and block logic, rather than a pure JavaScript kernel.

---

## Future Vision

1. Optimize README and project documentation
2. Continuously advance bytecode reform
3. Develop a command-line interface (BOS Shell, abbreviated as **Bsh**) using BM scripts and open-source it under the MIT license
4. Develop the **BMC compiler** to eliminate the need for handwritten bytecode
5. Create a third-party application repository, allowing BM script developers to freely upload their own works

---

## License

This project is licensed under the **GPL-3.0** License.

---

## Related Links

- [BTA Technology Ecosystem](https://github.com/BTA-System)
- [BOS Official Website](https://bta-system.github.io/TurboBOS-kernel)
- [BOS GitHub Repository](https://github.com/BTA-System/TurboBOS-kernel)
