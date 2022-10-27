import { Flex, FlexProps } from '@chakra-ui/react'

export const Container = (props: FlexProps) => (
  <Flex
    alignItems="center"
    color="black"
    direction="column"
    justifyContent="center"
    position="relative"
    py={4}
    transition="all 0.15s ease-out"
    {...props}
  />
)
