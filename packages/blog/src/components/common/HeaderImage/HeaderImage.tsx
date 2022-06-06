/* eslint-disable import/no-duplicates */
import { Box, Text, Flex, Divider, Link, LinkProps } from '@chakra-ui/layout'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { Trans } from 'next-i18next'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

import { Tag } from '@components/common/Tag/Tag'
import { getImageUrlFromMedia } from '@utils/image'
import { buildPostPath } from '@utils/urlBuilder'

interface HeaderImageProps {
  post: Post
  showPostInfo?: boolean
}

const TransLink = ({ href, label, ...rest }: LinkProps & { label: string }) => (
  <Link href={href} target="_blank" title={label} rel="noreferrer" {...rest}>
    {label}
  </Link>
)

export function HeaderImage({
  post: { id, categories, title, summary, publishedAt, coverImage, imgUrl, coverImageAuthor, coverImageSourceUrl },
  showPostInfo,
}: HeaderImageProps) {
  const { locale: appLocale } = useRouter()
  const renderedCategories = categories?.slice(0, 3) || []
  return (
    <Box>
      <Box height={{ base: 350, md: 400, lg: 600 }} position="relative">
        <Image
          src={getImageUrlFromMedia({ media: coverImage, fallback: imgUrl })}
          layout="fill"
          objectFit="cover"
          priority
        />
        {showPostInfo && (
          <Box
            position="absolute"
            top={{ base: '45%', lg: '50%' }}
            ml={{ base: '15px', lg: '70px' }}
            mr={{ base: '15px', lg: '70px' }}
            maxWidth={{ base: '100%', lg: '530px' }}
            p="24px"
            borderRadius="5px"
            boxShadow="2px 2px 32px #0007"
            backgroundColor="blackAlpha.800"
            css={{
              '@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none))': {
                backdropFilter: 'blur(5px)',
                backgroundColor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <Flex gap="10px">
              {renderedCategories.map(({ name, locale, code }) => (
                <Tag
                  mb={{ base: '8px', md: '12px', lg: '16px' }}
                  key={code}
                  size="md"
                  label={(locale && locale?.[appLocale as AppLocales]) || name}
                />
              ))}
            </Flex>
            <NextLink href={buildPostPath(String(id), title)} passHref>
              <Link
                fontWeight={700}
                fontSize={{ base: '16px', lg: '32px' }}
                lineHeight={{ base: '20px', lg: '40px' }}
                color="white"
                textShadow="0px 4px 3px rgb(0 0 0 / 40%), 0px 0px 0px rgb(0 0 0 / 10%), 0px 0px 0px rgb(0 0 0 / 10%)"
                mb={{ base: '8px', lg: '16px' }}
                noOfLines={{ base: 1, lg: 2 }}
                _hover={{
                  textDecorationColor: 'white',
                  textDecoration: 'underline',
                  textShadow: 'none',
                }}
              >
                {title}
              </Link>
            </NextLink>
            <Flex
              flexDirection={{ base: 'column', lg: 'row' }}
              alignItems="flex-start"
              color="white"
              fontWeight="600"
              fontSize={{ base: '12px', lg: '14px' }}
            >
              <Text mb={{ base: 2, lg: 0 }}>{format(parseISO(publishedAt), 'dd.MM.yyyy')}</Text>
              <Divider
                display={{ base: 'none', lg: 'block' }}
                orientation="horizontal"
                w="45px"
                pt="8px"
                m="0 16px"
                opacity={1}
              />
              <Text
                fontSize={{ base: '12px', lg: '16px' }}
                noOfLines={{ base: 2, md: 3, lg: 5 }}
                fontStyle="italic"
                fontFamily="spartan"
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
              link: <TransLink href={coverImageSourceUrl} target="_blank" rel="noreferrer" label={coverImageAuthor} />,
            }}
          />
        </Text>
      )}
    </Box>
  )
}
