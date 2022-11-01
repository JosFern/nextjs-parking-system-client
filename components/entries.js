import { Box, Typography } from "@mui/material";
import { map } from "lodash";

export default function EntriesTable({ entries, deleteEntry }) {

    return (
        <Box className="flex flex-col">
            <Typography className="text-gray-800 font-semibold text-lg self-start">Entry Gates: </Typography>
            <Box className="h-[55vh] overflow-auto">
                {map(entries, (entry) => (
                    <Box key={entry.id} className="group relative rounded-lg shadow-md bg-white mt-3 p-3">
                        <Typography
                            className="text-gray-800 font-semibold text-lg"
                        >
                            {entry.entryGate}
                        </Typography>

                        <Typography
                        >
                            Nearest Slot: {entry.nearestSlot}
                        </Typography>

                        <Box
                            component='button'
                            onClick={() => deleteEntry(entry)}
                            className=" absolute hidden top-1 right-2 font-bold bg-[#e84118] px-2 rounded-md text-white cursor-pointer group-hover:block hover:bg-[#c23616]"
                        >
                            x
                        </Box>

                    </Box>
                ))}
            </Box>
        </Box>
    )
}
