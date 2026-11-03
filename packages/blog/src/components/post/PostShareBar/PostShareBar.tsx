'use client'

import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import { ReactNode, RefObject, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// The site's sticky menu bar: 46px plus its two borders.
const MENU_HEIGHT = 48

interface PostShareBarProps {
  title: string
  /** The share buttons. */
  children: ReactNode
  /** The bar shows once this element (the byline) has scrolled up under the menu bar. */
  trigger: RefObject<HTMLElement | null>
  /** The text being read, for the progress line. */
  article: RefObject<HTMLElement | null>
}

/**
 * A bar under the site's sticky menu with the post's title and its share buttons, so a reader
 * can share from anywhere in a long post. A gold line along its bottom shows how far they've read.
 */
export function PostShareBar({ title, children, trigger, article }: PostShareBarProps) {
  const { t } = useTranslation('postPage')
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      // Shown once the byline has gone up under the site's menu bar.
      setVisible(trigger.current!.getBoundingClientRect().bottom < MENU_HEIGHT)
      const { top, height } = article.current!.getBoundingClientRect()
      const scrollable = height - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(Math.max(-top / scrollable, 0), 1) : 1)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <Box
      data-testid="post-share-bar"
      aria-hidden={!visible}
      position="fixed"
      // Right under the site's sticky menu bar, and behind it while hidden.
      top={`${MENU_HEIGHT}px`}
      left={0}
      right={0}
      zIndex={1099}
      bg="color-mix(in srgb, var(--chakra-colors-bg) 94%, transparent)"
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor="border"
      boxShadow="0 6px 20px rgba(0,0,0,.06)"
      transform={visible ? 'translateY(0)' : 'translateY(-100%)'}
      visibility={visible ? 'visible' : 'hidden'}
      transition="transform .25s ease, visibility .25s"
    >
      <Flex maxW="1248px" mx="auto" px={{ base: 4, md: 6 }} h="54px" alignItems="center" gap={4}>
        <Text flex={1} minW={0} truncate fontFamily="heading" fontWeight={500} fontSize={{ base: '16px', md: '18px' }}>
          {title}
        </Text>
        <Stack direction="row" gap={2} flex="none">
          {children}
        </Stack>
      </Flex>
      <Box
        role="progressbar"
        aria-label={t('postPage.readingProgress')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        position="absolute"
        left={0}
        bottom="-1px"
        w="100%"
        h="2px"
        bg="accent"
        transform={`scaleX(${progress})`}
        transformOrigin="left"
      />
    </Box>
  )
}
