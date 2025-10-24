import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkReplies() {
  // 查询所有回复
  const replies = await prisma.studyGroupPostReply.findMany({
    where: { postId: 'cmh3qkdl2000crtevpu1welzj' }
  });
  
  console.log('数据库中的回复数量:', replies.length);
  console.log('回复数据:', JSON.stringify(replies, null, 2));
  
  // 查询帖子及其关联的回复
  const post = await prisma.studyGroupPost.findUnique({
    where: { id: 'cmh3qkdl2000crtevpu1welzj' },
    include: {
      replies: true
    }
  });
  
  console.log('\n使用 include 查询到的回复数量:', post?.replies?.length || 0);
  
  await prisma.$disconnect();
}

checkReplies().catch(console.error);
