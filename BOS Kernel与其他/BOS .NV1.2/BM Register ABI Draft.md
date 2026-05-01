# BM Register ABI Draft

**Status**: Draft, not yet implemented  
**Target BOS version**: Future (≥ 1.3)  
**Purpose**: Introduce a register-based fast system call convention for BM, as an optional alternative to the existing string instructions.

---

## Design Goals

- Reduce instruction parsing overhead
- Provide a stable ABI for other languages to call the BOS kernel in the future
- Maintain compatibility with existing BM scripts (dual-track approach)

---

## Register Definition

| Register | Width | Direction | Purpose |
|----------|-------|-----------|---------|
| AR | 16 | Write | System call number |
| BR | 16 | Write | Argument 1 |
| CR | 16 | Write | Argument 2 |
| DR | 16 | Write | Argument 3 |
| ERR | 1  | Read only | Error flag for the last system call (0 = success, 1 = error) |
| ERT | 16 | Read only | Result value or error code |

> Note: Other registers (GR1–GR4) are general-purpose; their exact use is TBD.

---

## System Call Number Allocation (Partial Example)

| Number | Function | Corresponding String Instruction |
|--------|----------|----------------------------------|
| 1 | `MEM_NEW` | `BM::MEM(NEW ...)` |
| 2 | `MEM_WRITE` | `BM::MEM(WRITE ...)` |
| 3 | `MEM_READ` | `BM::MEM(READ ...)` |
| 4 | `MEM_DELETE` | `BM::MEM(DELETE ...)` |
| 5 | `PM_START` | `BM::PM(START ...)` |
| 6 | `PM_SEND` | `BM::PM(SEND ...)` |
| 7 | `FS_READ` | `BM::FS(readFileC ...)` |
| 8 | `SYS_INFO` | `BM::SYS(INFO)` |

The full allocation table will be extended during implementation.

---

## Usage Examples

### Allocate Memory
```bm
MOVE AR, 1        ; MEM_NEW
MOVE BR, 10       ; SIZE(10)
SYS
; On success: ERT = handle ID, ERR = 0