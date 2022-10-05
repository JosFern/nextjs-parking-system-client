import { Box, Button, Modal, Typography, FormControl, InputLabel, Select, MenuItem, Drawer } from "@mui/material";
import slots from '../../_sample-data/slots'
import _ from 'lodash'
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { calculatePayment, markLeaveSlot, markReturnedSlot, setSlots, unoccupySlot, occupySlot } from "../../store/slot";
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

    //just initialize slots
    useEffect(() => {
        const initializeReducers = async () => {
            //sample data
            await dispatch(setSlots(slots))
            dispatch(setVehicles([{
                id: 1,
                size: 0,
                timeIn: "2022-10-05T14:00:00+08:00",
                timeOut: null
            }]))
        }

        initializeReducers()

    }, [dispatch])

    //handles form onChange
    const handleChange = async (e) => {
        const { name, value } = e.target
        setVehicle({
            ...vehicle,
            [name]: value
        })
    }

    //handles to generate unique vehicle id
    const generateID = (id) => {

        const isExist = _.find(car.vehicles, { id })

        if (!isExist) return id

        return generateID(id + 1)

    }

    //handles to park vehicle
    const handleParkSubmit = (e) => {
        e.preventDefault()

        const { type, entry } = vehicle

        const carID = generateID(Math.floor((Math.random() * 1000) + 1))

        dispatch(addVehicle({ id: carID, size: Number(type), timeIn: formatISO(new Date()), timeOut: null }))
        dispatch(occupySlot({ carID, entry: Number(entry), car: Number(type) }))

        setParkModal(false)

        setVehicle({
            ...vehicle,
            type: '',
            entry: '',
        })
    }

    //handles to call calculate total payment and opens drawer
    const openDetailsDrawer = (slotNum, carID) => {
        setOpenDrawer(true)

        const carInfo = _.find(car.vehicles, { id: carID })

        const slotInfo = _.find(ps.slots, { number: slotNum })

        dispatch(calculatePayment({
            carID: carInfo.id,
            slotNum: slotInfo.number,
            slotType: slotInfo.type,
            carSize: carInfo.size,
            timeIn: carInfo.timeIn,
            timeOut: carInfo.timeOut
        }))


    }

    //handles vehicle to unpark/delete vehicle/update slot status
    const handleUnpark = () => {
        dispatch(unoccupySlot(ps.currentSlot.number))
        dispatch(deleteVehicle(ps.currentSlot.carID))
        setOpenDrawer(false)
    }

    //handles vehicle leaving and update slot status
    const handleTemporaryLeave = () => {
        dispatch(markLeaveSlot(ps.currentSlot.number))
        dispatch(markLeaveVehicle(ps.currentSlot.carID))
        setOpenDrawer(false)
    }

    //handles vehicle returning and update slot status
    const handleReturn = () => {
        dispatch(markReturnedSlot(ps.currentSlot.number))
        dispatch(markReturnedVehicle(ps.currentSlot.carID))
        setOpenDrawer(false)
    }

    //returns a vehicle data with associated slot for the vehicle table
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

            {/*  ---------------------MODAL FORM FOR PARKING----------------------*/}
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


            {/*  --------------------------DRAWER DETAILS-------------------*/}
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
                    {ps.currentSlot.status === 'leave' &&
                        <Box>
                            <Typography className="text-sm font-bold text-gray-500 text-center">
                                Time Out:
                            </Typography>
                            <Typography className="text-xl font-bold text-gray-800">
                                {format(parseISO(ps.currentSlot.timeOut), "PPpp")}
                            </Typography>
                        </Box>
                    }
                    {ps.currentSlot.status === 'occupied' &&
                        <Box>
                            <Typography className="text-sm font-bold text-gray-500 text-center">
                                Time Parked:
                            </Typography>
                            <Typography className="text-xl font-bold text-gray-800">
                                {format(parseISO(ps.currentSlot.timeIn), "PPpp")}
                            </Typography>
                        </Box>
                    }
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