# BVM-1 Instruction Set Documentation

## Instruction Format
- **6-byte instructions**: `[opcode] [dest] [src]` (each field 2 bytes)
- **4-byte instructions**: `[opcode] [addr]` (jumps, stack ops)
- **2-byte instructions**: `[opcode]` (no operands)

## Opcode Table
| Hex Opcode | Decimal | Binary Opcode | Mnemonic | Length |
| --- | --- | --- | --- | --- |
| 0000 | 0 | 0000 0000 0000 0000 | MOV | 6 |
| 0001 | 1 | 0000 0000 0000 0001 | ADD | 6 |
| 0002 | 2 | 0000 0000 0000 0010 | SUB | 6 |
| 0003 | 3 | 0000 0000 0000 0011 | MUL | 6 |
| 0004 | 4 | 0000 0000 0000 0100 | DIV | 6 |
| 0005 | 5 | 0000 0000 0000 0101 | SYSCALL | 2 |
| 0006 | 6 | 0000 0000 0000 0110 | JMP | 4 |
| 0007 | 7 | 0000 0000 0000 0111 | JZ | 4 |
| 0008 | 8 | 0000 0000 0000 1000 | JNZ | 4 |
| 0009 | 9 | 0000 0000 0000 1001 | JE | 4 |
| 000A | 10 | 0000 0000 0000 1010 | JNE | 4 |
| 000B | 11 | 0000 0000 0000 1011 | JC | 4 |
| 000C | 12 | 0000 0000 0000 1100 | JNC | 4 |
| 000D | 13 | 0000 0000 0000 1101 | SHL | 6 |
| 000E | 14 | 0000 0000 0000 1110 | SHR | 6 |
| 000F | 15 | 0000 0000 0000 1111 | CMP | 6 |
| 0010 | 16 | 0000 0000 0001 0000 | AND | 6 |
| 0012 | 18 | 0000 0000 0001 0010 | OR | 6 |
| 0013 | 19 | 0000 0000 0001 0011 | NOT | 4 |
| 0014 | 20 | 0000 0000 0001 0100 | MOVR | 6 |
| 0015 | 21 | 0000 0000 0001 0101 | NOP | 2 |
| 0016 | 22 | 0000 0000 0001 0110 | XOR | 6 |
| 0017 | 23 | 0000 0000 0001 0111 | XNOR | 6 |

---

## Data Transfer Instructions

### MOV — Move Immediate
- **Opcode**: `0x0000`
- **Format**: `MOV dest, imm`
- **Length**: 6 bytes
- **Operation**: `reg[dest] = imm`
- **Example**: `MOV AR, 123`

### MOVR — Move Register
- **Opcode**: `0x0014`
- **Format**: `MOVR dest, src`
- **Length**: 6 bytes
- **Operation**: `reg[dest] = reg[src]`
- **Example**: `MOVR BR, AR`

---

## Arithmetic Instructions

### ADD — Addition
- **Opcode**: `0x0001`
- **Format**: `ADD dest, src`
- **Length**: 6 bytes
- **Operation**: `reg[dest] = reg[dest] + reg[src]`
- **Example**: `ADD AR, BR`

### SUB — Subtraction
- **Opcode**: `0x0002`
- **Format**: `SUB dest, src`
- **Length**: 6 bytes
- **Operation**: `reg[dest] = reg[dest] - reg[src]`
- **Example**: `SUB AR, BR`

### MUL — Multiplication
- **Opcode**: `0x0003`
- **Format**: `MUL dest, src`
- **Length**: 6 bytes
- **Operation**: `reg[dest] = reg[dest] * reg[src]`
- **Example**: `MUL AR, BR`

### DIV — Division
- **Opcode**: `0x0004`
- **Format**: `DIV dest, src`
- **Length**: 6 bytes
- **Operation**: `quotient → reg[dest]`, `remainder → ERC`
- **Example**: `DIV AR, BR`

---

## Bitwise Instructions

### AND — Bitwise AND
- **Opcode**: `0x0010`
- **Format**: `AND dest, src`
- **Length**: 6 bytes
- **Operation**: `reg[dest] = reg[dest] & reg[src]`
- **Example**: `AND AR, BR`

### OR — Bitwise OR
- **Opcode**: `0x0012`
- **Format**: `OR dest, src`
- **Length**: 6 bytes
- **Operation**: `reg[dest] = reg[dest] | reg[src]`
- **Example**: `OR AR, BR`

### NOT — Bitwise NOT
- **Opcode**: `0x0013`
- **Format**: `NOT dest`
- **Length**: 4 bytes
- **Operation**: `reg[dest] = ~reg[dest]`
- **Example**: `NOT AR`

