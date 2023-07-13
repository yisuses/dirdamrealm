/* eslint-disable import/no-duplicates */
import { useColorModeValue } from '@chakra-ui/color-mode'
import { Box, Flex, Link, Text } from '@chakra-ui/layout'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import NextImage from 'next/image'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'

import { Tag } from '@blog/components'
import { buildBlurDataUrl, buildPostPath } from '@blog/utils'
import { DATE_FORMAT } from '@blog/utils/constants'

export type PostCardProps = {
  id: number
  categories: { key: string; label: string }[]
  date: string
  title: string
  description: string
  imageUrl: string
  locale: string
  isSameLocale: boolean
}

export function PostCard({ id, categories, date, description, imageUrl, title, isSameLocale, locale }: PostCardProps) {
  const postLink = buildPostPath(String(id), title)
  const [parsedDate, setParsedDate] = useState<string>(date.split('T')[0])

  useEffect(() => {
    setParsedDate(format(parseISO(date), DATE_FORMAT))
  }, [date])

  return (
    <Flex direction="column" w={{ base: '100%', md: '280px' }} h="450px" gap="15px">
      <Box
        w="100%"
        h="280px"
        position="relative"
        overflow="hidden"
        borderRadius="4px"
        _hover={{
          img: {
            transform: 'scale(1.1,1.1) rotate(1deg)',
            transition: 'all 1s',
          },
        }}
      >
        <Flex
          pl="20px"
          position="absolute"
          top="20px"
          right="24px"
          flexWrap="wrap"
          gap="10px"
          justifyContent="flex-end"
          zIndex={1}
        >
          {categories
            .sort((a, b) => a.label.length - b.label.length)
            .concat(!isSameLocale ? { key: 'lang', label: locale } : [])
            .map(({ key, label }) => (
              <Tag key={key} label={label} />
            ))}
        </Flex>
        <Link as={NextLink} href={postLink} position="relative" display="block" width="100%" height="100%">
          <NextImage
            src={imageUrl}
            alt={`${title} image`}
            fill
            style={{ transition: 'all .5s', objectFit: 'cover' }}
            placeholder="blur"
            blurDataURL={buildBlurDataUrl(280, 280)}
            sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
          />
        </Link>
      </Box>
      <Text fontSize="xs" color={useColorModeValue('gray.750', 'gray.50')}>
        {parsedDate}
      </Text>
      <Link
        as={NextLink}
        href={postLink}
        fontSize="lg"
        color={useColorModeValue('gray.950', 'white')}
        fontWeight={700}
        noOfLines={2}
        title={title}
      >
        {title}
      </Link>
      <Text fontSize="xs" color={useColorModeValue('gray.750', 'gray.50')} noOfLines={3} title={description}>
        {description}
      </Text>
    </Flex>
  )
}
