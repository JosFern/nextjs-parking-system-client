import { Box, Button, Modal, Typography, FormControl, InputLabel, Select, MenuItem, Drawer } from "@mui/material";
import slots from '../../_sample-data/slots'
import _ from 'lodash'
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { calculatePayment, markLeaveSlot, markReturnedSlot, setSlots, unparkSlot, updateSlot } from "../../store/slot";
import SlotGrid from "../components/slotGrid";
import ParkingLotTable from "../components/parkinglotTable";
import { addVehicle, deleteVehicle, markLeaveVehicle, markReturnedVehicle, setVehicles } from "../../store/vehicle";
import { format, formatISO, parseISO } from "date-fns";


export default function ParkingLot() {

    const dispatch = useDispatch()
    const ps = useSelector(state => state.slot)
    const car = useSelector(state => state.vehicle)

    const [parkModal, setParkModal] = useState(false)
    const [isOpenDrawer, setOpenDrawer] = useState(false)

    const [vehicle, setVehicle] = useState({
        type: '',
        entry: '',
    })

    useEffect(() => {
        const initializeReducers = async () => {
            await dispatch(setSlots(slots))
            dispatch(setVehicles([{
                id: 1,
                size: 0,
                timeIn: "2022-10-03T14:00:00+08:00",
                timeOut: null
            }]))
        }

        initializeReducers()

    }, [dispatch])

    const handleChange = (e) => {
        const { name, value } = e.target
        setVehicle({
            ...vehicle,
            [name]: value
        })
    }

    const getAvailableSlot = (entry, car) => {

        const getSlotsEntryPosition = _.chain(ps.slots)
            .filter((slot) => slot.vehicle === null && car <= slot.type)
            .map(function (slot) {
                return slot.position[entry]
            }).value()

        const nearSlot = _.filter(ps.slots, (slot) =>
            slot.position[entry] === Math.min(...getSlotsEntryPosition) &&
            slot.vehicle === null &&
            car <= slot.type
        )

        return nearSlot[0]
    }

    const generateID = () => {

        const id = Math.floor((Math.random() * 1000) + 1);

        const isExist = _.find(car.vehicles, { carID: id })

        if (isExist) {
            generateID()
        } else {
            return id
        }

    }

    const handleParkSubmit = (e) => {
        e.preventDefault()



        const { type, entry } = vehicle

        const carID = generateID()

        const getSlot = getAvailableSlot(Number(entry), Number(type))

        dispatch(addVehicle({ id: carID, size: Number(type), timeIn: formatISO(new Date()), timeOut: null }))
        dispatch(updateSlot({ carID, slot: getSlot.number }))

        setParkModal(false)

        setVehicle({
            ...vehicle,
            type: '',
            entry: '',
        })
    }

    const openDetailsDrawer = (slotNum, carID) => {
        setOpenDrawer(true)

        const carInfo = _.find(car.vehicles, { id: carID })

        const slotInfo = _.find(ps.slots, { number: slotNum })

        dispatch(calculatePayment({
            carID: carInfo.id,
            slotNum: slotInfo.number,
            slotType: slotInfo.type,
            carSize: carInfo.size,
            timeIn: carInfo.timeIn
        }))


    }

    const handleUnpark = () => {
        dispatch(unparkSlot(ps.currentSlot.number))
        dispatch(deleteVehicle(ps.currentSlot.carID))
        setOpenDrawer(false)
    }

    const handleTemporaryLeave = () => {
        dispatch(markLeaveSlot(ps.currentSlot.number))
        dispatch(markLeaveVehicle(ps.currentSlot.carID))
        setOpenDrawer(false)
    }

    const handleReturn = () => {
        dispatch(markReturnedSlot(ps.currentSlot.number))
        dispatch(markReturnedVehicle(ps.currentSlot.carID))
        setOpenDrawer(false)
    }

    const getVehicleTable = (vehicles) => {
        const getAssocSlot = _.map(vehicles, (vehicle) => {
            const slot = _.find(ps.slots, { vehicle: vehicle.id })
            return { ...vehicle, slot: slot?.number }
        })

        return getAssocSlot
    }

    return (
        <Box className="flex justify-start items-start gap-4 min-h-screen text-center text-gray-800 bg-[#f0f2f5] ">
            <Box className="bg-white min-h-screen  w-[400px]">
                <Typography className="text-gray-800 font-bold text-2xl">
                    Parking Allocation System
                </Typography>
                <Button onClick={() => setParkModal(true)} className="bg-[#27ae60]" variant="contained" color='success'>
                    Park
                </Button>
                <ParkingLotTable vehicles={useMemo(() => getVehicleTable(car.vehicles), [car.vehicles])} openDetailsDrawer={openDetailsDrawer} />
            </Box>
            <Box className="flex flex-col items-start">
                <Typography className="text-gray-800 font-bold text-2xl">Parking Lot Overview</Typography>
                <Box className="flex justify-center items-center mt-6 bg-white p-4 rounded-lg shadow-md">
                    <Typography className="text-2xl font-bold">A</Typography>
                    <Box className="flex flex-col">
                        <Typography className="text-2xl font-bold">B</Typography>
                        <SlotGrid slots={ps.slots} openDetailsDrawer={openDetailsDrawer} />
                    </Box>
                    <Typography className="text-2xl font-bold">C</Typography>
                </Box>
            </Box>

            <Modal
                open={parkModal}
                onClose={() => setParkModal(false)}
            >
                <Box component="form" onSubmit={handleParkSubmit} className="absolute top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%] w-[300px] bg-white rounded-md shadow-md flex flex-col items-center gap-3 p-4">
                    <Typography variant="h6" component="h2">
                        Park a car
                    </Typography>

                    <FormControl required fullWidth margin='dense'>
                        <InputLabel>Entry</InputLabel>
                        <Select
                            name='entry'
                            label="Entry"
                            value={vehicle.entry}
                            onChange={handleChange}
                        >
                            <MenuItem value="0">A</MenuItem>
                            <MenuItem value="1">B</MenuItem>
                            <MenuItem value="2">C</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl required fullWidth margin='dense'>
                        <InputLabel>Vehicle Type</InputLabel>
                        <Select
                            name='type'
                            label="Vehicle Type"
                            value={vehicle.type}
                            onChange={handleChange}
                        >
                            <MenuItem value="0">Small</MenuItem>
                            <MenuItem value="1">Medium</MenuItem>
                            <MenuItem value="2">Large</MenuItem>
                        </Select>
                    </FormControl>

                    <Button type="submit" className="bg-[#27ae60]" variant="contained" color='success'>Park</Button>
                </Box>

            </Modal>


            <Drawer
                anchor="right"
                open={isOpenDrawer}
                onClose={() => setOpenDrawer(false)}
            >
                <Box className="w-[400px] flex flex-col justify-center items-center p-4 min-h-screen gap-6">
                    <Typography className="font-bold text-2xl">
                        Details
                    </Typography>
                    {ps.currentSlot.status === 'leave' && <Typography className="font-bold text-xl text-[#e1b12c]">
                        Currently on leave
                    </Typography>}
                    <Box className="flex gap-8 text-center">
                        <Box>
                            <Typography className="text-sm font-bold text-gray-500">
                                Car ID:
                            </Typography>
                            <Typography className="text-xl font-bold text-gray-800">
                                {ps.currentSlot.carID}
                            </Typography>

                        </Box>
                        <Box>
                            <Typography className="text-sm font-bold text-gray-500">
                                Type:
                            </Typography>
                            <Typography className="text-xl font-bold text-gray-800">
                                {ps.currentSlot.carSize === 0 ? "Small" : ps.currentSlot.carSize === 1 ? "Medium" : "Large"}
                            </Typography>

                        </Box>
                    </Box>

                    <Box className="flex gap-8 text-center">
                        <Box>
                            <Typography className="text-sm font-bold text-gray-500">
                                Slot:
                            </Typography>
                            <Typography className="text-xl font-bold text-gray-800">
                                {ps.currentSlot.number}
                            </Typography>

                        </Box>
                        <Box>
                            <Typography className="text-sm font-bold text-gray-500">
                                Slot Size:
                            </Typography>
                            <Typography className="text-xl font-bold text-gray-800">
                                {ps.currentSlot.slotType === 0 ? "Small" : ps.currentSlot.slotType === 1 ? "Medium" : "Large"}
                            </Typography>

                        </Box>
                    </Box>
                    <Box>
                        <Typography className="text-sm font-bold text-gray-500 text-center">
                            Time In:
                        </Typography>
                        <Typography className="text-xl font-bold text-gray-800">
                            {format(parseISO(ps.currentSlot.timeIn), "PPpp")}
                        </Typography>

                    </Box>
                    <Box>
                        <Typography className="text-sm font-bold text-gray-500 text-center">
                            Current Time:
                        </Typography>
                        <Typography className="text-xl font-bold text-gray-800">
                            {format(parseISO(ps.currentSlot.currTime), "PPpp")}
                        </Typography>

                    </Box>

                    <Typography className="text-xl font-bold text-gray-800 text-center">
                        Total Payment: P{ps.currentSlot.totalPayment}
                    </Typography>

                    {ps.currentSlot.status === 'occupied' && <Button onClick={handleTemporaryLeave} className="bg-[#e67e22]" variant="contained" color='warning'>
                        Temporary Leave
                    </Button>}

                    {ps.currentSlot.status === 'leave' && <Button onClick={handleReturn} className="bg-[#e67e22]" variant="contained" color='warning'>
                        Return
                    </Button>}

                    {ps.currentSlot.status === 'occupied' && <Button onClick={handleUnpark} className="bg-[#27ae60]" variant="contained" color='success'>
                        Unpark
                    </Button>}

                </Box>
            </Drawer>
        </Box>
    )
}