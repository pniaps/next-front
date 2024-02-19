"use client"

import {Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue} from "@nextui-org/table";

export default function TableWrapper({columns, rows, label = ''}) {
    return (<>
            <Table aria-label={label}>
                <TableHeader columns={columns}>
                    {(column: any) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody items={rows}>
                    {(item: any) => (
                        <TableRow key={item.key}>
                            {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    )
}
