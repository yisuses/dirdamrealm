import { Box, Tag, TagLabel, Text, Flex, Divider, useBreakpointValue } from '@chakra-ui/react'
import { format } from 'date-fns'
import Image from 'next/image'

interface HeaderImageProps {
  imgSrc: string
  title: string
  subtitle: string
  date: Date
  categories: string[]
}

export function HeaderImage({ imgSrc, categories, title, subtitle, date }: HeaderImageProps) {
  const isMinWidthMd = useBreakpointValue({ md: true })
  return (
    <Box height={{ base: 250, md: 400, lg: 600 }} position="relative">
      <Image src={imgSrc} layout="fill" height="600px" width="100%" objectFit="cover" />
      <Box
        position="absolute"
        top={{ base: '70px', md: '50%' }}
        ml={{ base: '15px', md: '70px' }}
        mr={{ base: '15px', md: '70px' }}
        maxWidth="530px"
      >
        <Flex gap="10px">
          {categories.map((label, index) => {
            return (
              <Tag
                key={`${label}-${index}`}
                size={isMinWidthMd ? 'md' : 'sm'}
                variant="outline"
                boxShadow="none"
                bgColor="blackAlpha.500"
                mb={{ base: '8px', md: '10px', lg: '15px' }}
              >
                <TagLabel fontFamily="Roboto" textTransform="uppercase" color="white" fontSize={10} fontWeight={700}>
                  {label}
                </TagLabel>
              </Tag>
            )
          })}
        </Flex>
        <Text
          fontWeight={700}
          fontSize={{ base: 'px', md: '26px', lg: '36px' }}
          lineHeight={{ base: '26px', md: '36px', lg: '46px' }}
          color="white"
          textShadow={`0px 4px 3px rgb(0 0 0 / 40%), 0px 8px 13px rgb(0 0 0 / 10%), 0px 18px 23px rgb(0 0 0 / 10%);`}
          mb={{ base: '8px', md: '10px', lg: '15px' }}
        >
          {title}
        </Text>
        <Flex alignItems="flex-start" color="white" fontSize="12px">
          <Text>{format(date, 'dd.MM.yyyy')}</Text>
          <Divider orientation="horizontal" w="45px" pt="9px" m="0 15px" opacity={1} />
          <Text>{subtitle}</Text>
        </Flex>
      </Box>
    </Box>
  )
}
