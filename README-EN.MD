# BOS — Simulated Operating System Kernel Running on TurboWarp (New Version Kernel)

<p align="center">
  <img src="bos-logo.svg" width="120">
</p>

# What is BOS?
BOS is an **operating system kernel** running on TurboWarp, featuring complete memory management, process management, a file system, system calls, and a scripting language (BM). It also implements a simple yet extensible messaging protocol (SCIO).  
Please note: BOS is an **operating system kernel simulation / teaching demonstration project** running on the TurboWarp / Scratch runtime environment. It is **not a real operating system kernel** capable of booting on bare metal (x86 / RISC-V, etc.).

## Design Philosophy

- **Monolithic Kernel**: The kernel only provides services; UI/applications are implemented by distributions or secondary libraries.
- **System Call Entry — SYSCALL Instruction (BM) + SCIO Protocol (external communication).**

---

# Runtime Environment
    https://turbowarp.org
*Load the .sb3 or .sprite3 file to run it.*

## SCIO Reference:
    [Early SCIO Protocol Concept](https://www.bilibili.com/opus/1164306032705404933)
    [More Formal SCIO Protocol Concept](https://www.bilibili.com/opus/1187999017941860372)

## Note: The SCIO runtime environment of this project is based on secondary deep customization of TurboWarp's iframe extension. Original project repository link:
    https://github.com/TurboWarp/extensions
*Original author: TurboWarp. Adaptation and maintenance: qpwq1 (XaoDingx)*

## Documentation Reference:
*BOS documentation is located in the `/doc` directory, available in both Chinese and English for free reading.*

# License

Different components of this project are licensed under different licenses:

- **BOS Kernel**: GPL-3.0 (`/BOS Kernel and others`)
- **Extensions**: MIT (The iframe extension is based on modifications to [TurboWarp Extensions](https://github.com/TurboWarp/extensions)) (`/extensions`)

Before using any component, please review the LICENSE file in the corresponding directory.

# About Language Statistics
GitHub automatically marks this repository as 100% JavaScript because it only recognizes the JS files (.js) in the extensions part. The actual kernel logic of BOS mainly resides in the `*.sb3/*.sprite` files (Scratch / TurboWarp project format), which are fundamentally based on the TurboWarp virtual machine and block logic, not a pure JavaScript kernel.
