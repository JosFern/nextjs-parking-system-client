import { Box, Button, Modal, Typography, FormControl, InputLabel, Select, MenuItem, Drawer, TextField } from "@mui/material";
import _, { map } from 'lodash'
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { setSlots, setAvailableSlot, setCurrentSlot, setCurrentSlotPayment } from "../../store/slot";
import SlotGrid from "../../components/slotGrid";
import ParkingLotTable from "../../components/parkinglotTable";
import { setVehicles } from "../../store/vehicle";
import { differenceInHours, format, formatISO, parseISO } from "date-fns";
import { axiosBase, decryptParams, encryptParams } from "../../util/authToken";
import { setCurrentEntry, setEntries } from "../../store/entry";
import EntriesTable from "../../components/entries";


export default function ParkingLot() {

    const dispatch = useDispatch()
    const ps = useSelector(state => state.slot)
    const car = useSelector(state => state.vehicle)
    const gate = useSelector(state => state.entry)

    const [parkModal, setParkModal] = useState(false)
    const [isOpenDrawer, setOpenDrawer] = useState(false)
    const [entryModal, setEntryModal] = useState(false)
    const [deleteEntryModal, setDeleteEntryModal] = useState(false)
    const [entryErrorMessage, setEntryErrorMessage] = useState('')
    const [entryError, setEntryError] = useState(false)

    const [entry, setEntry] = useState({
        nearestSlot: '',
        entryGate: ''
    })

    const [vehicle, setVehicle] = useState({
        plateNo: '',
        vehicleType: '',
        entry: '',
    })

    useEffect(() => {
        const initializeApi = async () => {
            await getSlots()
            await getVehicles()
            await getEntries()
        }

        initializeApi()

    }, [dispatch, getSlots, getVehicles, getEntries])

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
            dispatch(setSlots(data))
        }
    }, [dispatch])

    //GET VEHICLES DATA
    const getVehicles = useCallback(async () => {
        const vehicles = await axiosBase().get('/vehicle').catch(err => console.log("error: " + err))

        if (vehicles.status === 200) {
            const data = await decryptParams(vehicles.data)
            dispatch(setVehicles(data))
        }
    }, [dispatch])

    //GET ENTRIES DATA
    const getEntries = useCallback(async () => {
        const entries = await axiosBase().get('/entry').catch(err => console.log("error: " + err))

        if (entries.status === 200) {
            const data = await decryptParams(entries.data)
            dispatch(setEntries(data))
        }
    }, [dispatch])

    //HANDLES FORM ONCHANGE
    const handleChange = (e) => {
        const { name, value } = e.target
        setVehicle({
            ...vehicle,
            [name]: value
        })
    }

    //HANDLES ENTRY FORM ONCHANGE
    const entryHandleChange = (e) => {
        const { name, value } = e.target
        setEntry({
            ...entry,
            [name]: value
        })
    }

    //HANDLES PARKING VEHICLE SUBMITION
    const handleParkSubmit = async (e) => {
        e.preventDefault()

        const { vehicleType, plateNo } = vehicle

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

    //HANDLES ADDING NEW GATE ENTRY FORM SUBMITION
    const handleEntrySubmit = async (e) => {
        e.preventDefault()
        setEntryError(false)
        setEntryErrorMessage('')

        const encryptEntryData = await encryptParams(entry)

        const addEntry = await axiosBase().post(`/entry`, JSON.stringify(encryptEntryData))
            .catch(err => {
                setEntryError(true)
                setEntryErrorMessage(err?.response?.data)
            })

        if (addEntry?.status === 201) {

            await getEntries()

            setEntry({
                nearestSlot: '',
                entryGate: ''
            })

            setEntryModal(false)
        }

    }

    //HANDLES TO CALL CALCULATE TOTAL PAYMENT AND OPENS DRAWER
    const openDetailsDrawer = async (slotNumber, plateNo) => {
        setOpenDrawer(true)

        const payment = await axiosBase().get(`/vehicle/payment/${plateNo}`)
            .catch(err => console.log("error: " + err))

        if (payment.status === 200) {
            const data = await decryptParams(payment.data)
            console.log(data);
            dispatch(setCurrentSlotPayment(data))
        }
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

    //OPENS ENTRY DELETION VERIFICATION MODAL
    const openEntryDeletionModal = (entry) => {
        dispatch(setCurrentEntry(entry))
        setDeleteEntryModal(true)
    }

    //HANDLES ENTRY DELETION SUBMITION
    const handleEntryDeleteSubmit = async (e) => {
        e.preventDefault()

        if (gate.entries.length <= 3) {
            alert("You cannot have less than 3 Gate entries")
        } else {

            const deleteEntry = await axiosBase().delete(`/entry/${gate.currentEntry.id}`)
                .catch(err => console.log("error: " + err))

            if (deleteEntry.status === 200) {
                await getEntries()
                setDeleteEntryModal(false)
            }
        }

    }

    //handles vehicle leaving and update slot status
    const handleTemporaryLeave = async () => {

        const encryptLeaveSlotData = await encryptParams({ vehicle: ps.currentSlot.plateNo, status: "leave" })

        const markLeaveSlot = await axiosBase().put(`/slot/${ps.currentSlot.id}`, JSON.stringify(encryptLeaveSlotData))
            .catch(err => console.log("error: " + err))

        const encryptLeaveVehicleData = await encryptParams({ timeIn: ps.currentSlot.timeIn, timeOut: formatISO(new Date()) })

        const markLeaveVehicle = await axiosBase().put(`/vehicle/${ps.currentSlot.vehicleID}`, JSON.stringify(encryptLeaveVehicleData))
            .catch(err => console.log("error: " + err))

        if (markLeaveSlot?.status === 200 && markLeaveVehicle?.status === 200) {
            await getSlots()
            await getVehicles()
            setOpenDrawer(false)
        }
    }

    //handles vehicle returning and update slot status
    const handleReturn = async () => {
        const encryptReturnToSlotData = await encryptParams({ vehicle: ps.currentSlot.plateNo, status: "occupied" })

        const markReturnedSlot = await axiosBase().put(`/slot/${ps.currentSlot.id}`, JSON.stringify(encryptReturnToSlotData))
            .catch(err => console.log("error: " + err))

        let encryptReturnVehicleData = ''

        if (differenceInHours(new Date(), parseISO(ps.currentSlot.timeOut)) > 0) {
            encryptReturnVehicleData = await encryptParams({ timeIn: formatISO(new Date()), timeOut: "" })
        } else {
            encryptReturnVehicleData = await encryptParams({ timeIn: ps.currentSlot.timeIn, timeOut: "" })
        }

        const markReturnedVehicle = await axiosBase().put(`/vehicle/${ps.currentSlot.vehicleID}`, JSON.stringify(encryptReturnVehicleData))
            .catch(err => console.log("error: " + err))

        if (markReturnedSlot?.status === 200 && markReturnedVehicle?.status === 200) {
            await getSlots()
            await getVehicles()
            setOpenDrawer(false)
        }
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
                <Box className="w-[90%] flex gap-2">
                    <Button onClick={() => setParkModal(true)} className="bg-[#27ae60] w-[50%]" variant="contained" color='success'>
                        Park
                    </Button>
                    <Button onClick={() => setEntryModal(true)} className="bg-[#e1b12c] w-[50%] text-white" variant="contained" color='primary'>
                        Add new Entry
                    </Button>

                </Box>
                <Box className="h-[80vh] overflow-auto">
                    <ParkingLotTable vehicles={car.vehicles} openDetailsDrawer={openDetailsDrawer} />

                </Box>
            </Box>
            <Box className="flex flex-col items-start">
                <Typography className="text-gray-800 font-bold text-2xl">Parking Lot Overview</Typography>
                <Box className="flex items-start gap-3 mt-6">
                    <Box className="flex bg-white p-4 rounded-lg shadow-md">
                        <SlotGrid slots={ps.slots} openDetailsDrawer={openDetailsDrawer} />
                    </Box>
                    <EntriesTable entries={gate.entries} deleteEntry={openEntryDeletionModal} />
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
                            {map(gate.entries, (entry) => (
                                <MenuItem key={entry.id} value={entry.entryGate}>{entry.entryGate}</MenuItem>
                            ))}
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

            {/*  ---------------------MODAL FORM FOR ADDING NEW ENTRY----------------------*/}
            <Modal
                open={entryModal}
                onClose={() => setEntryModal(false)}
            >
                <Box component="form" onSubmit={handleEntrySubmit} className="absolute top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%] w-[300px] bg-white rounded-md shadow-md flex flex-col items-center gap-3 p-4">
                    <Typography variant="h6" component="h2">
                        Add new Entry
                    </Typography>

                    <FormControl required fullWidth margin='dense'>
                        <InputLabel>Pick nearest slot</InputLabel>
                        <Select
                            name='nearestSlot'
                            label="Pick nearest slot"
                            value={entry.nearestSlot}
                            onChange={entryHandleChange}
                        >
                            {map(ps.slots, (slot) => (
                                <MenuItem key={slot.id} value={slot.slotNumber}>{slot.slotNumber}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField error={entryError} id="outlined-basic" required fullWidth label="Entry Gate Letter/Name" variant="outlined" value={entry.entryGate} onChange={entryHandleChange} name='entryGate' />

                    {entryError &&
                        <Typography className='self-center' color='error'>
                            {entryErrorMessage}
                        </Typography>
                    }

                    <Button type="submit" className="bg-[#27ae60]" variant="contained" color='success'>Add Entry</Button>
                </Box>

            </Modal>

            {/*  ---------------------MODAL FORM FOR DELETING ENTRY----------------------*/}
            <Modal
                open={deleteEntryModal}
                onClose={() => setDeleteEntryModal(false)}
            >
                <Box component="form" onSubmit={handleEntryDeleteSubmit} className="absolute top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%] w-[300px] bg-white rounded-md shadow-md flex flex-col items-center gap-3 p-4">
                    <Typography variant="h6" component="h2">
                        Are you sure you want to delete Entry <Box className="text-[#1abc9c] font-bold" component='span'>{gate.currentEntry.entryGate}</Box> ?
                    </Typography>

                    <Box className="flex gap-4">
                        <Button
                            type="submit"
                            className="bg-[#c23616]"
                            variant="contained"
                            color='error'
                        >
                            Yes
                        </Button>
                        <Button
                            onClick={() => setDeleteEntryModal(false)}
                            className="bg-[#27ae60]"
                            variant="contained"
                            color='success'
                        >
                            No
                        </Button>
                    </Box>

                </Box>

            </Modal>
        </Box>
    )
}