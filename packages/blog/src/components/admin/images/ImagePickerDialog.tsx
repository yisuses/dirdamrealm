'use client'

import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@blog/components/ui/dialog'
import type { LibraryImage } from '@blog/core/cloudinary/libraryImage'

import { ImageLibrary } from './ImageLibrary'

interface ImagePickerDialogProps {
  open: boolean
  title?: string
  onSelect: (image: LibraryImage) => void
  onClose: () => void
}

/** The whole library in a dialog, to choose an image (or upload one) for a post. */
export function ImagePickerDialog({ open, title = 'Elegir una imagen', onSelect, onClose }: ImagePickerDialogProps) {
  return (
    <DialogRoot
      open={open}
      onOpenChange={({ open: isOpen }) => !isOpen && onClose()}
      size="cover"
      scrollBehavior="inside"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle fontFamily="heading" fontWeight={500} fontSize="xl">
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogCloseTrigger aria-label="Cerrar sin elegir" />
        <DialogBody pb={8}>{open && <ImageLibrary onSelect={onSelect} />}</DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}
