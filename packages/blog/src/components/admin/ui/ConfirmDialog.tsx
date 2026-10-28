'use client'

import { Button, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@blog/components/ui/dialog'

interface ConfirmDialogProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  // Red for destructive actions, the default; orange for ones that only need a second look.
  confirmPalette?: 'red' | 'orange'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Every destructive or public action asks first, saying exactly what will happen. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  confirmPalette = 'red',
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    // Controlled, so it only reports changes the user makes: closing it (Escape, outside click) is cancelling.
    <DialogRoot open={open} onOpenChange={onCancel} role="alertdialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle fontFamily="Roboto" fontSize="xl">
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text fontSize="lg" lineHeight="tall">
            {children}
          </Text>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="lg" onClick={onCancel}>
            Cancelar
          </Button>
          <Button colorPalette={confirmPalette} size="lg" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
