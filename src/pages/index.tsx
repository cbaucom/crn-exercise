import {
  Button,
  chakra,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react'
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import React, { useEffect, useRef, useState } from 'react'
import { useTable, useSortBy } from 'react-table'

import { Container } from '../components/Container'
import { Main } from '../components/Main'
import { getNurses, getShifts } from '../lib/rn_api'

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
  const nurseSelectField = useRef({} as HTMLSelectElement)
  const shiftSelectField = useRef({} as HTMLSelectElement)
  const submitButtonRef = useRef({} as HTMLButtonElement)
  const [shifts, setShifts] = useState(listOfShifts)
  const [selectedNurse, setSelectedNurse] = useState('')
  const [selectedShift, setSelectedShift] = useState('')

  console.log(
    '🚀 ~ file: index.tsx ~ line 63 ~ Index ~ selectedNurse',
    selectedNurse
  )
  console.log(
    '🚀 ~ file: index.tsx ~ line 65 ~ Index ~ selectedShift',
    selectedShift
  )

  useEffect(() => {
    setShifts(listOfShifts)
  }, [listOfShifts])

  // Table data and columns
  const data = shifts

  const columns = React.useMemo(
    () => [
      {
        Header: 'Shift',
        accessor: 'name',
      },
      {
        Header: 'Start time',
        accessor: 'start',
      },
      {
        Header: 'End time',
        accessor: 'end',
      },
      {
        Header: 'Certification required',
        accessor: 'qual_required',
      },
      {
        Header: 'Assigned nurse',
        accessor: 'nurse_name',
      },
    ],
    []
  )

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data }, useSortBy)

  return (
    <Container>
      <Main>
        <Flex align={'center'} justify={'space-between'}>
          <Heading p={6}>Shifts</Heading>
          <Button colorScheme="blue" onClick={onOpen}>
            Set Shift Assignment
          </Button>
        </Flex>
        <Table {...getTableProps()} mt={4} wordBreak={'break-all'}>
          <Thead>
            {headerGroups.map((headerGroup, i) => (
              <Tr {...headerGroup.getHeaderGroupProps()} key={i}>
                {headerGroup.headers.map((column, i) => (
                  <Th
                    key={i}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    isNumeric={column.isNumeric}
                  >
                    {column.render('Header')}
                    <chakra.span pl="4">
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <TriangleDownIcon aria-label="sorted descending" />
                        ) : (
                          <TriangleUpIcon aria-label="sorted ascending" />
                        )
                      ) : null}
                    </chakra.span>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row)
              return (
                <Tr {...row.getRowProps()} key={i}>
                  {row.cells.map((cell, i) => (
                    <Td
                      {...cell.getCellProps()}
                      isNumeric={cell.column.isNumeric}
                      fontSize="sm"
                      key={i}
                    >
                      {cell.render('Cell')}
                    </Td>
                  ))}
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Main>
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent
          as={'form'}
          maxWidth={'xl'}
          onSubmit={(e) => {
            e.preventDefault()
            setSelectedNurse(nurseSelectField.current.value)
            setSelectedShift(shiftSelectField.current.value)
          }}
        >
          <ModalHeader>Set Shift Assignment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl my={4}>
              <FormLabel htmlFor="shift">Shift</FormLabel>
              <Select
                id="shift"
                ref={shiftSelectField}
                placeholder="Select shift"
                size="lg"
                isRequired
              >
                {shifts.map((shift) => {
                  const shiftStartTime = shift.start.substring(
                    shift.start.indexOf(' ') + 1
                  )
                  const shiftEndTime = shift.end.substring(
                    shift.end.indexOf(' ') + 1
                  )
                  return (
                    <option key={shift.id} value={shift.id}>
                      {`${shift.name}: ${shiftStartTime} - ${shiftEndTime} (${shift.qual_required})`}
                    </option>
                  )
                })}
              </Select>
            </FormControl>
            <FormControl my={4}>
              <FormLabel htmlFor="nurse">Nurse</FormLabel>
              <Select
                id="nurse"
                ref={nurseSelectField}
                placeholder="Select nurse"
                size="lg"
                isRequired
              >
                {nurses.map((nurse) => (
                  <option key={nurse.id} value={nurse.id}>
                    {`${nurse.first_name} ${nurse.last_name}, ${nurse.qualification}`}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter justifyContent={'flex-start'}>
            <Button
              ref={submitButtonRef}
              colorScheme="blue"
              textTransform="uppercase"
              type="submit"
            >
              Save Assignment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default Index
