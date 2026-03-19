Basic Operating System (BOS) – A simple operating system kernel prototype running on TurboWarp

🧩 Current Status

File System: List-based virtual file system (works, but has bugs being fixed)

Memory Management: Indexed memory access

Process Management: Prototype

Independently developed by a 12-year-old, the current code consists of about 2000 Scratch blocks (though the number may have changed by the time you read this).

💻 System Features

Appears as a 16-bit system (16-bit memory addressing)

Memory: 64 KB (one 16-bit memory module)

CPU: Built-in system CPU (simulated by TurboWarp)

Hard Disk: Approximately 1 MB (approaching TurboWarp list limits, may not reach this size)

⚠️ Configuration for reference only, please refer to actual operation.

📌 Detailed Introduction
BOS is an operating system built with Scratch blocks, running in TurboWarp.
It was created to understand "how an operating system actually works" – hence this buggy but functional toy kernel.

Currently you can:

Read and write files (though paths may occasionally be missing)

Allocate and free memory (but be careful not to exceed limits)

Experience the retro feel of a 16-bit system

If you're curious about operating system internals or want to see what a 12-year-old can create, feel free to take a look.
Of course, the code contains many pitfalls, but each one was personally created by me, and I'm personally fixing them.

🔧 Next Steps

Continue exploring process management

📦 Running Environment

TurboWarp Desktop or TurboWarp online (turbowarp.org)

Load the project file to run

📜 License
This project is licensed under GPL 3.0
For details, see the LICENSE file.

👤 About the Author
12 years old, enjoys tinkering with code, from Scratch games to C++ to writing a simulated operating system.
BOS is my main toy in 2026.
Planning to rewrite BOS in C++
SCIO protocol concept

//翻译器翻译的真差
