import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixLikeCounts() {
  console.log('开始修复点赞计数...\n')

  // 修复帖子点赞计数
  const posts = await prisma.studyGroupPost.findMany({
    include: {
      likes: true
    }
  })

  console.log(`找到 ${posts.length} 个帖子\n`)

  for (const post of posts) {
    const actualLikeCount = post.likes.length
    const currentLikeCount = post.likeCount

    if (actualLikeCount !== currentLikeCount) {
      console.log(`修复帖子: ${post.title || post.id}`)
      console.log(`  当前 likeCount: ${currentLikeCount}`)
      console.log(`  实际点赞数: ${actualLikeCount}`)

      await prisma.studyGroupPost.update({
        where: { id: post.id },
        data: { likeCount: actualLikeCount }
      })

      console.log(`  ✅ 已修复为: ${actualLikeCount}\n`)
    } else {
      console.log(`✓ 帖子 "${post.title || post.id}" 的点赞计数正确 (${actualLikeCount})`)
    }
  }

  // 修复回复点赞计数
  const replies = await prisma.studyGroupPostReply.findMany({
    include: {
      likes: true
    }
  })

  console.log(`\n找到 ${replies.length} 个回复\n`)

  for (const reply of replies) {
    const actualLikeCount = reply.likes.length
    // StudyGroupPostReply 模型没有 likeCount 字段，所以我们只检查不修复
    console.log(`回复 ${reply.id}: ${actualLikeCount} 个点赞`)
  }

  console.log('\n✅ 所有点赞计数已修复！')
}

fixLikeCounts()
  .catch((error) => {
    console.error('修复失败:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
