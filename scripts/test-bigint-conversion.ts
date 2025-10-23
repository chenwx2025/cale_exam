// 测试 BigInt 转换函数
function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'bigint') {
    return Number(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntToNumber(item))
  }

  if (typeof obj === 'object') {
    const converted: any = {}
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key])
    }
    return converted
  }

  return obj
}

// 测试数据
const testData = [
  {
    date: '2025-10-22',
    count: 5n  // BigInt
  },
  {
    date: '2025-10-21',
    count: 10n
  }
]

console.log('原始数据类型:', typeof testData[0].count)
console.log('原始数据值:', testData[0].count)

const converted = convertBigIntToNumber(testData)
console.log('\n转换后数据类型:', typeof converted[0].count)
console.log('转换后数据值:', converted[0].count)

console.log('\n尝试序列化原始数据:')
try {
  JSON.stringify(testData)
  console.log('✅ 成功')
} catch (e: any) {
  console.log('❌ 失败:', e.message)
}

console.log('\n尝试序列化转换后数据:')
try {
  const json = JSON.stringify(converted)
  console.log('✅ 成功:', json)
} catch (e: any) {
  console.log('❌ 失败:', e.message)
}
