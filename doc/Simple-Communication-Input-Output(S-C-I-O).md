SCIO 是什么？
SCIO 是 BOS 操作系统的系统调用协议，全称 Simple Communication Input/Output。

它定义了 iframe 应用如何与 BOS 内核通信——就像 Linux 的 syscall，Windows 的 API。

一句话概括
SCIO 是 BOS 的“系统调用语言”，让 HTML 应用能向内核请求内存、读写文件、管理进程。

核心设计
1. 消息格式
简单字符串：用于握手等基础通信

2. 通信方式
iframe 应用 → 内核：parent.postMessage()
内核 → 应用：window.addEventListener('message')

3. 握手协议
发起方 接收方	消息	含义
应用   内核	 "你好"	我准备好了
内核   应用	 "收到"	连接建立

支持的系统调用
类别	指令	功能
内存	null  null
mem(new bbb=0x1&0x3);	申请一块内存块句柄叫bbb,地址0x1到0x3
mem(delete <bbb>);	释放句柄为bbb的所有内存块
mem(read bbb:0x1);	读取bbb的地址0x1的内存
mem(write 0x1=0000000000000000);	在地址0x1写入0000000000000000
文件系统	null null
FS_READ("bbb.txt");	读叫做bbb.txt的文件
FS_WRITE("bbb.txt",<文件内容，一般是DATAURL>);	写bbb.txt文件为XXX
FS_LIST	列出目录
进程	PROC_START	启动应用
PROC_KILL	终止进程
PROC_LIST	列出进程
PROC_SEND	进程间通信
系统	SYS_INFO	获取系统信息