### XOR — Bitwise XOR
- **Opcode**: `0x0016`
- **Format**: `XOR dest, src`
- **Length**: 6 bytes
- **Operation**: `reg[dest] = reg[dest] ^ reg[src]`
- **Example**: `XOR AR, BR`

### XNOR — Bitwise XNOR
- **Opcode**: `0x0017`
- **Format**: `XNOR dest, src`
- **Length**: 6 bytes
- **Operation**: `reg[dest] = ~(reg[dest] ^ reg[src])`
- **Example**: `XNOR AR, BR`

### CMP — Compare
- **Opcode**: `0x000F`
- **Format**: `CMP dest, src`
- **Length**: 6 bytes
- **Operation**: Computes `reg[dest] - reg[src]`, updates flags only (`AZ`, `AE`, `AC`)
- **Example**: `CMP AR, BR`

### SHL — Shift Left
- **Opcode**: `0x000D`
- **Format**: `SHL dest, src`
- **Length**: 6 bytes
- **Operation**: `reg[dest] = reg[dest] << reg[src]`
- **Example**: `SHL AR, BR`

### SHR — Shift Right
- **Opcode**: `0x000E`
- **Format**: `SHR dest, src`
- **Length**: 6 bytes
- **Operation**: `reg[dest] = reg[dest] >> reg[src]`
- **Example**: `SHR AR, BR`

---

## Control Transfer Instructions

### JMP — Unconditional Jump
- **Opcode**: `0x0006`
- **Format**: `JMP addr`
- **Length**: 4 bytes
- **Operation**: `PC = addr`
- **Example**: `JMP 0x0010`

### JZ — Jump if Zero
- **Opcode**: `0x0007`
- **Format**: `JZ addr`
- **Length**: 4 bytes
- **Operation**: `if (AZ == 1) PC = addr`
- **Example**: `JZ 0x0010`

### JNZ — Jump if Not Zero
- **Opcode**: `0x0008`
- **Format**: `JNZ addr`
- **Length**: 4 bytes
- **Operation**: `if (AZ == 0) PC = addr`
- **Example**: `JNZ 0x0010`

### JE — Jump if Equal
- **Opcode**: `0x0009`
- **Format**: `JE addr`
- **Length**: 4 bytes
- **Operation**: `if (AE == 1) PC = addr`
- **Example**: `JE 0x0010`

### JNE — Jump if Not Equal
- **Opcode**: `0x000A`
- **Format**: `JNE addr`
- **Length**: 4 bytes
- **Operation**: `if (AE == 0) PC = addr`
- **Example**: `JNE 0x0010`

### JC — Jump if Carry
- **Opcode**: `0x000B`
- **Format**: `JC addr`
- **Length**: 4 bytes
- **Operation**: `if (AC == 1) PC = addr`
- **Example**: `JC 0x0010`

### JNC — Jump if Not Carry
- **Opcode**: `0x000C`
- **Format**: `JNC addr`
- **Length**: 4 bytes
- **Operation**: `if (AC == 0) PC = addr`
- **Example**: `JNC 0x0010`

---

## System Instructions

### SYSCALL — System Call
- **Opcode**: `0x0005`
- **Format**: `SYSCALL`
- **Length**: 2 bytes
- **Operation**: Invokes kernel service based on `AR` (library) and `BR` (function)
- **Example**: `SYSCALL`

### NOP — No Operation
- **Opcode**: `0x0015`
- **Format**: `NOP`
- **Length**: 2 bytes
- **Operation**: No operation; yields CPU for cooperative scheduling
- **Example**: `NOP`

---

## Flags
- **AZ (ALU Zero)**: Set when result is zero.
- **AE (ALU Equal)**: Set when comparison is equal.
- **AC (ALU Carry)**: Set on addition carry or subtraction borrow.
- **ERR**: 1 = success, 0 = failure.
- **ERC**: Return value on success, error code on failure.

---

## Register Encoding

| Register | Hex Code | Read/Write |
| :--- | :--- | :--- |
| AR | 0000 | R/W |
| BR | 0001 | R/W |
| CR | 0002 | R/W |
| DR | 0003 | R/W |
| ER | 0004 | R/W |
| FR | 0005 | R/W |
| GR | 0006 | R/W |
| ERR | 0007 | R/O |
| ERC | 0008 | R/O |
| AZ | 0009 | R/O |
| AE | 000A | R/O |
| AC | 000B | R/O |
| LSP | 000C | R/W |
| RSP | 000D | R/W |

---

*Document Version: 1.1 | Updated: 2026-06-21 | Author: qpwq1 (XaoDingx)*
