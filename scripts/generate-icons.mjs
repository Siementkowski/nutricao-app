import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

const source = join(root, 'public/icons/source/logo-d.webp')

await sharp(source).resize(192, 192).png().toFile(join(root, 'public/icons/icon-192.png'))
console.log('icon-192.png generated')

await sharp(source).resize(512, 512).png().toFile(join(root, 'public/icons/icon-512.png'))
console.log('icon-512.png generated')

await sharp(source).resize(48, 48).png().toFile(join(root, 'public/icons/favicon-48.png'))
console.log('favicon-48.png generated')

await sharp(source).resize(180, 180).png().toFile(join(root, 'public/icons/apple-touch-icon.png'))
console.log('apple-touch-icon.png generated')
