# BVM-1 Instruction Set Documentation (Version 1)

## Instruction Format Description
- **6-byte instructions**: `[opcode] [dest] [src]` (2 bytes per field)
- **4-byte instructions**: `[opcode] [addr]` (jumps, stack operations)
- **2-byte instructions**: `[opcode]` (no operands)

## Instruction Opcode Table
| Opcode (Hex) | Opcode (Dec) | Opcode (Binary) | Opcode (Binary, no spaces) | Mnemonic |
| --- | --- | --- | --- | --- |
| 0000 | 0 | 0000 0000 0000 0000 | 0000000000000000 | MOV |
| 0001 | 1 | 0000 0000 0000 0001 | 0000000000000001 | ADD |
| 0002 | 2 | 0000 0000 0000 0010 | 0000000000000010 | SUB |
| 0003 | 3 | 0000 0000 0000 0011 | 0000000000000011 | MUL |
| 0004 | 4 | 0000 0000 0000 0100 | 0000000000000100 | DIV |
| 0005 | 5 | 0000 0000 0000 0101 | 0000000000000101 | SYSCALL |
| 0006 | 6 | 0000 0000 0000 0110 | 0000000000000110 | JMP |
| 0007 | 7 | 0000 0000 0000 0111 | 0000000000000111 | JZ |
| 0008 | 8 | 0000 0000 0000 1000 | 0000000000001000 | JNZ |
| 0009 | 9 | 0000 0000 0000 1001 | 0000000000001001 | JE |
| 000A | 10 | 0000 0000 0000 1010 | 0000000000001010 | JNE |
| 000B | 11 | 0000 0000 0000 1011 | 0000000000001011 | JC |
| 000C | 12 | 0000 0000 0000 1100 | 0000000000001100 | JNC |
| 000D | 13 | 0000 0000 0000 1101 | 0000000000001101 | SHL |
| 000E | 14 | 0000 0000 0000 1110 | 0000000000001110 | SHR |
| 000F | 15 | 0000 0000 0000 1111 | 0000000000001111 | CMP |
| 0010 | 16 | 0000 0000 0001 0000 | 0000000000010000 | AND |
| 0012 | 18 | 0000 0000 0001 0010 | 0000000000010010 | OR |
| 0013 | 19 | 0000 0000 0001 0011 | 0000000000010011 | NOT |
| 0014 | 20 | 0000 0000 0001 0100 | 0000000000010100 | MOVR |
| 0015 | 21 | 0000 0000 0001 0101 | 0000000000010101 | Nop |
| 0016 | 22 | 0000 0000 0001 0110 | 0000000000010110 | XOR |
| 0017 | 23 | 0000 0000 0001 0111 | 0000000000010111 | XNOR |

---

## Data Transfer Instructions

### MOV — Move Immediate
- **Opcode**: `0x0000`
- **Format**: `MOV dest, imm`
- **Length**: 6 bytes
- **Behavior**: `reg[dest] = imm`
- **Example**: `MOV AR, 123`

### MOVR — Move Register
- **Opcode**: `0x0014`
- **Format**: `MOVR dest, src`
- **Length**: 6 bytes
- **Behavior**: `reg[dest] = reg[src]`
- **Example**: `MOVR BR, AR`

---

## Arithmetic Instructions

### ADD — Addition
- **Opcode**: `0x0001`
- **Format**: `ADD dest, src`
- **Length**: 6 bytes
- **Behavior**: `reg[dest] = reg[dest] + reg[src]`
- **Example**: `ADD AR, BR`

### SUB — Subtraction
- **Opcode**: `0x0002`
- **Format**: `SUB dest, src`
- **Length**: 6 bytes
- **Behavior**: `reg[dest] = reg[dest] - reg[src]`
- **Example**: `SUB AR, BR`

### MUL — Multiplication
- **Opcode**: `0x0003`
- **Format**: `MUL dest, src`
- **Length**: 6 bytes
- **Behavior**: `reg[dest] = reg[dest] * reg[src]`
- **Example**: `MUL AR, BR`

### DIV — Division
- **Opcode**: `0x0004`
- **Format**: `DIV dest, src`
- **Length**: 6 bytes
- **Behavior**: `Quotient → reg[dest]`, `Remainder → ERC`
- **Example**: `DIV AR, BR`

---

## Bitwise Instructions

### AND — Bitwise AND
- **Opcode**: `0x0010`
- **Format**: `AND dest, src`
- **Length**: 6 bytes
- **Behavior**: `reg[dest] = reg[dest] & reg[src]`
- **Example**: `AND AR, BR`

### OR — Bitwise OR
- **Opcode**: `0x0012`
- **Format**: `OR dest, src`
- **Length**: 6 bytes
- **Behavior**: `reg[dest] = reg[dest] | reg[src]`
- **Example**: `OR AR, BR`

