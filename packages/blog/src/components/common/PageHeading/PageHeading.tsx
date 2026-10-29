'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'

import { Tag } from '../Tag'

interface PageHeadingProps {
  /** Small gold line above the title, e.g. "Categoría". */
  kicker: string
  title: string
  description?: string
  children?: ReactNode
}

/** The title block that opens a listing page (a category, the archive). */
export function PageHeading({ kicker, title, description, children }: PageHeadingProps) {
  return (
    <Box pt={{ base: 8, md: 14 }} pb={2}>
      <Tag label={kicker} />
      <Heading
        as="h1"
        fontSize={{ base: '40px', md: '56px' }}
        lineHeight="1.05"
        fontWeight={500}
        letterSpacing="-0.01em"
        mt={2}
        mb={2.5}
      >
        {title}
      </Heading>
      {description && (
        <Text fontSize={{ base: '19px', md: '21px' }} fontStyle="italic" color="fg.muted">
          {description}
        </Text>
      )}
      {children}
    </Box>
  )
}
