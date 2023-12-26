import { Box, ChakraComponent } from '@chakra-ui/react'
import * as React from 'react'
import NextImage from "next/legacy/image"
import { ComponentProps } from 'react'

type ImageProps = ComponentProps<ChakraComponent<'div', {}>> & { src: string; alt: string }

export const Image = (props: ImageProps) => {
  const { src, alt, ...rest } = props
  return (
    <Box overflow={'hidden'} position='relative' {...rest}>
      <NextImage objectFit='cover' layout='fill' src={src} alt={alt} />
    </Box>
  )
}