### NOT — Bitwise NOT
- **Opcode**: `0x0013`
- **Format**: `NOT dest`
- **Length**: 6 bytes
- **Behavior**: `reg[dest] = ~reg[dest]`
- **Example**: `NOT AR`

### XOR — Bitwise XOR
- **Opcode**: `0x0016`
- **Format**: `XOR dest, src`
- **Length**: 6 bytes
- **Behavior**: `reg[dest] = reg[dest] ^ reg[src]`
- **Example**: `XOR AR, BR`

### XNOR — Bitwise XNOR
- **Opcode**: `0x0017`
- **Format**: `XNOR dest, src`
- **Length**: 6 bytes
- **Behavior**: `reg[dest] = ~(reg[dest] ^ reg[src])`
- **Example**: `XNOR AR, BR`

### CMP — Compare
- **Opcode**: `0x000F`
- **Format**: `CMP dest, src`
- **Length**: 6 bytes
- **Behavior**: Computes `reg[dest] - reg[src]`, updates only flags (`AZ`, `AE`, `AC`)
- **Example**: `CMP AR, BR`

### SHL — Shift Left
- **Opcode**: `0x000D`
- **Format**: `SHL dest, src`
- **Length**: 6 bytes
- **Behavior**: `reg[dest] = reg[dest] << reg[src]`
- **Example**: `SHL AR, BR`

### SHR — Shift Right
- **Opcode**: `0x000E`
- **Format**: `SHR dest, src`
- **Length**: 6 bytes
- **Behavior**: `reg[dest] = reg[dest] >> reg[src]`
- **Example**: `SHR AR, BR`

---

## Control Transfer Instructions

### JMP — Unconditional Jump
- **Opcode**: `0x0006`
- **Format**: `JMP addr`
- **Length**: 4 bytes
- **Behavior**: `PC = addr`
- **Example**: `JMP 0x0010`

### JZ — Jump if Zero
- **Opcode**: `0x0007`
- **Format**: `JZ addr`
- **Length**: 4 bytes
- **Behavior**: If `AZ == 1`, then `PC = addr`
- **Example**: `JZ 0x0010`

### JNZ — Jump if Not Zero
- **Opcode**: `0x0008`
- **Format**: `JNZ addr`
- **Length**: 4 bytes
- **Behavior**: If `AZ == 0`, then `PC = addr`
- **Example**: `JNZ 0x0010`

### JE — Jump if Equal
- **Opcode**: `0x0009`
- **Format**: `JE addr`
- **Length**: 4 bytes
- **Behavior**: If `AE == 1`, then `PC = addr`
- **Example**: `JE 0x0010`

### JNE — Jump if Not Equal
- **Opcode**: `0x000A`
- **Format**: `JNE addr`
- **Length**: 4 bytes
- **Behavior**: If `AE == 0`, then `PC = addr`
- **Example**: `JNE 0x0010`

### JC — Jump if Carry
- **Opcode**: `0x000B`
- **Format**: `JC addr`
- **Length**: 4 bytes
- **Behavior**: If `AC == 1`, then `PC = addr`
- **Example**: `JC 0x0010`

### JNC — Jump if Not Carry
- **Opcode**: `0x000C`
- **Format**: `JNC addr`
- **Length**: 4 bytes
- **Behavior**: If `AC == 0`, then `PC = addr`
- **Example**: `JNC 0x0010`

---

## System Instructions

### SYSCALL — System Call
- **Opcode**: `0x0005`
- **Format**: `SYSCALL`
- **Length**: 2 bytes
- **Behavior**: Invokes kernel service based on `AR` (library number) and `BR` (function number).
- **Example**: `SYSCALL`

### NOP — No Operation
- **Opcode**: `0x0015`
- **Format**: `NOP`
- **Length**: 2 bytes
- **Behavior**: No operation, yields CPU (cooperative scheduling).
- **Example**: `NOP`

---

## Flag Register Description
- **AZ (ALU Zero)**: Set to 1 when operation result is zero.
- **AE (ALU Equal)**: Set to 1 when comparison is equal.
- **AC (ALU Carry)**: Set to 1 on addition carry or subtraction borrow.
- **ERR**: 1 = success, 0 = failure.
- **ERC**: Stores return value on success, error code on failure.

---

## Register Encoding Table

| Register | Number (Hex) | Read/Write |
| :--- | :--- | :--- |
| AR | 0000 | Read/Write |
| BR | 0001 | Read/Write |
| CR | 0002 | Read/Write |
| DR | 0003 | Read/Write |
| ER | 0004 | Read/Write |
| FR | 0005 | Read/Write |
| GR | 0006 | Read/Write |
| ERR | 0007 | Read-only |
| ERC | 0008 | Read-only |
| AZ | 0009 | Read-only |
| AE | 000A | Read-only |
| AC | 000B | Read-only |
| LSP | 000C | Read/Write |
| RSP | 000D | Read/Write |

---

*Document Version: 1.0 | Last Updated: 2026-06-01 | Author: qpwq1(XaoDingx)*
