import { describe, expect, it } from 'vitest'

import Page from './page'

const params = (lng: AppLocales) => ({ params: Promise.resolve({ lng }) })

describe('Category index page', () => {
  it('should redirect to the home page of the default locale', async () => {
    await expect(Page(params('es'))).rejects.toMatchObject({
      digest: expect.stringMatching(/^NEXT_REDIRECT;replace;\/;/),
    })
  })

  it('should redirect to the home page of a prefixed locale', async () => {
    await expect(Page(params('en'))).rejects.toMatchObject({
      digest: expect.stringMatching(/^NEXT_REDIRECT;replace;\/en;/),
    })
  })
})
