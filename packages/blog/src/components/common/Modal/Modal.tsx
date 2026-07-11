'use client'

import { useBreakpointValue } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useRef } from 'react'

import { useColorModeValue } from '@blog/components/ui/color-mode'
import { DialogBody, DialogCloseTrigger, DialogContent, DialogHeader, DialogRoot } from '@blog/components/ui/dialog'

export type ModalProps = {
  onClose: () => void
  isOpen: boolean
  children?: ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const pathname = usePathname()
  const isFirstRender = useRef(true)
  const modalSize = useBreakpointValue<'full' | 'xl'>({
    base: 'full',
    md: 'xl',
  })
  const contentBg = useColorModeValue('white', 'gray.800')

  // Close the modal on client navigation (replaces router.events 'routeChangeStart').
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    onClose()
  }, [pathname])

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={details => {
        if (!details.open) onClose()
      }}
      size={modalSize}
    >
      <DialogContent
        bg={contentBg}
        minWidth={{ base: '100%', md: '700px', lg: '800px', xl: '900px' }}
        height={{ md: '700px' }}
      >
        {title && (
          <DialogHeader p={16} fontSize="2xl" fontWeight="bold" backgroundColor="blackAlpha.800" color="white">
            {title}
          </DialogHeader>
        )}
        <DialogCloseTrigger zIndex={20} color="white" />
        <DialogBody>{children}</DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}
