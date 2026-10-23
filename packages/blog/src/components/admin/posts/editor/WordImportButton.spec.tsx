import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { WordImportButton } from './WordImportButton'
import { wordToBlocks } from './wordImport'

vi.mock('./wordImport', () => ({ wordToBlocks: vi.fn() }))

const docx = new File(['docx'], 'cronica.docx')
const paragraph = (text: string) => ({ type: 'paragraph', data: { text } })

async function chooseFile(user: ReturnType<typeof userEvent.setup>) {
  await user.upload(screen.getByLabelText('Elegir un documento de Word'), docx)
  return screen.findByRole('alertdialog')
}

describe('WordImportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should open the file picker from the button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WordImportButton onImport={vi.fn()} />)
    const click = vi.spyOn(screen.getByLabelText('Elegir un documento de Word'), 'click')

    await user.click(screen.getByRole('button', { name: 'Importar un documento de Word' }))

    expect(click).toHaveBeenCalled()
  })

  it('should add the paragraphs after confirming, and count them', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onImport = vi.fn(async () => undefined)
    vi.mocked(wordToBlocks).mockResolvedValueOnce([paragraph('Uno'), paragraph('Dos')] as never)
    renderWithProviders(<WordImportButton onImport={onImport} />)

    const dialog = await chooseFile(user)
    expect(dialog).toHaveTextContent('¿Añadir «cronica.docx»?')
    await user.click(screen.getByRole('button', { name: 'Sí, añadirlo' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Añadidos 2 párrafos al final del texto. Repásalo antes de publicar.',
    )
    expect(wordToBlocks).toHaveBeenCalledWith(docx)
    expect(onImport).toHaveBeenCalledWith([paragraph('Uno'), paragraph('Dos')])
  })

  it('should say one paragraph in singular', async () => {
    const user = userEvent.setup({ applyAccept: false })
    vi.mocked(wordToBlocks).mockResolvedValueOnce([paragraph('Uno')] as never)
    renderWithProviders(<WordImportButton onImport={vi.fn(async () => undefined)} />)

    await chooseFile(user)
    await user.click(screen.getByRole('button', { name: 'Sí, añadirlo' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Añadido 1 párrafo al final del texto.')
  })

  it('should do nothing when cancelled, or when no file was chosen', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderWithProviders(<WordImportButton onImport={vi.fn()} />)

    await chooseFile(user)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Elegir un documento de Word'), { target: { files: [] } })

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(wordToBlocks).not.toHaveBeenCalled()
  })

  it('should explain when the document cannot be read', async () => {
    const user = userEvent.setup({ applyAccept: false })
    vi.mocked(wordToBlocks).mockRejectedValueOnce(new Error('not a docx'))
    renderWithProviders(<WordImportButton onImport={vi.fn()} />)

    await chooseFile(user)
    await user.click(screen.getByRole('button', { name: 'Sí, añadirlo' }))

    expect(await screen.findByRole('status')).toHaveTextContent('No se ha podido leer el documento.')
  })
})
