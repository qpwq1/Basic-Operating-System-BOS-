//BOS文件选择

(function (Scratch) {
  "use strict";

  class FileOperations {
    constructor() {
      this.selectedFiles = [];
      this.singleFileInput = this.createFileInput(false);
      this.multiFileInput = this.createFileInput(true);
    }

    createFileInput(isMultiple) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = isMultiple;
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);

      fileInput.addEventListener('change', e => {
        this.selectedFiles = e.target.files ? Array.from(e.target.files) : [];
        fileInput.value = '';
      });

      return fileInput;
    }

    getInfo() {
      return {
        id: 'wenjiandakai',
        name: '文件操作扩展',
        color1: '#4a6fa5',
        color2: '#385d8a',
        blocks: [
          {
            opcode: 'openSingleFile',
            blockType: Scratch.BlockType.COMMAND,
            text: '打开单个文件 [文件类型]',
            arguments: {
              文件类型: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "*"
              }
            }
          },
          {
            opcode: 'openMultipleFiles',
            blockType: Scratch.BlockType.COMMAND,
            text: '打开多个文件 [文件类型]',
            arguments: {
              文件类型: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "*"
              }
            }
          },
          "---",
          {
            opcode: 'getFileInfo',
            blockType: Scratch.BlockType.REPORTER,
            text: '获取 [序号] 号文件的 [属性]',
            arguments: {
              序号: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1"
              },
              属性: {
                type: Scratch.ArgumentType.STRING,
                menu: '属性菜单'
              }
            }
          },
          {
            opcode: 'readFileContent',
            blockType: Scratch.BlockType.REPORTER,
            text: '读取 [序号] 号文件的内容为 [格式]',
            arguments: {
              序号: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1"
              },
              格式: {
                type: Scratch.ArgumentType.STRING,
                menu: '内容格式菜单'
              }
            }
          },
          {
            opcode: 'getFileCount',
            blockType: Scratch.BlockType.REPORTER,
            text: '已打开文件的数量'
          },
          "---",
          {
            opcode: 'saveAsFile',
            blockType: Scratch.BlockType.COMMAND,
            text: '保存文本 [内容] 为 [文件名]',
            arguments: {
              内容: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "你好，世界！"
              },
              文件名: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "测试文件.txt"
              }
            }
          },
          {
            opcode: 'saveDataURL',
            blockType: Scratch.BlockType.COMMAND,
            text: '保存DataURL [数据] 为 [文件名]',
            arguments: {
              数据: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "data:text/plain;base64,5L2g5aW977yM5LiW55WMIQ=="
              },
              文件名: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "文件.bin"
              }
            }
          }
        ],
        menus: {
          属性菜单: {
            acceptReporters: true,
            items: [
              { text: '文件名', value: 'name' },
              { text: '文件大小', value: 'size' },
              { text: 'DataURL格式', value: 'dataurl' },
              { text: '文件类型', value: 'type' },
              { text: '最后修改时间', value: 'lastModified' },
              { text: '创建时间', value: 'created' },
              { text: '时长(音频/视频)', value: 'duration' },
              { text: '尺寸(图片/视频)', value: 'dimensions' },
              { text: '作者(PPT)', value: 'author' },
              { text: '幻灯片数量(PPT)', value: 'slideCount' }
            ]
          },
          内容格式菜单: {
            acceptReporters: true,
            items: [
              { text: '文本', value: 'text' },
              { text: 'DataURL', value: 'dataurl' }
            ]
          }
        }
      };
    }

    openSingleFile(args) {
      return this.openFile(args.文件类型, false);
    }

    openMultipleFiles(args) {
      return this.openFile(args.文件类型, true);
    }

    openFile(fileTypes, isMultiple) {
      const acceptTypes = fileTypes === "*" ? "" : fileTypes.split(',').map(ext => `.${ext.trim()}`).join(',');
      const fileInput = isMultiple ? this.multiFileInput : this.singleFileInput;

      return new Promise((resolve) => {
        const waitForFile = () => {
          if (this.selectedFiles.length > 0) {
            resolve();
            return;
          }
          setTimeout(waitForFile, 50);
        };

        fileInput.accept = acceptTypes;
        this.selectedFiles = [];
        fileInput.click();
        waitForFile();
      });
    }

    getFileInfo(args) {
      const index = Math.floor(Scratch.Cast.toNumber(args.序号)) - 1;
      const property = Scratch.Cast.toString(args.属性);
      
      if (index < 0 || index >= this.selectedFiles.length) {
        return "";
      }
      
      const file = this.selectedFiles[index];
      
      switch (property) {
        case 'name':
          return file.name;
        case 'size':
          return this.formatFileSize(file.size);
        case 'dataurl':
          return this.fileToDataURL(file);
        case 'type':
          return file.type || "未知类型";
        case 'lastModified':
          return new Date(file.lastModified).toLocaleString();
        case 'created':
          return new Date().toLocaleString();
        case 'duration':
          return this.getMediaDuration(file);
        case 'dimensions':
          return this.getMediaDimensions(file);
        case 'author':
          return this.getPPTAuthor(file);
        case 'slideCount':
          return this.getPPTSlideCount(file);
        default:
          return "";
      }
    }

    async readFileContent(args) {
      const index = Math.floor(Scratch.Cast.toNumber(args.序号)) - 1;
      const format = Scratch.Cast.toString(args.格式);
      
      if (index < 0 || index >= this.selectedFiles.length) {
        return "";
      }
      
      const file = this.selectedFiles[index];
      
      try {
        if (format === 'text') {
          return await file.text();
        } else if (format === 'dataurl') {
          return await this.fileToDataURL(file);
        }
      } catch (error) {
        console.error('读取文件内容错误:', error);
      }
      return "";
    }

    getFileCount() {
      return this.selectedFiles.length;
    }

    saveAsFile(args) {
      const content = Scratch.Cast.toString(args.内容);
      const fileName = Scratch.Cast.toString(args.文件名);
      
      const dataBlob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      this.downloadFile(dataBlob, fileName);
    }

    saveDataURL(args) {
      const data = Scratch.Cast.toString(args.数据);
      const fileName = Scratch.Cast.toString(args.文件名);
      
      try {
        const dataBlob = this.DataURLToBlob(data);
        this.downloadFile(dataBlob, fileName);
      } catch (error) {
        console.error('保存DataURL错误:', error);
      }
    }

    formatFileSize(bytes) {
      if (bytes === 0) return "0 KB";
      if (!bytes || isNaN(bytes)) return "0 KB";
      
      const sizeInKB = bytes / 1024;
      
      if (sizeInKB < 0.001) {
        return "<0.001 KB";
      }
      
      if (sizeInKB < 1) {
        return sizeInKB.toFixed(3) + " KB";
      } else if (sizeInKB < 10) {
        return sizeInKB.toFixed(2) + " KB";
      } else if (sizeInKB < 100) {
        return sizeInKB.toFixed(1) + " KB";
      } else if (sizeInKB < 1000) {
        return Math.round(sizeInKB) + " KB";
      } else {
        const sizeInMB = bytes / (1024 * 1024);
        if (sizeInMB < 10) {
          return sizeInMB.toFixed(2) + " MB";
        } else if (sizeInMB < 100) {
          return sizeInMB.toFixed(1) + " MB";
        } else {
          return Math.round(sizeInMB) + " MB";
        }
      }
    }

    fileToDataURL(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      });
    }

    getMediaDuration(file) {
      return new Promise((resolve) => {
        if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
          resolve("非音频/视频文件");
          return;
        }
        
        const objectURL = URL.createObjectURL(file);
        const media = file.type.startsWith('audio/') ? new Audio() : document.createElement('video');
        
        media.onloadedmetadata = () => {
          const duration = media.duration;
          URL.revokeObjectURL(objectURL);
          if (isNaN(duration)) {
            resolve("无法获取时长");
          } else {
            resolve(`${duration.toFixed(1)} 秒`);
          }
        };
        
        media.onerror = () => {
          URL.revokeObjectURL(objectURL);
          resolve("无法读取媒体时长");
        };
        
        media.src = objectURL;
      });
    }

    getMediaDimensions(file) {
      return new Promise((resolve) => {
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          resolve("非图片或视频文件");
          return;
        }
        
        const objectURL = URL.createObjectURL(file);
        
        if (file.type.startsWith('image/')) {
          const image = new Image();
          image.onload = () => {
            URL.revokeObjectURL(objectURL);
            resolve(`${image.width} × ${image.height}`);
          };
          image.onerror = () => {
            URL.revokeObjectURL(objectURL);
            resolve("无法读取图片尺寸");
          };
          image.src = objectURL;
        } else {
          const video = document.createElement('video');
          video.onloadedmetadata = () => {
            URL.revokeObjectURL(objectURL);
            resolve(`${video.videoWidth} × ${video.videoHeight}`);
          };
          video.onerror = () => {
            URL.revokeObjectURL(objectURL);
            resolve("无法读取视频尺寸");
          };
          video.src = objectURL;
        }
      });
    }

    getPPTAuthor(file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
        return "PPT文件作者信息需要特殊解析";
      }
      return "非PPT文件";
    }

    getPPTSlideCount(file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
        return "PPT幻灯片数量需要特殊解析";
      }
      return "非PPT文件";
    }

    downloadFile(dataBlob, fileName) {
      const downloadURL = URL.createObjectURL(dataBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadURL;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadURL);
    }

    DataURLToBlob(dataurl) {
      const parts = dataurl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (!mimeMatch) throw new Error('无效的DataURL格式');
      
      const mime = mimeMatch[1];
      const binaryString = atob(parts[1]);
      const byteArray = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }
      
      return new Blob([byteArray], { type: mime });
    }
  }

  // 包装异步方法以确保返回字符串
  const originalGetFileInfo = FileOperations.prototype.getFileInfo;
  FileOperations.prototype.getFileInfo = function(args) {
    const result = originalGetFileInfo.call(this, args);
    if (result instanceof Promise) {
      return result.then(value => {
        if (value === undefined || value === null) return "";
        return String(value);
      }).catch(() => "");
    }
    if (result === undefined || result === null) return "";
    return String(result);
  };

  const originalReadFileContent = FileOperations.prototype.readFileContent;
  FileOperations.prototype.readFileContent = function(args) {
    const result = originalReadFileContent.call(this, args);
    if (result instanceof Promise) {
      return result.then(value => {
        if (value === undefined || value === null) return "";
        return String(value);
      }).catch(() => "");
    }
    if (result === undefined || result === null) return "";
    return String(result);
  };

  Scratch.extensions.register(new FileOperations());
})(Scratch);
