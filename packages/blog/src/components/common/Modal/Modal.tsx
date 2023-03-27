import { useBreakpointValue } from '@chakra-ui/media-query'
import {
  Modal as ChakraModal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal'
import { useColorModeValue } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'

export type ModalProps = {
  onClose: () => void
  isOpen: boolean
  children?: ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const { events } = useRouter()
  const modalSize = useBreakpointValue({
    base: 'full',
    md: 'xl',
  })

  useEffect(() => {
    events.on('routeChangeStart', onClose)
    return () => {
      events.off('routeChangeStart', onClose)
    }
  }, [])

  return (
    <ChakraModal isOpen={isOpen} onClose={onClose} size={modalSize}>
      <ModalOverlay />
      <ModalContent
        bg={useColorModeValue('white', 'gray.800')}
        minWidth={{ base: '100%', md: '700px', lg: '800px', xl: '900px' }}
        height={{ md: '700px' }}
      >
        {title && <ModalHeader>{title}</ModalHeader>}
        <ModalCloseButton zIndex={20} onClick={onClose} />
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </ChakraModal>
  )
}
