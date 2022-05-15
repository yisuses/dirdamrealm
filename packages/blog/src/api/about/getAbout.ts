import axios from 'axios'

import { aboutMapper } from '@api/mapper'
import { apiUrl } from '@utils'

export async function getAbout() {
  return axios
    .get<AboutResponse>(apiUrl(`/api/about`))
    .then(({ data: response }) => (response.data ? aboutMapper(response.data) : undefined))
    .catch(() => {
      throw new Error('Error retrieving about info.')
    })
}
