import { WarningTwoIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Modal as ChakraModal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { assignShift, isNurseAvailable, isNurseQualified } from '../lib/rn_api'

export function Modal({ isOpen, onClose, nurses, shifts, setShifts }) {
  const nurseSelectField = useRef({} as HTMLSelectElement)
  const shiftSelectField = useRef({} as HTMLSelectElement)
  const submitButtonRef = useRef({} as HTMLButtonElement)
  const availabilityErrorRef = useRef({} as HTMLDivElement)
  const qualifiedErrorRef = useRef({} as HTMLDivElement)
  const [selectedNurse, setSelectedNurse] = useState('')
  const [selectedShift, setSelectedShift] = useState('')

  const onSaveShiftAssignment = () => {
    if (!selectedNurse && !selectedShift) {
      return
    }
    // Find the shift that was selected
    const shift = shifts.find((shift) => {
      return shift.id === Number(selectedShift)
    })

    // Find the nurse that was selected
    const nurse = nurses.find((nurse) => {
      return nurse.id === Number(selectedNurse)
    })

    // Update the shift with the nurse's name on the server
    assignShift(shift, nurse)

    // Update the shift with the nurse's name locally
    shift.nurse_name =
      nurse.first_name + ' ' + nurse.last_name + ', ' + nurse.qualification

    // Update the nurse_id on the shift locally
    shift.nurse_id = nurse.id

    // Update the state
    setShifts([...shifts])

    // Close the modal
    onClose()
  }

  let enableSaveShiftAssignment = false

  const testSaveShiftAssignmentEnabled = () => {
    let enableButton = false

    if (
      typeof nurseSelectField.current.value === 'string' &&
      nurseSelectField.current.value.length > 0 &&
      typeof shiftSelectField.current.value === 'string' &&
      shiftSelectField.current.value.length > 0
    ) {
      // Find the shift
      const shift = shifts.find((shift) => {
        return shift.id === Number(shiftSelectField.current.value)
      })
      // Find the nurse
      const nurse = nurses.find((nurse) => {
        return nurse.id === Number(nurseSelectField.current.value)
      })

      const isAvailable = isNurseAvailable(
        nurse.id,
        shift.start,
        shift.end,
        shifts
      )
      const isQualified = isNurseQualified(nurse, shift.qual_required)

      if (!isAvailable && !isQualified) {
        availabilityErrorRef.current.style.display = 'flex'
        qualifiedErrorRef.current.style.display = 'flex'
        enableButton = false
      } else if (!isAvailable) {
        availabilityErrorRef.current.style.display = 'flex'
        qualifiedErrorRef.current.style.display = 'none'
      } else if (!isQualified) {
        qualifiedErrorRef.current.style.display = 'flex'
        availabilityErrorRef.current.style.display = 'none'
      } else {
        availabilityErrorRef.current.style.display = 'none'
        qualifiedErrorRef.current.style.display = 'none'
        enableButton = true
      }
    }
    if (enableButton) {
      if (enableSaveShiftAssignment === false) {
        enableSaveShiftAssignment = true
        submitButtonRef.current.disabled = false
      }
    } else {
      if (enableSaveShiftAssignment === true) {
        enableSaveShiftAssignment = false
        submitButtonRef.current.disabled = true
      }
    }
  }

  useEffect(() => {
    onSaveShiftAssignment()
  }, [selectedNurse, selectedShift])

  return (
    <ChakraModal onClose={onClose} isOpen={isOpen} isCentered>
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
              onChange={() => testSaveShiftAssignmentEnabled()}
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
              onChange={() => testSaveShiftAssignmentEnabled()}
            >
              {nurses.map((nurse) => (
                <option key={nurse.id} value={nurse.id}>
                  {`${nurse.first_name} ${nurse.last_name}, ${nurse.qualification}`}
                </option>
              ))}
            </Select>
          </FormControl>
          <Flex
            ref={qualifiedErrorRef}
            align="center"
            display={'none'}
            p={4}
            bg="antiquewhite"
            color="maroon"
            my={4}
          >
            <WarningTwoIcon />
            <Text ml={3}>
              This nurse is not qualified to work the chosen shift.
            </Text>
          </Flex>
          <Flex
            ref={availabilityErrorRef}
            align="center"
            display={'none'}
            p={4}
            bg="antiquewhite"
            color="maroon"
            my={4}
          >
            <WarningTwoIcon />
            <Text ml={3}>
              This nurse is already working during the chosen shift.
            </Text>
          </Flex>
        </ModalBody>
        <ModalFooter justifyContent={'flex-start'}>
          <Button
            ref={submitButtonRef}
            colorScheme="blue"
            textTransform="uppercase"
            disabled={!enableSaveShiftAssignment}
            type="submit"
          >
            Save Assignment
          </Button>
        </ModalFooter>
      </ModalContent>
    </ChakraModal>
  )
}
