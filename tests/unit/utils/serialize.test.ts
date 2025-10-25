import { describe, it, expect } from 'vitest'
import { serializePrisma } from '../../../server/utils/serialize'

describe('Serialize Utils', () => {
  describe('serializePrisma', () => {
    it('应该将对象序列化为纯 JavaScript 对象', () => {
      const input = {
        id: '123',
        name: 'Test',
        count: 42
      }

      const result = serializePrisma(input)

      expect(result).toEqual(input)
      expect(result).not.toBe(input) // 应该是新对象
    })

    it('应该处理嵌套对象', () => {
      const input = {
        user: {
          id: '123',
          name: 'Test',
          profile: {
            age: 25,
            city: 'Beijing'
          }
        }
      }

      const result = serializePrisma(input)

      expect(result).toEqual(input)
      expect(result.user).not.toBe(input.user) // 深拷贝
    })

    it('应该处理数组', () => {
      const input = [
        { id: '1', name: 'First' },
        { id: '2', name: 'Second' },
        { id: '3', name: 'Third' }
      ]

      const result = serializePrisma(input)

      expect(result).toEqual(input)
      expect(result).not.toBe(input)
      expect(result[0]).not.toBe(input[0])
    })

    it('应该处理包含数组的对象', () => {
      const input = {
        id: '123',
        tags: ['tag1', 'tag2', 'tag3'],
        items: [
          { id: '1', value: 10 },
          { id: '2', value: 20 }
        ]
      }

      const result = serializePrisma(input)

      expect(result).toEqual(input)
      expect(result.tags).not.toBe(input.tags)
      expect(result.items).not.toBe(input.items)
    })

    it('应该处理 Date 对象（转换为 ISO 字符串）', () => {
      const date = new Date('2025-10-24T00:00:00.000Z')
      const input = {
        id: '123',
        createdAt: date
      }

      const result = serializePrisma(input)

      expect(result.id).toBe('123')
      expect(result.createdAt).toBe(date.toISOString())
      expect(typeof result.createdAt).toBe('string')
    })

    it('应该处理 null 值', () => {
      const input = {
        id: '123',
        nullValue: null,
        name: 'Test'
      }

      const result = serializePrisma(input)

      expect(result).toEqual(input)
      expect(result.nullValue).toBeNull()
    })

    it('应该处理 undefined 值（转换为 null 或移除）', () => {
      const input = {
        id: '123',
        undefinedValue: undefined,
        name: 'Test'
      }

      const result = serializePrisma(input)

      // undefined 在 JSON.stringify 后会被移除
      expect(result.id).toBe('123')
      expect(result.name).toBe('Test')
      expect('undefinedValue' in result).toBe(false)
    })

    it('应该处理布尔值', () => {
      const input = {
        active: true,
        deleted: false,
        verified: true
      }

      const result = serializePrisma(input)

      expect(result).toEqual(input)
      expect(result.active).toBe(true)
      expect(result.deleted).toBe(false)
    })

    it('应该处理数字（包括0和负数）', () => {
      const input = {
        zero: 0,
        positive: 42,
        negative: -10,
        float: 3.14
      }

      const result = serializePrisma(input)

      expect(result).toEqual(input)
      expect(result.zero).toBe(0)
      expect(result.negative).toBe(-10)
      expect(result.float).toBe(3.14)
    })

    it('应该处理空对象', () => {
      const input = {}
      const result = serializePrisma(input)

      expect(result).toEqual({})
      expect(result).not.toBe(input)
    })

    it('应该处理空数组', () => {
      const input: any[] = []
      const result = serializePrisma(input)

      expect(result).toEqual([])
      expect(result).not.toBe(input)
    })

    it('应该处理复杂的 Prisma 风格对象', () => {
      const input = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-10-24'),
        posts: [
          {
            id: 'post-1',
            title: 'First Post',
            content: 'Content here',
            published: true,
            views: 100,
            tags: ['tech', 'coding']
          },
          {
            id: 'post-2',
            title: 'Second Post',
            content: null,
            published: false,
            views: 0,
            tags: []
          }
        ],
        profile: {
          bio: 'Developer',
          avatar: null,
          settings: {
            theme: 'dark',
            notifications: true
          }
        }
      }

      const result = serializePrisma(input)

      expect(result.id).toBe(input.id)
      expect(result.email).toBe(input.email)
      expect(result.posts).toHaveLength(2)
      expect(result.posts[0].tags).toEqual(['tech', 'coding'])
      expect(result.profile.settings.theme).toBe('dark')
      expect(typeof result.createdAt).toBe('string')
      expect(typeof result.updatedAt).toBe('string')
    })

    it('应该移除函数（JSON 序列化特性）', () => {
      const input = {
        id: '123',
        name: 'Test',
        method: function() { return 'test' }
      }

      const result = serializePrisma(input)

      expect(result.id).toBe('123')
      expect(result.name).toBe('Test')
      expect('method' in result).toBe(false)
    })

    it('应该处理 BigInt（可能抛出错误或转换）', () => {
      const input = {
        id: '123',
        largeNumber: BigInt(9007199254740991)
      }

      // BigInt 无法直接序列化，会抛出错误
      expect(() => serializePrisma(input)).toThrow()
    })

    it('应该处理循环引用（会抛出错误）', () => {
      const input: any = {
        id: '123',
        name: 'Test'
      }
      input.self = input // 循环引用

      // 循环引用会导致 JSON.stringify 抛出错误
      expect(() => serializePrisma(input)).toThrow()
    })

    it('应该保持对象的类型安全', () => {
      interface User {
        id: string
        name: string
        age: number
      }

      const input: User = {
        id: '123',
        name: 'Test',
        age: 25
      }

      const result: User = serializePrisma(input)

      expect(result.id).toBe('123')
      expect(result.name).toBe('Test')
      expect(result.age).toBe(25)
    })
  })
})
