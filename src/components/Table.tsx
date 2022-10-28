import {
  chakra,
  Table as ChakraTable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import React from 'react'
import { useTable, useSortBy } from 'react-table'

export function Table({ shifts }) {
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
    <ChakraTable {...getTableProps()} mt={4} wordBreak={'break-all'}>
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
    </ChakraTable>
  )
}
