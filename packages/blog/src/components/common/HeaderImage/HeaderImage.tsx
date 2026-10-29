'use client'

import { Box, Flex, Link, LinkProps, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { Trans, useTranslation } from 'react-i18next'

import { FramedImage } from '@blog/components/common/FramedImage'
import { Tag } from '@blog/components/common/Tag'
import { useLocale, useLocalizeHref } from '@blog/hooks'
import { formatPostDate } from '@blog/utils'
import { getImageUrlFromMedia } from '@blog/utils/image/image'
import { buildPostPath } from '@blog/utils/urlBuilder'

interface HeaderImageProps {
  post: Post
  /** The home page's lead story: a rounded card with the title over the photo. */
  showPostInfo?: boolean
}

const TransLink = ({ href, label, ...rest }: LinkProps & { label: string }) => (
  <Link href={href} title={label} target="_blank" rel="noreferrer" color="inherit" {...rest}>
    {label}
  </Link>
)

export function HeaderImage({
  post: {
    id,
    categories,
    title,
    summary,
    publishedAt,
    coverImage,
    imgUrl,
    coverImageAuthor,
    coverImageSourceUrl,
    locale,
    writer,
  },
  showPostInfo,
}: HeaderImageProps) {
  const appLocale = useLocale()
  const localizeHref = useLocalizeHref()
  const { t } = useTranslation('common')
  const renderedCategories = categories?.slice(0, 3) || []
  const parsedDate = formatPostDate(publishedAt)

  const image = (
    <FramedImage
      src={getImageUrlFromMedia({ media: coverImage, fallback: imgUrl })}
      priority
      alt={t('coverImage.imageAlt', { title })}
      focus={coverImage?.focus}
      fit={coverImage?.fit}
      sizes="(max-width: 1248px) 100vw, 1248px"
    />
  )

  const credit = coverImageAuthor && coverImageSourceUrl && (
    <Text textAlign="center" fontFamily="sans" fontSize="12px" pt="8px" color="fg.muted">
      <Trans
        i18nKey="coverImage.author"
        components={{
          link: <TransLink href={coverImageSourceUrl} label={coverImageAuthor} />,
        }}
      />
    </Text>
  )

  // The post's cover: as wide as the page, in the photo's own shape (between 4:3 and 2.4:1) so it
  // shows whole; 16:9 when its size is unknown.
  if (!showPostInfo) {
    const ratio = coverImage?.width && coverImage.height ? coverImage.width / coverImage.height : 16 / 9

    return (
      <Box maxW="1248px" mx="auto" px={{ base: 0, md: 6 }} pt={{ base: 0, md: 6 }}>
        <Box
          position="relative"
          overflow="hidden"
          borderRadius={{ base: 0, md: '18px' }}
          aspectRatio={{ base: 4 / 3, md: Math.min(Math.max(ratio, 4 / 3), 2.4) }}
          bg="border"
        >
          {image}
        </Box>
        {credit}
      </Box>
    )
  }

  return (
    <Box maxW="1248px" mx="auto" px={{ base: 4, md: 6 }} pt={{ base: 4, md: 6 }}>
      <Box
        position="relative"
        overflow="hidden"
        borderRadius={{ base: '14px', md: '18px' }}
        aspectRatio={{ base: 4 / 5, sm: 4 / 3, md: 16 / 9, lg: 2 / 1 }}
        bg="border"
      >
        {image}
        <Box
          position="absolute"
          inset={0}
          background="linear-gradient(to top, rgba(10,10,12,.88) 0%, rgba(10,10,12,.35) 45%, transparent 70%)"
        />
        <Box
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          p={{ base: 5, md: 10, lg: 12 }}
          color="white"
          maxW="860px"
        >
          <Flex gap="8px" flexWrap="wrap">
            {renderedCategories
              .slice()
              .sort((a, b) => a.name.length - b.name.length)
              .concat(appLocale !== locale ? ({ code: 'lang', name: t(`localization.${locale}`) } as Category) : [])
              .map(({ name, translations, code }) => (
                <Tag
                  key={code}
                  variant="solid"
                  label={(translations && translations?.[appLocale as AppLocales]) || name}
                />
              ))}
          </Flex>
          <Link
            asChild
            display="block"
            color="white"
            fontWeight={500}
            fontSize={{ base: '30px', md: '42px', lg: '52px' }}
            lineHeight="1.08"
            letterSpacing="-0.01em"
            mt={{ base: 3, md: 3.5 }}
            mb={{ base: 2, md: 2.5 }}
            lineClamp={3}
            _hover={{ textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '6px' }}
          >
            <NextLink href={localizeHref(buildPostPath(String(id), title))}>{title}</NextLink>
          </Link>
          <Text
            fontStyle="italic"
            fontSize={{ base: '17px', md: '20px' }}
            lineHeight="1.4"
            opacity={0.9}
            lineClamp={{ base: 3, md: 2 }}
            mb={3}
          >
            {summary}
          </Text>
          <Text fontFamily="sans" fontSize="14px" color="whiteAlpha.800">
            {[writer?.name, parsedDate].filter(Boolean).join(' · ')}
          </Text>
        </Box>
      </Box>
      {credit}
    </Box>
  )
}
