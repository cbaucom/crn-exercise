import { Button, Flex, Heading, useDisclosure } from '@chakra-ui/react'
import React, { useState } from 'react'

import { Container } from '../components/Container'
import { Main } from '../components/Main'
import { getNurses, getShifts } from '../lib/rn_api'
import { Modal } from '../components/Modal'
import { Table } from '../components/Table'

export async function getStaticProps() {
  const nurses = await getNurses()
  const shifts = await getShifts()

  // Get the name of each nurse and add it to the shift object
  const listOfShifts = shifts.map((shift) => {
    const nurse = nurses.find((nurse) => {
      return nurse.id === shift.nurse_id
    })
    if (nurse) {
      shift.nurse_name =
        nurse.first_name + ' ' + nurse.last_name + ', ' + nurse.qualification
    }
    return shift
  })

  return {
    props: {
      nurses,
      listOfShifts,
    },
  }
}

const Index = ({ nurses, listOfShifts }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [shifts, setShifts] = useState(listOfShifts)

  return (
    <Container>
      <Main>
        <Flex align={'center'} justify={'space-between'}>
          <Heading p={6}>Shifts</Heading>
          <Button colorScheme="blue" onClick={onOpen}>
            Set Shift Assignment
          </Button>
        </Flex>
        <Table shifts={shifts} />
      </Main>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        nurses={nurses}
        shifts={shifts}
        setShifts={setShifts}
      />
    </Container>
  )
}

export default Index
