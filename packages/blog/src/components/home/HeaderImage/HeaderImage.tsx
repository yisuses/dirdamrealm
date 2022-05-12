import { Box, Text, Flex, Divider } from '@chakra-ui/layout'
import { useBreakpointValue } from '@chakra-ui/media-query'
import format from 'date-fns/format'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { Tag } from '../../common/Tag/Tag'

interface HeaderImageProps {
  imgSrc: string
  title: string
  subtitle: string
  date: Date
  categories: ECategoryCode[]
}

export function HeaderImage({ imgSrc, categories, title, subtitle, date }: HeaderImageProps) {
  const isMinWidthMd = useBreakpointValue({ md: true })
  const { t } = useTranslation('common')
  const renderedCategories = categories.slice(0, 3)
  return (
    <Box height={{ base: 350, md: 400, lg: 600 }} position="relative">
      <Image src={imgSrc} layout="fill" objectFit="cover" />
      <Box
        position="absolute"
        top={{ base: '45%', lg: '50%' }}
        ml={{ base: '15px', lg: '70px' }}
        mr={{ base: '15px', lg: '70px' }}
        maxWidth={{ base: '100%', lg: '530px' }}
        bg="transparent.500"
        p="10px"
        borderRadius="5px"
        boxShadow="0px 10px 13px -7px #000000, 0px 2px 20px 17px rgb(0 0 0 / 30%)"
        backgroundColor="rgba(0, 0, 0, .8)"
      >
        <Flex gap="10px">
          {renderedCategories.map((code, index) => (
            <Tag
              mb={{ base: '8px', md: '10px', lg: '15px' }}
              key={`${code}-${index}`}
              size={isMinWidthMd ? 'md' : 'sm'}
              label={t(`categories.${code}` as const)}
            />
          ))}
        </Flex>
        <Text
          fontWeight={700}
          fontSize={{ base: '20px', lg: '30px' }}
          lineHeight={{ base: '35px', lg: '50px' }}
          color="white"
          textShadow="0px 4px 3px rgb(0 0 0 / 40%), 0px 0px 0px rgb(0 0 0 / 10%), 0px 0px 0px rgb(0 0 0 / 10%)"
          mb={{ base: '8px', lg: '15px' }}
          noOfLines={2}
        >
          {title}
        </Text>
        <Flex
          flexDirection={{ base: 'column', lg: 'row' }}
          alignItems="flex-start"
          color="white"
          fontWeight="600"
          fontSize={{ base: '12px', lg: '14px' }}
        >
          <Text mb={{ base: 2, lg: 0 }}>{format(date, 'dd.MM.yyyy')}</Text>
          <Divider
            display={{ base: 'none', lg: 'block' }}
            orientation="horizontal"
            w="45px"
            pt="9px"
            m="0 15px"
            opacity={1}
          />
          <Text noOfLines={{ base: 3, md: 4, lg: 7 }} fontStyle="italic" fontFamily="spartan">
            {subtitle}
          </Text>
        </Flex>
      </Box>
    </Box>
  )
}
