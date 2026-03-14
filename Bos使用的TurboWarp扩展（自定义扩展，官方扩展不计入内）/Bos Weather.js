// Name: BOS Weather 修复版
// ID: bosWeatherFixed

(function (Scratch) {
  "use strict";

  const BOS_COLORS = {
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
    accent: "#FFE66D"
  };

  const CACHE_EXPIRY = 300000; // 5分钟缓存（原1小时太长了）
  const cache = new Map();

  // 备用 API 列表（提高成功率）
  const API_PROVIDERS = [
    {
      name: 'ipapi.co',
      geo: (city) => `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh`,
      weather: (lat, lon) => `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`,
      ip: 'https://ipapi.co/json/'
    },
    {
      name: 'ip-api.com',
      geo: (city) => `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=YOUR_API_KEY`, // 注意需要 key
      weather: (lat, lon) => `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`,
      ip: 'http://ip-api.com/json/'
    }
  ];

  class BOSWeatherFixed {
    constructor() {
      this.lastData = null;
      this.lastSuccess = false;
      this.lastUpdate = "";
      this.lastLocation = "";
      this.lastCoords = "";
      this.lastError = "";
    }

    getInfo() {
      return {
        id: "bosWeatherFixed",
        name: "BOS 天气(修复版)",
        color1: BOS_COLORS.primary,
        color2: BOS_COLORS.secondary,
        color3: BOS_COLORS.accent,
        unsandboxed: true,
        blocks: [
          {
            opcode: "fetchWeather",
            blockType: Scratch.BlockType.COMMAND,
            text: "🌤️ 获取 [CITY] 天气 (留空自动定位)",
            arguments: {
              CITY: { type: Scratch.ArgumentType.STRING, defaultValue: "" }
            }
          },
          {
            opcode: "isReady",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "天气数据已就绪？"
          },
          {
            opcode: "getTemperature",
            blockType: Scratch.BlockType.REPORTER,
            text: "当前温度 (°C)"
          },
          {
            opcode: "getWeatherDesc",
            blockType: Scratch.BlockType.REPORTER,
            text: "当前天气描述"
          },
          {
            opcode: "getWeatherIcon",
            blockType: Scratch.BlockType.REPORTER,
            text: "天气图标 (emoji)"
          },
          {
            opcode: "getWindSpeed",
            blockType: Scratch.BlockType.REPORTER,
            text: "风速 (km/h)"
          },
          {
            opcode: "getHumidity",
            blockType: Scratch.BlockType.REPORTER,
            text: "湿度 (%)"
          },
          {
            opcode: "getTodayHigh",
            blockType: Scratch.BlockType.REPORTER,
            text: "今日最高温 (°C)"
          },
          {
            opcode: "getTodayLow",
            blockType: Scratch.BlockType.REPORTER,
            text: "今日最低温 (°C)"
          },
          {
            opcode: "getSunrise",
            blockType: Scratch.BlockType.REPORTER,
            text: "日出时间"
          },
          {
            opcode: "getSunset",
            blockType: Scratch.BlockType.REPORTER,
            text: "日落时间"
          },
          {
            opcode: "getLocation",
            blockType: Scratch.BlockType.REPORTER,
            text: "当前位置"
          },
          {
            opcode: "getUpdateTime",
            blockType: Scratch.BlockType.REPORTER,
            text: "数据更新时间"
          },
          {
            opcode: "getHourlyTemp",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后温度",
            arguments: {
              HOURS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 }
            }
          },
          {
            opcode: "getHourlyDesc",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后天气",
            arguments: {
              HOURS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 }
            }
          },
          {
            opcode: "clearCache",
            blockType: Scratch.BlockType.COMMAND,
            text: "🧹 清除天气缓存"
          },
          {
            opcode: "getLastError",
            blockType: Scratch.BlockType.REPORTER,
            text: "最后一次错误信息"
          }
        ]
      };
    }

    // 带超时的 fetch
    async fetchWithTimeout(url, options = {}, timeout = 5000) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (error) {
        clearTimeout(id);
        throw error;
      }
    }

    // 获取坐标（支持城市名或IP定位）
    async getCoordinates(city) {
      // 如果有城市名，先尝试地理编码
      if (city && city.trim() !== "") {
        try {
          // 使用 open-meteo 地理编码（免费，无需key）
          const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh`;
          const geoRes = await this.fetchWithTimeout(geoUrl);
          if (geoRes.ok) {
            const geoJson = await geoRes.json();
            if (geoJson.results && geoJson.results.length > 0) {
              const r = geoJson.results[0];
              return {
                lat: r.latitude,
                lon: r.longitude,
                name: r.name + (r.country ? `, ${r.country}` : "")
              };
            }
          }
        } catch (e) {
          console.warn("地理编码失败", e);
        }
      }

      // 无城市或编码失败，使用IP定位（备用多个API）
      const ipApis = [
        { url: "https://ipapi.co/json/", parser: (d) => ({ lat: d.latitude, lon: d.longitude, name: d.city ? `${d.city}, ${d.country_name}` : "未知" }) },
        { url: "http://ip-api.com/json/", parser: (d) => ({ lat: d.lat, lon: d.lon, name: d.city ? `${d.city}, ${d.country}` : "未知" }) },
        { url: "https://ipwho.is/", parser: (d) => ({ lat: d.latitude, lon: d.longitude, name: d.city ? `${d.city}, ${d.country}` : "未知" }) }
      ];

      for (const api of ipApis) {
        try {
          const res = await this.fetchWithTimeout(api.url);
          if (res.ok) {
            const data = await res.json();
            const coords = api.parser(data);
            if (coords.lat && coords.lon) return coords;
          }
        } catch (e) {
          console.warn("IP定位失败", api.url, e);
        }
      }
      throw new Error("无法获取地理位置");
    }

    // 获取天气数据
    async fetchWeather(args) {
      const city = (args.CITY || "").trim();
      const cacheKey = city || "__ip__";

      // 检查缓存
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
          this.lastData = cached.data;
          this.lastSuccess = true;
          this.lastUpdate = new Date().toLocaleString('zh-CN');
          this.lastLocation = cached.location || city || "自动定位";
          this.lastCoords = cached.coords || "";
          this.lastError = "";
          return;
        }
      }

      try {
        // 1. 获取坐标
        const coords = await this.getCoordinates(city);
        const { lat, lon, name } = coords;

        // 2. 获取天气
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
        const weatherRes = await this.fetchWithTimeout(weatherUrl);
        if (!weatherRes.ok) throw new Error(`天气API返回${weatherRes.status}`);

        const weatherJson = await weatherRes.json();

        // 存入缓存
        cache.set(cacheKey, {
          data: weatherJson,
          timestamp: Date.now(),
          location: name || city || "自动定位",
          coords: `${lat.toFixed(2)}, ${lon.toFixed(2)}`
        });

        this.lastData = weatherJson;
        this.lastSuccess = true;
        this.lastUpdate = new Date().toLocaleString('zh-CN');
        this.lastLocation = name || city || "自动定位";
        this.lastCoords = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        this.lastError = "";

      } catch (error) {
        console.error("天气获取失败", error);
        this.lastSuccess = false;
        this.lastError = error.message || "未知错误";
        this.lastData = null;
      }
    }

    // ---------- 状态 ----------
    isReady() {
      return !!this.lastSuccess && !!this.lastData;
    }

    getTemperature() {
      return this.lastData?.current_weather?.temperature ?? 0;
    }

    getWeatherDesc() {
      const code = this.lastData?.current_weather?.weathercode;
      if (code === undefined) return "未知";
      return this._codeToDesc(code);
    }

    getWeatherIcon() {
      const code = this.lastData?.current_weather?.weathercode;
      if (code === undefined) return "❓";
      return this._codeToEmoji(code);
    }

    getWindSpeed() {
      return this.lastData?.current_weather?.windspeed ?? 0;
    }

    getHumidity() {
      const now = new Date();
      const hourStr = now.toISOString().slice(0, 13);
      const hourly = this.lastData?.hourly;
      if (!hourly?.time) return 0;
      const idx = hourly.time.findIndex(t => t.startsWith(hourStr));
      if (idx >= 0 && hourly.relativehumidity_2m?.[idx]) {
        return hourly.relativehumidity_2m[idx];
      }
      return 0;
    }

    getTodayHigh() {
      return this.lastData?.daily?.temperature_2m_max?.[0] ?? 0;
    }

    getTodayLow() {
      return this.lastData?.daily?.temperature_2m_min?.[0] ?? 0;
    }

    getSunrise() {
      const time = this.lastData?.daily?.sunrise?.[0];
      return time ? time.split('T')[1] : "未知";
    }

    getSunset() {
      const time = this.lastData?.daily?.sunset?.[0];
      return time ? time.split('T')[1] : "未知";
    }

    getLocation() {
      return this.lastLocation || "未知";
    }

    getUpdateTime() {
      return this.lastUpdate || "";
    }

    getHourlyTemp(args) {
      const hours = Math.floor(Number(args.HOURS) || 0);
      const hourly = this.lastData?.hourly;
      if (!hourly?.time) return 0;
      const now = new Date();
      const target = new Date(now.getTime() + hours * 3600000);
      const targetHour = target.toISOString().slice(0, 13);
      const idx = hourly.time.findIndex(t => t.startsWith(targetHour));
      if (idx >= 0 && hourly.temperature_2m?.[idx]) {
        return hourly.temperature_2m[idx];
      }
      return 0;
    }

    getHourlyDesc(args) {
      const hours = Math.floor(Number(args.HOURS) || 0);
      const hourly = this.lastData?.hourly;
      if (!hourly?.time) return "未知";
      const now = new Date();
      const target = new Date(now.getTime() + hours * 3600000);
      const targetHour = target.toISOString().slice(0, 13);
      const idx = hourly.time.findIndex(t => t.startsWith(targetHour));
      if (idx >= 0 && hourly.weathercode?.[idx]) {
        return this._codeToDesc(hourly.weathercode[idx]);
      }
      return "未知";
    }

    clearCache() {
      cache.clear();
    }

    getLastError() {
      return this.lastError || "无错误";
    }

    _codeToDesc(code) {
      const map = {
        0: "晴朗", 1: "晴间多云", 2: "多云", 3: "阴天",
        45: "雾", 48: "霜雾",
        51: "小雨", 53: "中雨", 55: "大雨",
        61: "阵雨", 63: "中阵雨", 65: "大阵雨",
        71: "小雪", 73: "中雪", 75: "大雪",
        77: "雪粒",
        80: "小阵雨", 81: "中阵雨", 82: "大阵雨",
        85: "小阵雪", 86: "大阵雪",
        95: "雷暴", 96: "雷暴夹雹", 99: "强雷暴"
      };
      return map[code] || `未知(${code})`;
    }

    _codeToEmoji(code) {
      if (code === 0 || code === 1) return "☀️";
      if (code === 2) return "⛅";
      if (code === 3) return "☁️";
      if (code >= 45 && code <= 48) return "🌫️";
      if ((code >= 51 && code <= 55) || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return "🌧️";
      if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "❄️";
      if (code >= 95 && code <= 99) return "⛈️";
      return "🌤️";
    }
  }

  Scratch.extensions.register(new BOSWeatherFixed());
})(Scratch);