# @opendoc/sdk

## 1.3.6

### Patch Changes

- 8573019: 确保生成的模板代码中.set 参数不是空值

## 1.3.5

### Patch Changes

- a4b1215: 修复 allOf/oneOf/anyOf 的 schmea 枚举不是 ref 时编译错误的问题
- 529d21f: sdk 支持 FormData
- f4a231c: sdk 输出 operation 的 pathname 和 method
- 373276f: 当 allOf/oneOf/anyOf 与 properties 同时存在时会生成错误的代码
- 0be3302: sdk 注释支持 summary 字段

## 1.3.4

### Patch Changes

- 764e43f: 修复 sdk 无法解析 requestBody,request,parameter,header 的$ref 问题

## 1.3.3

### Patch Changes

- 8d75754: 修复 openapi 的 query 中存在 boolean 类型的字段时 sdk 构建错误

## 1.3.2

### Patch Changes

- 39f69c1: 修复 swagger 文件中存在 trace 和 option 接口时导致的编译错误

## 1.3.1

### Patch Changes

- c27b265: 修复 sdk 构建异常

## 1.3.0

### Minor Changes

- 179bf1f: 支持 swagger2
- 07b5a11: SDK 自动修复 swagger 特殊字符和中文

## 1.2.0

### Minor Changes

- a98ce3e: 应用的页签支持目录树

### Patch Changes

- 77319c0: 添加@opendoc/register 和@opendoc/sdk README.md
- 509e5a4: 修复 openapi 的 react sdk 无法构建的问题

## 1.1.0

### Minor Changes

- cc65c59: 支持 Asyncapi 文档
