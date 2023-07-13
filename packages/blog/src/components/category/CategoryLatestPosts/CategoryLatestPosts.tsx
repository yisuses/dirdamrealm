import { Flex, Heading } from '@chakra-ui/layout'

import { PostGrid } from '@blog/components'

interface CategoryLatestPostsProps {
  title: string
  posts: Post[]
}

export function CategoryLatestPosts({ title, posts }: CategoryLatestPostsProps) {
  return (
    <Flex flexDir="column" mt={{ base: '60px', md: '130px' }} mb="60px" px="20px">
      <Heading fontFamily="Lora">{title}</Heading>
      <PostGrid posts={posts} />
    </Flex>
  )
}
