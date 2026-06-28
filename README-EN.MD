# BOS — An Operating System Kernel Running on TurboWarp
*This version is TurboBOS, the main branch of BOS.*


# What is TurboBOS?
TurboBOS is an **operating system kernel** running on TurboWarp, featuring complete memory management, process management, a file system, system calls, and a scripting language (BM), along with a simple yet extensible messaging protocol (SCIO).

Please note: BOS is a **kernel simulation / educational demonstration project** running on the TurboWarp / Scratch runtime environment. It is **not** a real operating system kernel capable of booting on bare metal (x86 / RISC-V, etc.).


Design Philosophy

- **Monolithic Kernel**: The kernel provides services only; UI/applications are implemented by distributions or secondary libraries.
- *System call entry via SYSCALL instruction (BM) + SCIO protocol (external communication).*

---

# Runtime Environment
    https://turbowarp.org
*Click the "Add Sprite" button in the bottom-right corner and load BOS's .sprite3 file into the project to view the source code, or download the SB3 version of the BOS kernel.*

## SCIO References:
    [Early SCIO Protocol Concept](https://www.bilibili.com/opus/1164306032705404933)
    [More Formal SCIO Protocol Concept](https://www.bilibili.com/opus/1187999017941860372)
## Note: The SCIO runtime environment in this project is based on a deeply customized secondary development of TurboWarp's iframe extension. Original project repository link:
    https://github.com/TurboWarp/extensions
*Original author: TurboWarp. Adapted and maintained by: qpwq1 (XaoDingx)*

## Documentation Reference:
*TurboBOS documentation is located in the `/doc` directory, available in both Chinese and English for your convenience.*

# About Language Statistics
GitHub automatically labels this repository as HTML and JavaScript because it only detects the JS files (.js) in the extension portion. The actual kernel logic of BOS primarily resides in **.sb3/.sprite** files (Scratch / TurboWarp project formats), which are built on the TurboWarp virtual machine and block logic, rather than being a pure JS kernel.


# Future Vision
1. Create a better README.md
2. Continue bytecode reform efforts
3. Build a command-line interface (BOS shell, Bsh) using BM scripts and release it under MIT open-source license
4. Develop a BMC compiler to eliminate the need for handwritten bytecode
5. Create a repository where BM script developers can freely upload their own software

*BOS Main Repository Link: https://github.com/qpwq1/Basic-Operating-System-BOS-*
