import { Button, Flex, Heading } from '@chakra-ui/react'
import { Container } from '../components/Container'
import { Main } from '../components/Main'

const Index = () => {
  return (
    <Container>
      <Main>
        <Flex align={'center'} justify={'space-between'}>
          <Heading p={6}>Brand</Heading>
          <Button
            colorScheme="blue"
            onClick={() => console.log('clicked')}
            mr={6}
          >
            Click Me!
          </Button>
        </Flex>
      </Main>
    </Container>
  )
}

export default Index
