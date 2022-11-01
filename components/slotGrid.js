import { Box, Typography } from "@mui/material";
import _ from 'lodash'

export default function SlotGrid({ slots, openDetailsDrawer }) {
    return (
        <Box
            className=" w-[700px] h-[350px] grid grid-cols-10 p-1 m-1 text-white text-center"
        >
            {_.map(slots, (slot) => (
                <Box
                    className="flex w-[50px] my-1 h-[20px] justify-start items-center "
                    key={slot.id}
                >
                    <Box
                        component="button"
                        onClick={() => openDetailsDrawer(slot.slotNumber, slot.vehicle)}
                        disabled={slot.vehicle === ""}
                        className={
                            "flex justify-center items-center rounded " +
                            (slot.slotType === 2 ? "w-[100%] mr-2 " : slot.slotType === 1 ?
                                'w-[80%] ' : 'w-[70%] ') + (slot.status === 'leave' ?
                                    'bg-[#e1b12c]' : slot.status === 'available' ?
                                        "bg-[#192a56]" : 'bg-[#c23616] cursor-pointer')
                        }
                    >
                        <Typography className=" font-bold text-sm tracking-wider m-1">
                            {slot.slotNumber}
                        </Typography>
                    </Box>
                </Box>
            ))}

        </Box>
    )
}