/* eslint-disable import/no-duplicates */
import { Text, Box, Divider as DividerLine, Flex, Center, Heading, Stack } from '@chakra-ui/layout'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import { Content, HeaderImage, Metadata, SocialButton } from '@components/common'
import { blogUrl, fixedEncodeURIComponent } from '@utils'
import { getReadingTime } from '@utils/getReadingTime'
import FacebookIcon from '../../../../public/icon/facebook.svg'
import LinkedinIcon from '../../../../public/icon/linkedin.svg'
import ShareIcon from '../../../../public/icon/share.svg'
import TwitterIcon from '../../../../public/icon/twitter.svg'

export interface PostPageProps {
  post: Post
}

export function PostPage({ post }: PostPageProps) {
  const { t } = useTranslation('postPage')
  const { asPath, locale, defaultLocale } = useRouter()
  //TODO ldjson

  const postUrl = fixedEncodeURIComponent(blogUrl(asPath, locale as string, defaultLocale))
  const shareButtonsData: {
    label: string
    icon: React.FC<React.SVGProps<SVGSVGElement>>
    href?: string
    onClick?: () => void
  }[] = [
    {
      label: t('postPage.share', { socialNetwork: 'Twitter' }),
      href: `https://twitter.com/intent/tweet?text=${post.title}&url=${postUrl}`,
      icon: TwitterIcon,
    },
    {
      label: t('postPage.share', { socialNetwork: 'Facebook' }),
      href: `https://www.facebook.com/sharer/sharer.php?u=${postUrl}`,
      icon: FacebookIcon,
    },
    {
      label: t('postPage.share', { socialNetwork: 'Linkedin' }),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`,
      icon: LinkedinIcon,
    },
    {
      label: t('postPage.share', { socialNetwork: '...' }),
      icon: ShareIcon,
      onClick: () => navigator.share({ url: postUrl, text: post.title, title: post.title }),
    },
  ]

  const socialButtons = shareButtonsData.map(({ label, href, icon: Icon, onClick }, index) => (
    <SocialButton key={index} label={label} href={href} onClick={onClick}>
      <Icon width={24} height={24} />
    </SocialButton>
  ))

  return (
    <>
      <Metadata
        name={t('postPage.title', { postName: post.title })}
        description={post.summary}
        imageUrl={post.coverImage?.url}
      />

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
            <Flex
              fontSize="14px"
              direction={{ base: 'column', md: 'row' }}
              mt={6}
              alignItems={{ base: 'flex-start', md: 'center' }}
            >
              <Text as="i" display="block">
                {t('postPage.author', { name: post.writer?.name })}
              </Text>
              <Flex
                mt={{ base: '8px', md: 0 }}
                height="fit-content"
                justifyContent="space-between"
                alignItems="center"
                width={{ base: '100%', md: 'auto' }}
                grow={1}
                wrap="wrap"
              >
                <Flex height="fit-content">
                  <Center h="22px" display={{ base: 'none', md: 'flex' }}>
                    <DividerLine orientation="horizontal" w="20px" mx="16px" borderColor="blackAlpha.800" />
                  </Center>
                  <Text>{format(parseISO(post.publishedAt), 'dd.MM.yyyy')}</Text>
                  <Center h="22px">
                    <DividerLine orientation="horizontal" w="20px" mx="16px" borderColor="blackAlpha.800" />
                  </Center>
                  <Text>{t('postPage.readingTime', { minutes: getReadingTime(post.content) })}</Text>
                </Flex>
                <Stack direction="row" spacing={2} ml={{ base: 0, md: 'auto' }}>
                  {socialButtons}
                </Stack>
              </Flex>
            </Flex>
          </Box>
          <Flex direction="column" width="100%" justifyContent="center" mt="52px">
            <Content content={post.content} />
          </Flex>
          <Stack direction="row" spacing={2} ml="auto" pt={8}>
            {socialButtons}
          </Stack>
        </Flex>
      </Flex>
    </>
  )
}
