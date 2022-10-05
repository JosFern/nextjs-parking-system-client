import { Box, Typography } from "@mui/material";
import _ from 'lodash'
import slotGridBG from '../../public/slotgrid.png'
import Image from 'next/image'

export default function SlotGrid({ slots, openDetailsDrawer }) {
    return (
        <Box className="relative">
            <Image alt="slot-grid-bg" component="img" src={slotGridBG} width='800px' height="400px" />
            <Box
                className="absolute top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%] w-[700px] h-[300px] grid grid-cols-10 p-1 m-1 text-white text-center"
            >
                {_.map(slots, (slot) => (
                    <Box
                        className="flex w-[50px] my-1 h-[20px] justify-start items-center "
                        key={slot.number}
                    >
                        <Box
                            component="button"
                            onClick={() => openDetailsDrawer(slot.number, slot.vehicle)}
                            disabled={slot.vehicle === null}
                            className={
                                "flex justify-center items-center rounded " +
                                (slot.type === 2 ? "w-[100%] mr-2 " : slot.type === 1 ?
                                    'w-[80%] ' : 'w-[70%] ') + (slot.status === 'leave' ?
                                        'bg-[#e1b12c]' : slot.status === 'available' ?
                                            "bg-[#192a56]" : 'bg-[#c23616] cursor-pointer')
                            }
                        >
                            <Typography className=" font-bold text-sm tracking-wider m-1">
                                {slot.number}
                            </Typography>
                        </Box>
                    </Box>
                ))}

            </Box>
        </Box>
    )
}