import { format, parse } from 'date-fns'
import { RequestInit } from 'next/dist/server/web/spec-extension/request'

export interface Nurse {
  id: number
  first_name: string
  last_name: string
  email: string
  username: string
  qualification: string
}

export interface Shift {
  id: number
  start: string
  end: string
  nurse_id: number
  nurse_name: string
  qual_required: string
  name: string
}

export const SERVER_API_URL = 'http://localhost:9001/'
const MAX_RETRIES = 5

const nurseCertifications = [
  {
    value: 'CNA',
    rank: 1,
  },
  {
    value: 'LPN',
    rank: 2,
  },
  {
    value: 'RN',
    rank: 3,
  },
]

function getRank(certification) {
  const cert = nurseCertifications.find((cert) => cert.value === certification)
  return cert.rank
}

export function isNurseQualified(nurse, certification) {
  return getRank(nurse.qualification) >= getRank(certification)
}

export function isNurseAvailable(nurseID, startTime, endTime, shifts) {
  const startDate = parse(startTime, 'M/d/yyyy pp', new Date())
  const endDate = parse(endTime, 'M/d/yyyy pp', new Date())

  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1)
  }
  // Check if the nurse is already assigned to a shift
  let isAvailable = true
  shifts.forEach((shift) => {
    if (shift.nurse_id === nurseID) {
      const shiftStartDate = parse(shift.start, 'M/d/yyyy pp', new Date())
      const shiftEndDate = parse(shift.end, 'M/d/yyyy pp', new Date())
      if (shiftEndDate < shiftStartDate) {
        shiftEndDate.setDate(shiftEndDate.getDate() + 1)
      }

      // Check if the nurse is available for the shift
      if (startDate > shiftStartDate && startDate < shiftEndDate) {
        isAvailable = false
      }
      if (endDate > shiftStartDate && endDate < shiftEndDate) {
        isAvailable = false
      }

      if (startDate < shiftStartDate && endDate > shiftEndDate) {
        isAvailable = false
      }

      if (startDate > shiftStartDate && endDate < shiftEndDate) {
        isAvailable = false
      }
    }
  })
  return isAvailable
}

function fetchPlus(
  url: string,
  options?: RequestInit,
  retries?: number
): Promise<Response> {
  return fetch(url, options)
    .then((response) => {
      if (response.ok) {
        return response
      }
      if (retries && retries > 0) {
        return fetchPlus(url, options, retries - 1)
      }
      throw new Error(response.statusText)
    })
    .catch((error) => {
      console.error('Error fetching data', error)
      throw error
    })
}

export async function getNurses(): Promise<Nurse[]> {
  const response = await fetchPlus(
    `${SERVER_API_URL}nurses`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    MAX_RETRIES
  )
    .then((res) => res.json())
    .catch((err) => console.log(err))

  return response
}

export async function getShifts(): Promise<Shift[]> {
  const response = await fetchPlus(
    `${SERVER_API_URL}shifts`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    MAX_RETRIES
  )
    .then((res) => res.json())
    .catch((err) => console.log(err))

  return [
    ...response.map((shift: Shift) => ({
      ...shift,
      start: format(new Date(shift.start), 'M/d/yyyy pp'),
      end: format(new Date(shift.end), 'M/d/yyyy pp'),
    })),
  ]
}

export async function assignShift(
  shift: Shift,
  nurse: Nurse
): Promise<Response> {
  const response = await fetchPlus(
    `/shifts/${shift.id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nurseID: nurse.id,
      }),
    },
    MAX_RETRIES
  )
    .then((res) => res.json())
    .catch((error) => {
      console.error('Error saving data', error)
      throw error
    })

  return response
}
