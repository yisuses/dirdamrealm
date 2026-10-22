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
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Every destructive action asks first, saying exactly what will happen. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <DialogRoot open={open} onOpenChange={({ open: isOpen }) => !isOpen && onCancel()} role="alertdialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle fontFamily="Roboto" fontSize="xl">
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text fontSize="lg">{children}</Text>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="lg" onClick={onCancel}>
            Cancelar
          </Button>
          <Button colorPalette="red" size="lg" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
