'use client'

import { Flex, Link, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { useLocalizeHref } from '@blog/hooks'
import { buildBlurDataUrl, buildPostPath, formatPostDate } from '@blog/utils'

import { FramedImage } from '../FramedImage'
import { Tag } from '../Tag'

export type PostCardProps = {
  id: number
  categories: { key: string; label: string }[]
  date: string
  title: string
  description: string
  imageUrl: string
  imageFocus?: ImageFocus
  imageFit?: ImageFit
  locale: string
  isSameLocale: boolean
}

export function PostCard({
  id,
  categories,
  date,
  description,
  imageUrl,
  imageFocus,
  imageFit,
  title,
  isSameLocale,
  locale,
}: PostCardProps) {
  const localizeHref = useLocalizeHref()
  const postLink = localizeHref(buildPostPath(String(id), title))
  const parsedDate = formatPostDate(date)
  const tags = categories
    .slice()
    .sort((a, b) => a.label.length - b.label.length)
    .concat(!isSameLocale ? { key: 'lang', label: locale } : [])

  return (
    <Flex
      direction="column"
      w="100%"
      role="group"
      css={{
        '& .post-card-image': { transition: 'transform .5s ease' },
        '&:hover .post-card-image': { transform: 'scale(1.04)' },
      }}
    >
      <Link
        asChild
        display="block"
        position="relative"
        overflow="hidden"
        borderRadius="12px"
        aspectRatio={4 / 3}
        bg="border"
      >
        <NextLink href={postLink} tabIndex={-1}>
          <FramedImage
            src={imageUrl}
            alt={`${title} image`}
            focus={imageFocus}
            fit={imageFit}
            className="post-card-image"
            placeholder="blur"
            blurDataURL={buildBlurDataUrl(280, 280)}
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 400px"
          />
        </NextLink>
      </Link>
      <Flex gap="10px" flexWrap="wrap" mt={4} mb={1.5}>
        {tags.map(({ key, label }) => (
          <Tag key={key} label={label} />
        ))}
      </Flex>
      <Link
        asChild
        fontSize={{ base: '23px', md: '25px' }}
        lineHeight="1.2"
        fontWeight={500}
        color="fg"
        lineClamp={3}
        title={title}
        _hover={{ color: 'accent', textDecoration: 'none' }}
        _groupHover={{ color: 'accent' }}
      >
        <NextLink href={postLink}>{title}</NextLink>
      </Link>
      <Text mt={2} fontSize="17px" lineHeight="1.5" color="fg.muted" lineClamp={3} title={description}>
        {description}
      </Text>
      <Text mt={2.5} fontFamily="sans" fontSize="14px" color="fg.muted">
        {parsedDate}
      </Text>
    </Flex>
  )
}
