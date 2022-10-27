import { Box, Button, Modal, Typography, FormControl, InputLabel, Select, MenuItem, Drawer, TextField } from "@mui/material";
import slots from '../../_sample-data/slots'
import _ from 'lodash'
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { calculatePayment, markLeaveSlot, markReturnedSlot, setSlots, unoccupySlot, occupySlot, setAvailableSlot, setCurrentSlot } from "../../store/slot";
import SlotGrid from "../components/slotGrid";
import ParkingLotTable from "../components/parkinglotTable";
import { parkVehicle, unparkVehicle, markLeaveVehicle, markReturnedVehicle, setVehicles } from "../../store/vehicle";
import { format, formatISO, parseISO } from "date-fns";
import { axiosBase, decryptParams, encryptParams } from "../../util/authToken";


export default function ParkingLot() {

    const dispatch = useDispatch()
    const ps = useSelector(state => state.slot)
    const car = useSelector(state => state.vehicle)

    const [parkModal, setParkModal] = useState(false)
    const [isOpenDrawer, setOpenDrawer] = useState(false)

    const [vehicle, setVehicle] = useState({
        plateNo: '',
        vehicleType: '',
        entry: '',
    })

    useEffect(() => {
        const initializeApi = async () => {
            await getSlots()
            await getVehicles()
        }

        initializeApi()

    }, [dispatch, getSlots, getVehicles])

    useEffect(() => {
        console.log("nigana");
        if (vehicle.entry && vehicle.vehicleType) {
            getAvailableSlot(vehicle.entry, vehicle.vehicleType)
        }
    }, [vehicle.entry, vehicle.vehicleType, getAvailableSlot])

    //GET AVAILABLE SLOT
    const getAvailableSlot = useCallback(async (entry, vehicleType) => {
        const slot = await axiosBase().get(`/slot?entry=${entry}&vehicleType=${vehicleType}`)
            .catch(err => console.log("error: " + err))

        if (slot.status === 200) {
            const data = await decryptParams(slot.data)
            dispatch(setAvailableSlot(data))
        }
    }, [dispatch])

    //GET SLOTS DATA
    const getSlots = useCallback(async () => {
        const slots = await axiosBase().get('/slot').catch(err => console.log("error: " + err))

        if (slots.status === 200) {
            const data = await decryptParams(slots.data)
            console.log(data);
            dispatch(setSlots(data))
        }
    }, [dispatch])

    //GET VEHICLES DATA
    const getVehicles = useCallback(async () => {
        const vehicles = await axiosBase().get('/vehicle').catch(err => console.log("error: " + err))

        if (vehicles.status === 200) {
            const data = await decryptParams(vehicles.data)
            console.log(data);
            dispatch(setVehicles(data))
        }
    }, [dispatch])

    //HANDLES FORM ONCHANGE
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
    const handleParkSubmit = async (e) => {
        e.preventDefault()

        const { vehicleType, plateNo } = vehicle

        console.log(vehicle);

        const encryptSlotData = await encryptParams(
            { vehicle: plateNo, status: "occupied" }
        )

        const encryptVehicleData = await encryptParams(
            { vehicleType: Number(vehicleType), timeIn: formatISO(new Date()), plateNo }
        )

        const occupySlot = await axiosBase().put(`/slot/${ps.availableSlot.id}`, JSON.stringify(encryptSlotData))
            .catch(err => console.log("error: " + err))

        const parkVehicle = await axiosBase().post(`/vehicle`, JSON.stringify(encryptVehicleData))
            .catch(err => console.log("error: " + err))

        if (occupySlot.status === 200 && parkVehicle.status === 201) {
            await getSlots()
            await getVehicles()

            setParkModal(false)

            setVehicle({
                ...vehicle,
                vehicleType: '',
                entry: '',
                plateNo: ''
            })
        }
    }

    //handles to call calculate total payment and opens drawer
    const openDetailsDrawer = (slotNumber, plateNo) => {
        setOpenDrawer(true)

        const vehicleInfo = _.find(car.vehicles, { plateNo: plateNo })

        const slotInfo = _.find(ps.slots, { slotNumber: slotNumber })

        dispatch(setCurrentSlot({ ...vehicleInfo, ...slotInfo }))
    }

    //handles vehicle to unpark/delete vehicle/update slot status
    const handleUnpark = async () => {

        const encryptSlotData = await encryptParams(
            { vehicle: "", status: "available" }
        )

        const unoccupySlot = await axiosBase().put(`/slot/${ps.currentSlot.id}`, JSON.stringify(encryptSlotData))
            .catch(err => console.log("error: " + err))

        const unparkVehicle = await axiosBase().delete(`/vehicle/${ps.currentSlot.vehicleID}`)
            .catch(err => console.log("error: " + err))

        if (unoccupySlot.status === 200 && unparkVehicle.status === 200) {
            await getSlots()
            await getVehicles()
            setOpenDrawer(false)
        }
    }

    //handles vehicle leaving and update slot status
    const handleTemporaryLeave = () => {
        // dispatch(markLeaveSlot(ps.currentSlot.number))
        // dispatch(markLeaveVehicle(ps.currentSlot.carID))
        // setOpenDrawer(false)
    }

    //handles vehicle returning and update slot status
    const handleReturn = () => {
        // dispatch(markReturnedSlot(ps.currentSlot.number))
        // dispatch(markReturnedVehicle(ps.currentSlot.carID))
        // setOpenDrawer(false)
    }

    return (
        <Box className="flex justify-start items-start gap-4 min-h-screen text-center text-gray-800 bg-[#f0f2f5] ">
            <Box className="flex flex-col bg-white min-h-screen gap-3 w-[400px] justify-start items-center">
                <Typography className="text-gray-800 font-bold text-2xl">
                    Parking Allocation System
                </Typography>
                <Button onClick={() => setParkModal(true)} className="bg-[#27ae60] w-[30%]" variant="contained" color='success'>
                    Park
                </Button>
                <Box className="h-[80vh] overflow-auto">
                    <ParkingLotTable vehicles={car.vehicles} openDetailsDrawer={openDetailsDrawer} />

                </Box>
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

                    <TextField id="outlined-basic" required fullWidth label="Plate No." variant="outlined" value={vehicle.plateNo} onChange={handleChange} name='plateNo' />

                    <FormControl required fullWidth margin='dense'>
                        <InputLabel>Vehicle Type</InputLabel>
                        <Select
                            name='vehicleType'
                            label="Vehicle Type"
                            value={vehicle.vehicleType}
                            onChange={handleChange}
                        >
                            <MenuItem value="0">Small</MenuItem>
                            <MenuItem value="1">Medium</MenuItem>
                            <MenuItem value="2">Large</MenuItem>
                        </Select>
                    </FormControl>

                    {vehicle.entry && vehicle.vehicleType &&
                        <Typography variant="h5" component="h2">
                            Available Slot: <Box variant='h5' className="text-[#192a56] font-semibold tracking-wider" component='span'>{ps.availableSlot.slotNumber}</Box>
                        </Typography>
                    }

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
                                Plate No.:
                            </Typography>
                            <Typography className="text-xl font-bold text-gray-800">
                                {ps.currentSlot.plateNo}
                            </Typography>

                        </Box>
                        <Box>
                            <Typography className="text-sm font-bold text-gray-500">
                                Type:
                            </Typography>
                            <Typography className="text-xl font-bold text-gray-800">
                                {ps.currentSlot.vehicleType === 0 ? "Small" : ps.currentSlot.vehicleType === 1 ? "Medium" : "Large"}
                            </Typography>

                        </Box>
                    </Box>

                    <Box className="flex gap-8 text-center">
                        <Box>
                            <Typography className="text-sm font-bold text-gray-500">
                                Slot:
                            </Typography>
                            <Typography className="text-xl font-bold text-gray-800">
                                {ps.currentSlot.slotNumber}
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
                        Total Payment: P0
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