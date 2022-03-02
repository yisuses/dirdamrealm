import { red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

// Create a mui v5 theme instance.
export const muiTheme = createTheme({
  typography: {},
  palette: {
    error: {
      main: red.A400,
    },
  },
})
