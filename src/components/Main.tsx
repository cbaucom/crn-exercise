import { Stack, StackProps } from '@chakra-ui/react'

export const Main = (props: StackProps) => (
  <Stack
    as="main"
    maxWidth={'container.xl'}
    width={{ base: '100%', md: '95%', lg: '100%' }}
    {...props}
  />
)
