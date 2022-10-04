import { createSlice } from "@reduxjs/toolkit";
import { differenceInHours, formatISO, parseISO } from "date-fns";

export const Vehicle = createSlice({
    name: 'vehicle',
    initialState: {
        vehicles: [], //{id: 0, type: 0(small), timeIn: (date), timeOut: (date)}
    },
    reducers: {
        setVehicles: (state, action) => {
            state.vehicles = [...action.payload]
        },

        addVehicle: (state, action) => {
            state.vehicles.push(action.payload)
        },

        deleteVehicle: (state, action) => {
            const index = _.findIndex(state.vehicles, { id: action.payload })

            state.vehicles.splice(index, 1)
        },

        markLeaveVehicle: (state, action) => {

            const index = _.findIndex(state.vehicles, { id: action.payload })

            state.vehicles[index] = { ...state.vehicles[index], timeOut: formatISO(new Date()) }
        },

        markReturnedVehicle: (state, action) => {

            const index = _.findIndex(state.vehicles, { id: action.payload })

            const car = state.vehicles[index]

            const currTime = new Date()

            if (differenceInHours(currTime, parseISO(car.timeOut)) > 0) {
                state.vehicles[index] = { ...car, timeIn: formatISO(new Date()), timeOut: null }
            } else {
                state.vehicles[index] = { ...car, timeOut: null }
            }
        }
    }
})

export const { setVehicles, addVehicle, deleteVehicle, markLeaveVehicle, markReturnedVehicle } = Vehicle.actions

export default Vehicle.reducer