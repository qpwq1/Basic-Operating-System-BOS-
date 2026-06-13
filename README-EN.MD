# BOS — A Simulated Operating System Kernel Running on TurboWarp (New Version Kernel)
*This version is TurboBOS, the main branch of BOS*
<div align="center">
  <img src="bos-logo.svg" width="200" alt="Description text" />
</div>

# What is TurboBOS?
TurboBOS is an **operating system kernel** running on TurboWarp, featuring complete memory management, process management, a file system, system calls, and a scripting language (BM), along with a simple yet extensible messaging protocol (SCIO).  
Please note: BOS is a **kernel simulation / teaching demonstration project** that runs on the TurboWarp / Scratch runtime environment. It is **not** a real operating system kernel capable of booting on bare metal (x86 / RISC-V, etc.).

Design Philosophy

- **Monolithic Kernel**: The kernel only provides services; UI/applications are implemented by distributions or secondary libraries.
- *System call entry via SYSCALL instruction (BM) + SCIO protocol (external communication).*

---

# Runtime Environment
    https://turbowarp.org
*Click the "Add Sprite" button in the bottom-right corner, load the BOS .sprite3 file into the project to view the source code, or download the BOS kernel SB3 version.*

## SCIO Reference:
    [Early SCIO Protocol Concept](https://www.bilibili.com/opus/1164306032705404933)
    [More Formal SCIO Protocol Concept](https://www.bilibili.com/opus/1187999017941860372)
## Note: The SCIO runtime environment of this project is based on secondary in-depth customization of TurboWarp's iframe extension. Original project repository link:
    https://github.com/TurboWarp/extensions
*Original author: TurboWarp. Adapted and maintained by: qpwq1 (XaoDingx)*

## Documentation Reference:
*TurboBOS documentation is located in the `/doc` directory, available in both Chinese and English for free reading.*

# License

Different components of this project use different licenses:

- **TurboBOS Kernel**: GPL-3.0 (`/BOS Kernel and others`)
- **Extensions**: MIT (the iframe extension is based on modifications to [TurboWarp Extensions](https://github.com/TurboWarp/extensions)) (`/extensions`)

Before using any component, please check the LICENSE file in the corresponding directory.

# About Language Statistics
GitHub automatically marks this repository as HTML and JavaScript because it only recognizes the JS files (.js) in the extensions section. The actual kernel logic of BOS primarily exists in **.sb3/.sprite** files (Scratch / TurboWarp project format), which are based on the TurboWarp virtual machine and block logic, not a pure JS kernel.

# Future Vision
1. Create a better README.MD
2. Continue bytecode reform
3. Build a command-line interface (BOS shell, Bsh) using BM scripts and release it under the MIT open-source license
4. Develop a BMC compiler to overcome the difficulty of handwriting bytecode
5. Create a repository where BM script developers can freely upload their own software to that repository
