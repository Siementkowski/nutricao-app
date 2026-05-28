import sharp from 'sharp'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

const svg192 = readFileSync(join(root, 'public/icons/icon-192.svg'))

const svg512 = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#7C9A7E"/>
  <text x="256" y="340" font-family="system-ui, sans-serif" font-size="260" font-weight="500" fill="white" text-anchor="middle">N</text>
</svg>`)

await sharp(svg192).resize(192, 192).png().toFile(join(root, 'public/icons/icon-192.png'))
console.log('icon-192.png generated')

await sharp(svg512).resize(512, 512).png().toFile(join(root, 'public/icons/icon-512.png'))
console.log('icon-512.png generated')
