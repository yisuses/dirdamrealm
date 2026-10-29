'use client'

import { VisuallyHidden, useBreakpointValue } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useRef } from 'react'

import { DialogBody, DialogCloseTrigger, DialogContent, DialogRoot, DialogTitle } from '@blog/components/ui/dialog'

export type ModalProps = {
  onClose: () => void
  isOpen: boolean
  children?: ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const pathname = usePathname()
  const isFirstRender = useRef(true)
  const modalSize = useBreakpointValue<'full' | 'lg'>({
    base: 'full',
    md: 'lg',
  })

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
      placement="top"
    >
      <DialogContent
        bg="bg.panel"
        borderRadius={{ base: 0, md: '16px' }}
        mt={{ md: '12vh' }}
        boxShadow="0 30px 80px rgba(0,0,0,.3)"
        css={{ '--dialog-backdrop-bg': 'rgba(10,10,12,.5)' }}
      >
        {title && (
          <VisuallyHidden asChild>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
        )}
        <DialogCloseTrigger zIndex={20} top={4} insetEnd={4} />
        <DialogBody p={2.5}>{children}</DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}
