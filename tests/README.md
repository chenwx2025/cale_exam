# 测试文档

## 快速开始

### 运行所有测试
```bash
npm run test:run
```

### 监听模式（开发时使用）
```bash
npm run test
```

### UI 界面
```bash
npm run test:ui
```

### 生成覆盖率报告
```bash
npm run test:coverage

# 查看 HTML 报告
open coverage/index.html
```

## 测试结构

```
tests/
├── setup.ts                    # 全局测试设置
├── unit/                       # 单元测试
│   └── utils/
│       ├── jwt.test.ts        # JWT 工具测试 (21 tests) ✅
│       ├── password.test.ts   # 密码工具测试 (36 tests) ✅
│       └── mention-parser.test.ts  # 提及解析测试 (29 tests) ✅
├── integration/                # 集成测试 (待实现)
├── component/                  # 组件测试 (待实现)
├── fixtures/                   # 测试数据
└── helpers/                    # 测试辅助函数
```

## 测试状态

### ✅ 已完成 (86 个测试)

- **JWT 工具**: 21 个测试，100% 覆盖率
- **密码工具**: 36 个测试，100% 覆盖率
- **提及解析**: 29 个测试，11% 覆盖率

### 📋 待实现

- API 集成测试
- Vue 组件测试
- E2E 测试

## 编写测试

### 基本结构

```typescript
import { describe, it, expect } from 'vitest'
import { yourFunction } from '../../../server/utils/your-file'

describe('Your Module', () => {
  describe('yourFunction', () => {
    it('应该做某事', () => {
      // Arrange - 准备
      const input = 'test'

      // Act - 执行
      const result = yourFunction(input)

      // Assert - 断言
      expect(result).toBe('expected')
    })
  })
})
```

### 测试命名规范

- 使用 "应该..." 格式描述测试用例
- 清晰说明测试的内容和预期结果
- 中文描述，便于团队理解

### 示例

```typescript
// ✅ 好的测试名称
it('应该验证正确的密码')
it('应该拒绝无效的邮箱地址')
it('应该生成有效的 JWT token')

// ❌ 不好的测试名称
it('test password')
it('validation')
it('works')
```

## 覆盖率目标

| 模块 | 当前覆盖率 | 目标覆盖率 |
|------|----------|----------|
| 工具函数 (utils/) | 70%+ | 80%+ |
| API 端点 | 0% | 70%+ |
| 组件 | 0% | 50%+ |
| 整体 | 0.2% | 50%+ |

## 相关文档

- [测试改善计划](../docs/TESTING_IMPROVEMENT_PLAN.md)
- [测试实施报告](../docs/TESTING_IMPLEMENTATION_COMPLETE.md)
- [Vitest 官方文档](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)

## 最佳实践

1. ✅ 测试应该快速（< 100ms）
2. ✅ 测试应该独立（不依赖其他测试）
3. ✅ 一个测试只验证一件事
4. ✅ 使用清晰的测试描述
5. ✅ 覆盖边界情况和异常
6. ✅ 测试行为而非实现

## 常见问题

### Q: 如何只运行特定测试文件？
```bash
npx vitest run tests/unit/utils/jwt.test.ts
```

### Q: 如何调试测试？
```bash
# 使用 UI 模式
npm run test:ui
```

### Q: 如何查看详细的覆盖率？
```bash
npm run test:coverage
open coverage/index.html
```

### Q: 测试失败了怎么办？
1. 查看错误信息
2. 检查测试预期是否正确
3. 验证实现代码是否符合预期
4. 使用 `console.log` 调试

## CI/CD 集成（待配置）

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

---

**测试框架**: Vitest 2.1.9
**最后更新**: 2025-10-24
**维护者**: 开发团队
