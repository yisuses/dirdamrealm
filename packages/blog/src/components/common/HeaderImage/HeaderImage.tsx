'use client'

import { Box, Flex, Link, LinkProps, Separator, Text } from '@chakra-ui/react'
import Image from 'next/image'
import NextLink from 'next/link'
import { Trans, useTranslation } from 'react-i18next'

import { Tag } from '@blog/components/common/Tag'
import { useLocale, useLocalizeHref } from '@blog/hooks'
import { formatPostDate } from '@blog/utils'
import { getImageUrlFromMedia } from '@blog/utils/image/image'
import { buildPostPath } from '@blog/utils/urlBuilder'

interface HeaderImageProps {
  post: Post
  showPostInfo?: boolean
}

const TransLink = ({ href, label, ...rest }: LinkProps & { label: string }) => (
  <Link href={href} title={label} target="_blank" rel="noreferrer" {...rest}>
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
  },
  showPostInfo,
}: HeaderImageProps) {
  const appLocale = useLocale()
  const localizeHref = useLocalizeHref()
  const { t } = useTranslation('common')
  const renderedCategories = categories?.slice(0, 3) || []
  const parsedDate = formatPostDate(publishedAt)

  return (
    <Box>
      <Box height={{ base: 350, md: 400, lg: 600 }} position="relative">
        <Image
          src={getImageUrlFromMedia({ media: coverImage, fallback: imgUrl })}
          fill
          priority
          alt={t('coverImage.imageAlt', { title })}
          style={{ objectFit: 'cover' }}
        />
        {showPostInfo && (
          <Box
            position="absolute"
            bottom="30px"
            left="30px"
            right={{ base: '30px', lg: 'unset' }}
            maxWidth={{ base: '100%', lg: '530px' }}
            p="24px"
            borderRadius="5px"
            boxShadow="2px 2px 32px #0007"
            backgroundColor="whiteAlpha.900"
            css={{
              '@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none))': {
                backdropFilter: 'blur(5px)',
                backgroundColor: 'rgba(255,255,255,0.8)',
              },
            }}
            color="gray.800"
          >
            <Flex gap="10px" justifyContent="end">
              {renderedCategories
                .sort((a, b) => a.name.length - b.name.length)
                .concat(appLocale !== locale ? ({ code: 'lang', name: t(`localization.${locale}`) } as Category) : [])
                .map(({ name, translations, code }) => (
                  <Tag
                    mb={{ base: '8px', md: '12px', lg: '16px' }}
                    key={code}
                    size="md"
                    label={(translations && translations?.[appLocale as AppLocales]) || name}
                  />
                ))}
            </Flex>
            <Link
              as={NextLink}
              href={localizeHref(buildPostPath(String(id), title))}
              fontWeight={700}
              fontSize={{ base: '16px', lg: '32px' }}
              lineHeight={{ base: '20px', lg: '40px' }}
              mb={{ base: '8px', lg: '16px' }}
              lineClamp={{ base: 1, lg: 2 }}
              _hover={{
                textDecorationColor: 'white',
                textDecoration: 'underline',
                textShadow: 'none',
              }}
            >
              {title}
            </Link>
            <Flex
              flexDirection={{ base: 'column', lg: 'row' }}
              alignItems="flex-start"
              fontWeight="600"
              fontSize={{ base: '12px', lg: '14px' }}
            >
              <Text mb={{ base: 2, lg: 0 }} lineHeight="24px">
                {parsedDate}
              </Text>
              <Separator
                display={{ base: 'none', lg: 'block' }}
                orientation="horizontal"
                w="45px"
                pt="12px"
                m="0 16px"
                opacity={1}
                borderColor="currentColor"
              />
              <Text
                fontSize={{ base: '12px', lg: '16px' }}
                lineClamp={{ base: 2, md: 3, lg: 5 }}
                fontStyle="italic"
                fontFamily="Roboto"
                fontWeight={500}
              >
                {summary}
              </Text>
            </Flex>
          </Box>
        )}
      </Box>
      {coverImageAuthor && coverImageSourceUrl && (
        <Text textAlign="center" fontFamily="Roboto" fontSize="12px" pt="8px" fontWeight={500}>
          <Trans
            i18nKey="coverImage.author"
            components={{
              link: <TransLink href={coverImageSourceUrl} label={coverImageAuthor} />,
            }}
          />
        </Text>
      )}
    </Box>
  )
}
