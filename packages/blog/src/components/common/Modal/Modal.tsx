import { useBreakpointValue } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'

import { useColorModeValue } from '@blog/components/ui/color-mode'
import { DialogBody, DialogCloseTrigger, DialogContent, DialogHeader, DialogRoot } from '@blog/components/ui/dialog'

export type ModalProps = {
  onClose: () => void
  isOpen: boolean
  children?: ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const { events } = useRouter()
  const modalSize = useBreakpointValue<'full' | 'xl'>({
    base: 'full',
    md: 'xl',
  })
  const contentBg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    events.on('routeChangeStart', onClose)
    return () => {
      events.off('routeChangeStart', onClose)
    }
  }, [])

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
