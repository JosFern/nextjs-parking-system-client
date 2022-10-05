import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import InfoIcon from '@mui/icons-material/Info';
import _ from "lodash";
import { format, parseISO } from "date-fns";

export default function ParkingLotTable({ vehicles, openDetailsDrawer }) {

    return (
        <TableContainer component={Paper}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell >Size</TableCell>
                        <TableCell>Time Parked</TableCell>
                        <TableCell>Slot</TableCell>
                        <TableCell>Details</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {_.map(vehicles, (row) => (
                        <TableRow key={row.id}>
                            <TableCell component="th" scope="row">
                                {row.id}
                            </TableCell>
                            <TableCell>
                                {row.size === 0 ? "S" : row.size === 1 ? "M" : "L"}
                            </TableCell>
                            <TableCell>{format(parseISO(row.timeIn), 'p')}</TableCell>
                            <TableCell>{row.slot}</TableCell>
                            <TableCell
                                onClick={() => openDetailsDrawer(row.slot, row.id)}
                                align="right"
                            >
                                <InfoIcon
                                    className={"w-[25px] h-[25px] m-0 cursor-pointer " +
                                        (row.timeOut === null ? "text-[#00a8ff]" : "text-[#e1b12c]")
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}