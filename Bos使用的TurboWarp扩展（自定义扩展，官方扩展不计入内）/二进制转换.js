// Binary & ASCII Converter for TurboWarp (正确版)
// 正确处理字节和ASCII码
(function (Scratch) {
  "use strict";

  class BinaryAsciiExtension {
    getInfo() {
      return {
        id: 'binaryAsciiConverter',
        name: '二进制/ASCII转换器',
        blocks: [
          {
            opcode: 'textToBinary',
            blockType: Scratch.BlockType.REPORTER,
            text: '[TEXT] 的二进制 (空格分隔每字节)',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'ABC'
              }
            }
          },
          {
            opcode: 'binaryToText',
            blockType: Scratch.BlockType.REPORTER,
            text: '二进制 [BINARY] 转文本',
            arguments: {
              BINARY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '01000001 01000010 01000011'
              }
            }
          },
          {
            opcode: 'charToAscii',
            blockType: Scratch.BlockType.REPORTER,
            text: '[CHAR] 的ASCII码',
            arguments: {
              CHAR: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'A'
              }
            }
          },
          {
            opcode: 'asciiToChar',
            blockType: Scratch.BlockType.REPORTER,
            text: 'ASCII码 [CODE] 的字符',
            arguments: {
              CODE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 65
              }
            }
          },
          {
            opcode: 'decimalToBinary',
            blockType: Scratch.BlockType.REPORTER,
            text: '十进制 [NUM] 的8位二进制',
            arguments: {
              NUM: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 255
              }
            }
          },
          {
            opcode: 'binaryToDecimal',
            blockType: Scratch.BlockType.REPORTER,
            text: '二进制 [BIN] 的十进制值',
            arguments: {
              BIN: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '11111111'
              }
            }
          }
        ],
        color1: '#0fbd8c'
      };
    }

    // 文本 → 二进制（每个字符转成8位二进制）
    textToBinary(args) {
      const text = String(args.TEXT);
      let result = [];
      
      for (let i = 0; i < text.length; i++) {
        const ascii = text.charCodeAt(i);
        // 转成8位二进制（补足8位）
        const binary = ascii.toString(2).padStart(8, '0');
        result.push(binary);
      }
      
      return result.join(' ');
    }

    // 二进制 → 文本
    binaryToText(args) {
      const binaryStr = String(args.BINARY).trim();
      // 按空格分割，过滤空字符串
      const bytes = binaryStr.split(/\s+/).filter(b => b.length > 0);
      let result = '';
      
      for (let byte of bytes) {
        // 确保是有效的二进制数
        const ascii = parseInt(byte, 2);
        if (!isNaN(ascii) && ascii >= 0 && ascii <= 255) {
          result += String.fromCharCode(ascii);
        }
      }
      
      return result;
    }

    // 字符 → ASCII码
    charToAscii(args) {
      const char = String(args.CHAR);
      if (char.length === 0) return 0;
      return char.charCodeAt(0);
    }

    // ASCII码 → 字符
    asciiToChar(args) {
      const code = Number(args.CODE);
      if (isNaN(code) || code < 0 || code > 255) return '';
      return String.fromCharCode(code);
    }

    // 十进制 → 8位二进制
    decimalToBinary(args) {
      const num = Number(args.NUM);
      if (isNaN(num) || num < 0 || num > 255) return '00000000';
      return num.toString(2).padStart(8, '0');
    }

    // 二进制 → 十进制
    binaryToDecimal(args) {
      const bin = String(args.BIN).replace(/[^01]/g, ''); // 只保留0和1
      if (bin.length === 0) return 0;
      const decimal = parseInt(bin, 2);
      return isNaN(decimal) ? 0 : decimal;
    }
  }

  Scratch.extensions.register(new BinaryAsciiExtension());
})(Scratch);
