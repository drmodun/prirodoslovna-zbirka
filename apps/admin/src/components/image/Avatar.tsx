import { chakra, useColorMode } from '@chakra-ui/system'
import { ComponentProps } from 'react'
import { Image } from './Image'

type AvatarImageProps = ComponentProps<typeof Image> & {
  showBorder?: boolean
  alt?: string
}

export function NextAvatar ({
  src,
  showBorder,
  alt = 'Avatar',
  style,
  ...props
}: AvatarImageProps) {
  const { colorMode } = useColorMode()

  return (
    <Image
      {...props}
      {...(showBorder
        ? {
            border: '2px',
            borderColor: colorMode === 'dark' ? 'navy.700' : 'white'
          }
        : {})}
      alt={alt}
      src={src}
      style={{ ...style, borderRadius: '50%' }}
    />
  )
}

export const ChakraNextAvatar = chakra(NextAvatar, {
  shouldForwardProp: prop => ['width', 'height', 'src', 'alt'].includes(prop)
})
