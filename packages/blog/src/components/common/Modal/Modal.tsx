import { CloseIcon } from '@chakra-ui/icons'
import { Box } from '@chakra-ui/layout'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'

export type ModalProps = {
  onClose: () => void
  children?: ReactNode
  title?: string
}

export function Modal({ onClose, children, title }: ModalProps) {
  const [isBrowser, setIsBrowser] = useState(false)
  const { events } = useRouter()
  const modalWrapperRef = useRef<HTMLDivElement>(null)

  const backDropHandler = (e: MouseEvent) => {
    if (!modalWrapperRef?.current?.contains(e.target as Node)) {
      onClose()
    }
  }

  const preventScrollHandler = (e?: TouchEvent) => {
    e?.preventDefault?.()
  }

  const handleCloseClick = (e?: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e?.preventDefault?.()
    onClose()
  }

  useEffect(() => {
    setIsBrowser(true)
    window.addEventListener('mousedown', backDropHandler)
    document.addEventListener('touchmove', preventScrollHandler)
    events.on('routeChangeStart', handleCloseClick)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('mousedown', backDropHandler)
      document.removeEventListener('touchmove', preventScrollHandler)
      events.off('routeChangeStart', close)
      document.body.style.overflow = 'unset'
    }
  }, [])

  const modalContent = (
    <Box
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      backgroundColor="rgba(0, 0, 0, 0.5)"
    >
      <Box
        ref={modalWrapperRef}
        width={{ base: '100%', md: '700px', lg: '800px', xl: '900px' }}
        height={{ base: '100%', md: '600px' }}
        zIndex={1000}
      >
        <Box
          bg="white"
          width={{ base: '100%', md: '700px', lg: '800px', xl: '900px' }}
          height={{ base: '100%', md: '600px' }}
          borderRadius={{ base: '0', md: '5px' }}
          padding="15px"
        >
          <Box display="flex" justifyContent="flex-end">
            <a href="#" onClick={handleCloseClick}>
              <CloseIcon />
            </a>
          </Box>
          {title && <Box paddingTop="10px">{title}</Box>}
          <Box paddingTop="10px">{children}</Box>
        </Box>
      </Box>
    </Box>
  )

  if (isBrowser) {
    return createPortal(modalContent, document.getElementById('modal-root')!)
  } else {
    return null
  }
}
