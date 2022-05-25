/* eslint-disable import/no-duplicates */
import { Text, Box, Divider as DividerLine, Flex, Center, Heading, Stack } from '@chakra-ui/layout'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import { Content, HeaderImage, Metadata, SocialButton } from '@components/common'
import { getReadingTime } from '@utils/getReadingTime'
import FacebookIcon from '../../../../public/icon/facebook.svg'
import LinkedinIcon from '../../../../public/icon/linkedin.svg'
import TwitterIcon from '../../../../public/icon/twitter.svg'

export interface PostPageProps {
  post: Post
}

export function PostPage({ post }: PostPageProps) {
  const { t } = useTranslation('postPage')
  const { asPath } = useRouter()
  //TODO ldjson

  const shareButtons: {
    label: string
    href: string
    icon: React.FC<React.SVGProps<SVGSVGElement>>
  }[] = [
    {
      label: 'Twitter',
      href: `https://twitter.com/intent/tweet?text=${post.title}&url=${asPath}`,
      icon: TwitterIcon,
    },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${asPath}`, icon: FacebookIcon },
    {
      label: 'Linkedin',
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${asPath}&title=${post.title}`,
      icon: LinkedinIcon,
    },
  ]

  return (
    <>
      <Metadata name={t('postPage.title', { postName: post.title })} description={post.summary} />

      <HeaderImage post={post} />

      <Flex justifyContent="center" mx="16px" my={{ base: '40px', md: '100px' }}>
        <Flex direction="column" justifyContent="flex-start" width="100%" maxW="65ch">
          <Box>
            <Heading
              as="h1"
              fontSize={{ base: '32px', md: '52px' }}
              lineHeight={{ base: '44px', md: '64px' }}
              fontFamily="Lora"
            >
              {post.title}
            </Heading>
            <Flex fontSize="14px" direction={{ base: 'column', md: 'row' }} mt={6} alignItems="center">
              <Text as="i" display="block">
                {t('postPage.author', { name: post.writer?.name })}
              </Text>
              <Flex mt={{ base: '8px', md: 0 }} height="fit-content">
                <Center h="22px" display={{ base: 'none', md: 'flex' }}>
                  <DividerLine orientation="horizontal" w="20px" mx="16px" borderColor="blackAlpha.800" />
                </Center>
                <Text>{format(parseISO(post.publishedAt), 'dd.MM.yyyy')}</Text>
                <Center h="22px">
                  <DividerLine orientation="horizontal" w="20px" mx="16px" borderColor="blackAlpha.800" />
                </Center>
                <Text>{t('postPage.readingTime', { minutes: getReadingTime(post.content) })}</Text>
              </Flex>
              <Stack direction="row" spacing={3}>
                {shareButtons.map(({ label, href, icon: Icon }, index) => (
                  <SocialButton key={index} label={label} href={href}>
                    <Icon width={24} height={24} />
                  </SocialButton>
                ))}
              </Stack>
            </Flex>
          </Box>
          <Flex direction="column" width="100%" justifyContent="center" mt="52px">
            <Content content={post.content} />
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}
