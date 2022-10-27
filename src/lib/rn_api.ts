import { format } from 'date-fns'
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
