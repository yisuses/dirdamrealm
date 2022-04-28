import fs from 'fs'
import { fileURLToPath } from 'url'

const buildPath = fileURLToPath(new URL('../dist', import.meta.url))
const options = { recursive: true, force: true }

if (fs.existsSync(buildPath)) fs.rmSync(buildPath, options)
