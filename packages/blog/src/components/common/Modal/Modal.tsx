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
import { ReactNode, useEffect, useState } from 'react'

export type ModalProps = {
  onClose: () => void
  isOpen: boolean
  children?: ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const [isBrowser, setIsBrowser] = useState(false)
  const { events } = useRouter()
  const modalSize = useBreakpointValue({
    base: 'full',
    md: 'xl',
  })

  useEffect(() => {
    setIsBrowser(true)
    events.on('routeChangeStart', onClose)
    return () => {
      events.off('routeChangeStart', onClose)
    }
  }, [])

  const chakraModal = (
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

  if (isBrowser) {
    return chakraModal
  } else {
    return null
  }
}
