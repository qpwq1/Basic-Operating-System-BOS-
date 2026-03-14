// IP地址工具箱 - 完全版
// 合并了plus版的丰富功能和普通版的稳定性
(function(Scratch) {
    'use strict';

    // 检查是否在TurboWarp中运行
    if (!Scratch.extensions.unsandboxed) {
        throw new Error('此扩展需要在TurboWarp的沙盒外运行模式中使用');
    }

    // 缓存系统（防止频繁请求）
    const cache = {
        data: new Map(),
        get(key, maxAge = 60000) { // 默认1分钟缓存
            const item = this.data.get(key);
            if (item && Date.now() - item.timestamp < maxAge) {
                return item.value;
            }
            this.data.delete(key);
            return null;
        },
        set(key, value) {
            this.data.set(key, {
                value: value,
                timestamp: Date.now()
            });
        }
    };

    class IPAddressToolbox {
        constructor() {
            this.ipv4 = null;
            this.ipv6 = null;
            this.lastError = null;
            this.locationCache = new Map();
        }

        getInfo() {
            return {
                id: 'iptoolbox',
                name: 'IP地址工具箱 🌐',
                color1: '#4a90e2',
                color2: '#3a80d2',
                color3: '#2a70c2',
                blocks: [
                    // ========== 基础IP获取 ==========
                    {
                        opcode: 'fetchIPs',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '📡 获取我的IP地址'
                    },
                    {
                        opcode: 'getIPv4',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '我的IPv4地址'
                    },
                    {
                        opcode: 'getIPv6',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '我的IPv6地址'
                    },
                    {
                        opcode: 'hasIPv6',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '支持IPv6？'
                    },
                    
                    // ========== 本地网络 ==========
                    {
                        opcode: 'getLocalIP',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '我的本地IP地址'
                    },
                    {
                        opcode: 'getNetworkInterfaces',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '所有网络接口'
                    },
                    
                    // ========== IP信息查询 ==========
                    {
                        opcode: 'getIPLocation',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'IP [IP] 的地理位置',
                        arguments: {
                            IP: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '8.8.8.8'
                            }
                        }
                    },
                    {
                        opcode: 'getIPISP',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'IP [IP] 的网络提供商',
                        arguments: {
                            IP: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '8.8.8.8'
                            }
                        }
                    },
                    {
                        opcode: 'getMyLocation',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '我的地理位置'
                    },
                    {
                        opcode: 'getMyISP',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '我的网络提供商'
                    },
                    
                    // ========== DNS工具 ==========
                    {
                        opcode: 'resolveDNS',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '域名 [DOMAIN] 的IP地址',
                        arguments: {
                            DOMAIN: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'google.com'
                            }
                        }
                    },
                    {
                        opcode: 'reverseDNS',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'IP [IP] 的域名',
                        arguments: {
                            IP: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '8.8.8.8'
                            }
                        }
                    },
                    
                    // ========== IP验证和转换 ==========
                    {
                        opcode: 'validateIP',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '验证IP地址 [IP]',
                        arguments: {
                            IP: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '192.168.1.1'
                            }
                        }
                    },
                    {
                        opcode: 'getIPType',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'IP [IP] 的类型',
                        arguments: {
                            IP: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '192.168.1.1'
                            }
                        }
                    },
                    {
                        opcode: 'ipToNumber',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'IP [IP] 转换为数字',
                        arguments: {
                            IP: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '192.168.1.1'
                            }
                        }
                    },
                    {
                        opcode: 'numberToIP',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '数字 [NUM] 转换为IP',
                        arguments: {
                            NUM: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 3232235777
                            }
                        }
                    },
                    
                    // ========== 实用工具 ==========
                    {
                        opcode: 'pingHost',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'ping [HOST]',
                        arguments: {
                            HOST: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '8.8.8.8'
                            }
                        }
                    },
                    {
                        opcode: 'generateRandomIP',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '随机生成IP地址'
                    },
                    {
                        opcode: 'getLastError',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '最后一次错误信息'
                    },
                    
                    // ========== 分隔线 ==========
                    {
                        opcode: 'clearCache',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '🧹 清除缓存'
                    }
                ]
            };
        }

        // ========== 核心功能 ==========
        
        // 获取公网IP（修复版）
        async fetchIPs() {
            this.ipv4 = null;
            this.ipv6 = null;
            this.lastError = null;

            try {
                // 使用多个API提高成功率
                const apis = [
                    'https://api.ipify.org?format=json',
                    'https://api64.ipify.org?format=json',
                    'https://ipapi.co/json/'
                ];

                for (const api of apis) {
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 3000);
                        
                        const response = await fetch(api, { signal: controller.signal });
                        clearTimeout(timeoutId);
                        
                        if (response.ok) {
                            const data = await response.json();
                            const ip = data.ip || data.address || data;
                            
                            if (typeof ip === 'string') {
                                if (ip.includes(':')) {
                                    this.ipv6 = ip;
                                } else if (!this.ipv4) {
                                    this.ipv4 = ip;
                                }
                            }
                        }
                    } catch (e) {
                        console.log(`API ${api} 失败:`, e);
                    }
                }

                // 如果没有获取到IPv4，尝试专用IPv4 API
                if (!this.ipv4) {
                    try {
                        const v4Res = await fetch('https://api.ipify.org?format=json');
                        if (v4Res.ok) {
                            const v4Data = await v4Res.json();
                            this.ipv4 = v4Data.ip;
                        }
                    } catch (e) {}
                }

            } catch (error) {
                this.lastError = error.message;
            }
        }

        // 获取本地IP（改进版）
        getLocalIP() {
            return new Promise((resolve) => {
                try {
                    const RTCPeerConnection = window.RTCPeerConnection || 
                                            window.mozRTCPeerConnection || 
                                            window.webkitRTCPeerConnection;
                    
                    if (!RTCPeerConnection) {
                        resolve('127.0.0.1');
                        return;
                    }

                    const pc = new RTCPeerConnection({ iceServers: [] });
                    const ips = new Set();
                    
                    pc.createDataChannel('');
                    
                    pc.createOffer()
                        .then(offer => pc.setLocalDescription(offer))
                        .catch(() => {});

                    const timeout = setTimeout(() => {
                        if (ips.size === 0) {
                            resolve('127.0.0.1');
                        } else {
                            resolve(Array.from(ips).find(ip => !ip.includes(':')) || Array.from(ips)[0]);
                        }
                        pc.close();
                    }, 1000);

                    pc.onicecandidate = (event) => {
                        if (!event || !event.candidate) {
                            clearTimeout(timeout);
                            if (ips.size > 0) {
                                const ip = Array.from(ips).find(ip => !ip.includes(':')) || Array.from(ips)[0];
                                resolve(ip);
                            } else {
                                resolve('127.0.0.1');
                            }
                            pc.close();
                            return;
                        }
                        
                        const candidate = event.candidate.candidate;
                        const regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                        const match = candidate.match(regex);
                        
                        if (match && !match[1].startsWith('127.')) {
                            ips.add(match[1]);
                        }
                    };
                } catch (e) {
                    resolve('127.0.0.1');
                }
            });
        }

        // 获取IP地理位置（带缓存）
        async getIPLocation(args) {
            const ip = args.IP || '8.8.8.8';
            
            // 检查缓存
            const cached = cache.get(`loc_${ip}`);
            if (cached) return cached;

            try {
                // 使用ipapi.co（免费，无需密钥）
                const response = await fetch(`https://ipapi.co/${ip}/json/`);
                if (!response.ok) throw new Error('请求失败');
                
                const data = await response.json();
                
                if (data.error) {
                    return '未知位置';
                }

                let location = '';
                if (data.city) location += data.city;
                if (data.region) location += (location ? ', ' : '') + data.region;
                if (data.country_name) location += (location ? ', ' : '') + data.country_name;
                
                if (!location) location = '未知位置';
                
                // 存入缓存
                cache.set(`loc_${ip}`, location);
                return location;
                
            } catch (error) {
                console.error('获取地理位置失败:', error);
                return '获取失败';
            }
        }

        // 获取我的地理位置
        async getMyLocation() {
            const cached = cache.get('my_location');
            if (cached) return cached;

            try {
                const response = await fetch('https://ipapi.co/json/');
                if (!response.ok) throw new Error('请求失败');
                
                const data = await response.json();
                
                let location = '';
                if (data.city) location += data.city;
                if (data.region) location += (location ? ', ' : '') + data.region;
                if (data.country_name) location += (location ? ', ' : '') + data.country_name;
                
                if (!location) location = '未知位置';
                
                cache.set('my_location', location);
                return location;
                
            } catch (error) {
                return '获取失败';
            }
        }

        // 获取IP的ISP信息
        async getIPISP(args) {
            const ip = args.IP || '8.8.8.8';
            
            const cached = cache.get(`isp_${ip}`);
            if (cached) return cached;

            try {
                const response = await fetch(`https://ipapi.co/${ip}/org/`);
                if (!response.ok) throw new Error('请求失败');
                
                const isp = await response.text();
                const result = isp.trim() || '未知ISP';
                
                cache.set(`isp_${ip}`, result);
                return result;
                
            } catch (error) {
                return '获取失败';
            }
        }

        // 获取我的ISP
        async getMyISP() {
            const cached = cache.get('my_isp');
            if (cached) return cached;

            try {
                const response = await fetch('https://ipapi.co/org/');
                if (!response.ok) throw new Error('请求失败');
                
                const isp = await response.text();
                const result = isp.trim() || '未知ISP';
                
                cache.set('my_isp', result);
                return result;
                
            } catch (error) {
                return '获取失败';
            }
        }

        // DNS解析
        async resolveDNS(args) {
            const domain = args.DOMAIN || 'google.com';
            
            const cached = cache.get(`dns_${domain}`);
            if (cached) return cached;

            try {
                const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}`);
                if (!response.ok) throw new Error('解析失败');
                
                const data = await response.json();
                
                if (data.Answer && data.Answer.length > 0) {
                    // 找到A记录（IPv4）
                    const aRecord = data.Answer.find(r => r.type === 1);
                    if (aRecord) {
                        cache.set(`dns_${domain}`, aRecord.data);
                        return aRecord.data;
                    }
                }
                
                return '无A记录';
                
            } catch (error) {
                return '解析失败';
            }
        }

        // 反向DNS
        async reverseDNS(args) {
            const ip = args.IP || '8.8.8.8';
            
            try {
                const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(ip)}&type=PTR`);
                if (!response.ok) throw new Error('解析失败');
                
                const data = await response.json();
                
                if (data.Answer && data.Answer.length > 0) {
                    return data.Answer[0].data;
                }
                
                return '无反向记录';
                
            } catch (error) {
                return '解析失败';
            }
        }

        // Ping工具（模拟）
        pingHost(args) {
            return new Promise((resolve) => {
                const host = args.HOST || '8.8.8.8';
                const startTime = Date.now();
                
                const img = new Image();
                img.src = `https://${host}/favicon.ico?t=${startTime}`;
                
                const timeout = setTimeout(() => {
                    resolve('超时');
                }, 3000);
                
                img.onload = () => {
                    clearTimeout(timeout);
                    const latency = Date.now() - startTime;
                    resolve(`${latency}ms`);
                };
                
                img.onerror = () => {
                    // 尝试HTTP方式
                    fetch(`https://${host}`, { mode: 'no-cors' })
                        .then(() => {
                            clearTimeout(timeout);
                            const latency = Date.now() - startTime;
                            resolve(`${latency}ms`);
                        })
                        .catch(() => {
                            clearTimeout(timeout);
                            resolve('不可达');
                        });
                };
            });
        }

        // 获取所有网络接口
        getNetworkInterfaces() {
            return new Promise((resolve) => {
                try {
                    const RTCPeerConnection = window.RTCPeerConnection || 
                                            window.mozRTCPeerConnection || 
                                            window.webkitRTCPeerConnection;
                    
                    if (!RTCPeerConnection) {
                        resolve('127.0.0.1 (本地)');
                        return;
                    }

                    const pc = new RTCPeerConnection({ iceServers: [] });
                    const interfaces = new Set();
                    
                    pc.createDataChannel('');
                    pc.createOffer().then(offer => pc.setLocalDescription(offer));

                    setTimeout(() => {
                        if (interfaces.size > 0) {
                            resolve(Array.from(interfaces).join(', '));
                        } else {
                            resolve('127.0.0.1 (本地)');
                        }
                        pc.close();
                    }, 1000);

                    pc.onicecandidate = (event) => {
                        if (event && event.candidate) {
                            const candidate = event.candidate.candidate;
                            const regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                            const match = candidate.match(regex);
                            if (match && !match[1].startsWith('127.')) {
                                interfaces.add(match[1]);
                            }
                        }
                    };
                } catch (e) {
                    resolve('127.0.0.1 (本地)');
                }
            });
        }

        // 验证IP地址
        validateIP(args) {
            const ip = args.IP || '';
            
            const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            
            const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^([0-9a-fA-F]{1,4}:){1,7}:|:([0-9a-fA-F]{1,4}:){1,7}$/;
            
            if (ipv4Regex.test(ip)) {
                return '✅ 有效的IPv4地址';
            } else if (ipv6Regex.test(ip)) {
                return '✅ 有效的IPv6地址';
            } else {
                return '❌ 无效的IP地址';
            }
        }

        // 获取IP类型
        getIPType(args) {
            const ip = args.IP || '';
            const octets = ip.split('.').map(Number);
            
            if (octets.length !== 4) return '未知类型';
            
            if (octets[0] === 10) {
                return '私有IP (A类)';
            } else if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) {
                return '私有IP (B类)';
            } else if (octets[0] === 192 && octets[1] === 168) {
                return '私有IP (C类)';
            } else if (octets[0] === 169 && octets[1] === 254) {
                return '本地链接地址';
            } else if (octets[0] === 127) {
                return '环回地址';
            } else if (octets[0] >= 224 && octets[0] <= 239) {
                return '多播地址';
            } else if (octets[0] >= 240) {
                return '保留地址';
            } else {
                return '公网IP';
            }
        }

        // IP转数字
        ipToNumber(args) {
            const ip = args.IP || '0.0.0.0';
            const octets = ip.split('.');
            
            if (octets.length !== 4) return 0;
            
            try {
                const num = octets.reduce((acc, octet) => {
                    return (acc << 8) + parseInt(octet, 10);
                }, 0) >>> 0;
                
                return num.toString();
            } catch (e) {
                return '0';
            }
        }

        // 数字转IP
        numberToIP(args) {
            let num = Number(args.NUM) || 0;
            
            if (num < 0 || num > 4294967295) return '0.0.0.0';
            
            const octet1 = (num >> 24) & 255;
            const octet2 = (num >> 16) & 255;
            const octet3 = (num >> 8) & 255;
            const octet4 = num & 255;
            
            return `${octet1}.${octet2}.${octet3}.${octet4}`;
        }

        // 随机生成IP
        generateRandomIP() {
            const isPrivate = Math.random() > 0.7; // 30%概率生成私有IP
            
            if (isPrivate) {
                const type = Math.floor(Math.random() * 3);
                switch(type) {
                    case 0: // 10.0.0.0/8
                        return `10.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
                    case 1: // 172.16.0.0/12
                        return `172.${16 + Math.floor(Math.random() * 16)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
                    case 2: // 192.168.0.0/16
                        return `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
                }
            }
            
            // 生成公网IP
            const octets = [];
            for (let i = 0; i < 4; i++) {
                let octet;
                do {
                    octet = Math.floor(Math.random() * 256);
                } while (
                    (i === 0 && (octet === 10 || octet === 127 || octet === 0 || octet >= 224)) ||
                    (i === 0 && octet === 172 && Math.random() > 0.5) ||
                    (i === 0 && octet === 192 && Math.random() > 0.5)
                );
                octets.push(octet);
            }
            return octets.join('.');
        }

        // ========== 基础getters ==========
        getIPv4() {
            return this.ipv4 || '未获取';
        }

        getIPv6() {
            return this.ipv6 || '未获取';
        }

        hasIPv6() {
            return !!this.ipv6;
        }

        getLastError() {
            return this.lastError || '无错误';
        }

        clearCache() {
            cache.data.clear();
            this.locationCache.clear();
        }
    }

    // 注册扩展
    Scratch.extensions.register(new IPAddressToolbox());
})(Scratch);