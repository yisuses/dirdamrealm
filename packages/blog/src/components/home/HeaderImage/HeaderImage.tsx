import { Box, Text, Flex, Divider, useBreakpointValue } from '@chakra-ui/react'
import { Tag } from '@whe/common'
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
  const renderedCategories = categories.slice(0, 3)
  return (
    <Box height={{ base: 250, md: 400, lg: 600 }} position="relative">
      <Image src={imgSrc} layout="fill" objectFit="cover" />
      <Box
        position="absolute"
        top={{ base: '45%', md: '50%' }}
        ml={{ base: '15px', md: '70px' }}
        mr={{ base: '15px', md: '70px' }}
        maxWidth="530px"
        bg="rgba(0,0,0,0.25)"
        p="10px"
        borderRadius="5px"
      >
        <Flex gap="10px">
          {renderedCategories.map((label, index) => (
            <Tag
              mb={{ base: '8px', md: '10px', lg: '15px' }}
              key={`${label}-${index}`}
              size={isMinWidthMd ? 'md' : 'sm'}
              label={label}
            />
          ))}
        </Flex>
        <Text
          fontWeight={700}
          fontSize={{ base: 'px', md: '26px', lg: '36px' }}
          lineHeight={{ base: '26px', md: '36px', lg: '46px' }}
          color="white"
          textShadow={`0px 4px 3px rgb(0 0 0 / 40%), 0px 8px 13px rgb(0 0 0 / 10%), 0px 18px 23px rgb(0 0 0 / 10%);`}
          mb={{ base: '8px', md: '10px', lg: '15px' }}
          noOfLines={2}
        >
          {title}
        </Text>
        <Flex alignItems="flex-start" color="white" fontSize="12px">
          <Text>{format(date, 'dd.MM.yyyy')}</Text>
          <Divider
            display={{ base: 'none', md: 'block' }}
            orientation="horizontal"
            w="45px"
            pt="9px"
            m="0 15px"
            opacity={1}
          />
          <Text display={{ base: 'none', md: 'block' }} noOfLines={2}>
            {subtitle}
          </Text>
        </Flex>
      </Box>
    </Box>
  )
}
