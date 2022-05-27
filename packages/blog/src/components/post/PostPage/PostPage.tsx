/* eslint-disable import/no-duplicates */
import { Text, Box, Divider as DividerLine, Flex, Center, Heading, Stack } from '@chakra-ui/layout'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { BlogPosting } from 'schema-dts'

import { Content, HeaderImage, Metadata, SocialButton } from '@components/common'
import { useGetLocalePublicUrl } from '@hooks/useGetLocalePublicUrl'
import {
  fixedEncodeURIComponent,
  publicUrl,
  buildPostPath,
  getImageUrlFromMedia,
  getImageDataFromMedia,
  getReadingTime,
  getPlainText,
} from '@utils'
import FacebookIcon from '../../../../public/icon/facebook.svg'
import LinkedinIcon from '../../../../public/icon/linkedin.svg'
import ShareIcon from '../../../../public/icon/share.svg'
import TwitterIcon from '../../../../public/icon/twitter.svg'

export interface PostPageProps {
  post: Post
  about: About
}

export function PostPage({ post, about }: PostPageProps) {
  const { t } = useTranslation('postPage')
  const { asPath } = useRouter()
  const generateLocalePublicUrl = useGetLocalePublicUrl()
  const {
    id,
    title,
    content,
    coverImage,
    imgUrl,
    locale: postLocale,
    createdAt,
    publishedAt,
    updatedAt,
    categories,
    summary,
    writer,
  } = post
  const postUrl = fixedEncodeURIComponent(generateLocalePublicUrl(asPath))
  const postSocialTitle = t('postPage.shareTitle', { title })

  const shareButtonsData: {
    label: string
    icon: React.FC<React.SVGProps<SVGSVGElement>>
    href?: string
    onClick?: () => void
  }[] = [
    {
      label: t('postPage.share', { socialNetwork: 'Twitter' }),
      href: `https://twitter.com/intent/tweet?text=${postSocialTitle}&url=${postUrl}`,
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
      onClick: () => navigator.share({ url: postUrl, text: postSocialTitle, title: title }),
    },
  ]

  const socialButtons = shareButtonsData.map(({ label, href, icon: Icon, onClick }, index) => (
    <SocialButton key={index} label={label} href={href} onClick={onClick}>
      <Icon width={24} height={24} />
    </SocialButton>
  ))

  const extraMetaTags = [
    { name: 'og:updated_time', content: publishedAt },
    { name: 'article:published_time', content: publishedAt },
    { name: 'article:modified_time', content: updatedAt || '' },
    { name: 'article:section', content: categories?.[0].localizedName || '' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: summary },
    { name: 'twitter:creator', content: writer?.twitter || about.twitter || '' },
    {
      name: 'twitter:image',
      content: getImageUrlFromMedia({ media: coverImage, format: 'small', fallback: imgUrl }),
    },
    { name: 'twitter:image:alt', content: coverImage ? coverImage.caption : '' },
  ]

  const ldJson: BlogPosting = {
    '@type': 'BlogPosting',
    headline: title,
    name: title,
    alternativeHeadline: summary,
    dateCreated: createdAt,
    datePublished: publishedAt,
    dateModified: updatedAt,
    inLanguage: postLocale,
    isFamilyFriendly: true,
    copyrightYear: parseISO(publishedAt).getFullYear(),
    ...(coverImage && {
      image: {
        '@type': 'ImageObject',
        url: getImageUrlFromMedia({ media: coverImage, format: 'medium', fallback: imgUrl }),
        width: getImageDataFromMedia({ media: coverImage, format: 'medium' })?.width.toString() || '',
        height: getImageDataFromMedia({ media: coverImage, format: 'medium' })?.height.toString() || '',
      },
      thumbnailUrl: getImageUrlFromMedia({ media: coverImage, format: 'small' }),
    }),
    author: {
      '@type': 'Person',
      name: writer?.name,
      url: writer?.personalUrl || '',
    },
    creator: {
      '@type': 'Person',
      name: writer?.name,
      url: writer?.personalUrl || '',
    },
    publisher: {
      '@type': 'Organization',
      name: 'White Emotion',
      url: 'https://whemotion.com',
      logo: {
        '@type': 'ImageObject',
        url: publicUrl('/images/WElogo.png'),
        width: '500',
        height: '500',
      },
    },
    mainEntityOfPage: generateLocalePublicUrl(buildPostPath(id.toString(), title)),
    // keywords: post.tags?.map(({ name }) => name) || [],
    articleSection: categories?.[0].localizedName || '',
    articleBody: getPlainText(content),
  }

  return (
    <>
      <Metadata
        type="article"
        name={t('postPage.title', { postName: title })}
        description={summary}
        imageUrl={getImageUrlFromMedia({ media: coverImage, format: 'medium', fallback: imgUrl })}
        extraMetaTags={extraMetaTags}
        ldJson={[ldJson]}
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
              {title}
            </Heading>
            <Flex
              fontSize="14px"
              direction={{ base: 'column', md: 'row' }}
              mt={6}
              alignItems={{ base: 'flex-start', md: 'center' }}
            >
              <Text as="i" display="block">
                {t('postPage.author', { name: writer?.name })}
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
                  <Text>{format(parseISO(publishedAt), 'dd.MM.yyyy')}</Text>
                  <Center h="22px">
                    <DividerLine orientation="horizontal" w="20px" mx="16px" borderColor="blackAlpha.800" />
                  </Center>
                  <Text>{t('postPage.readingTime', { minutes: getReadingTime(content) })}</Text>
                </Flex>
                <Stack direction="row" spacing={2} ml={{ base: 0, md: 'auto' }}>
                  {socialButtons}
                </Stack>
              </Flex>
            </Flex>
          </Box>
          <Flex direction="column" width="100%" justifyContent="center" mt="52px">
            <Content content={content} />
          </Flex>
          <Stack direction="row" spacing={2} ml="auto" pt={8}>
            {socialButtons}
          </Stack>
        </Flex>
      </Flex>
    </>
  )
}
