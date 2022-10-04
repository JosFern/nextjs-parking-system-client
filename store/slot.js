import { createSlice } from '@reduxjs/toolkit';
import { differenceInDays, differenceInHours, differenceInMinutes, formatISO, parseISO } from 'date-fns';
import _ from 'lodash'

export const parkinglotStore = createSlice({
    name: 'slot',
    initialState: {
        slots: [],
        currentSlot: {
            number: '',
            slotType: 0,
            carID: 0,
            carSize: 0,
            timeIn: '2022-01-01T08:00:00+08:00',
            currTime: '2022-01-01T08:00:00+08:00',
            totalPayment: 0,
            status: '',
            timeOut: null
        }
    },
    reducers: {
        setSlots: (state, action) => {
            state.slots = [...action.payload]
        },

        updateSlot: (state, action) => {
            const { carID, slot } = action.payload
            const index = _.findIndex(state.slots, { number: slot })

            state.slots[index] = { ...state.slots[index], vehicle: carID, status: 'occupied' }
        },

        unparkSlot: (state, action) => {
            const index = _.findIndex(state.slots, { number: action.payload })

            state.slots[index] = { ...state.slots[index], vehicle: null, status: 'available' }
        },

        markLeaveSlot: (state, action) => {
            const index = _.findIndex(state.slots, { number: action.payload })

            state.slots[index] = { ...state.slots[index], status: 'leave' }
        },

        markReturnedSlot: (state, action) => {
            const index = _.findIndex(state.slots, { number: action.payload })

            state.slots[index] = { ...state.slots[index], status: 'occupied' }
        },

        calculatePayment: (state, action) => {
            const { carID, slotNum, slotType, carSize, timeIn, timeOut } = action.payload

            const currTime = new Date();

            const dayDiff = differenceInDays(currTime, parseISO(timeIn))
            const hoursDiff = differenceInHours(currTime, parseISO(timeIn));
            const minutesDiff = differenceInMinutes(currTime, parseISO(timeIn)) % 60;

            const flatRate = 40;    //starting rate upon parking

            const fullChunk = 5000; //if vehicle stayed for 24 hours long

            const exceedHrRate = 3; //starts hourly charge if exceeded 3 hours

            const carCharge = slotType === 0 ? 20 : slotType === 1 ? 60 : 100

            let payment = dayDiff > 0 ? dayDiff * fullChunk : flatRate

            if (hoursDiff >= exceedHrRate) payment += (hoursDiff - exceedHrRate) * carCharge

            if (dayDiff > 0) payment -= ((dayDiff * (24 - exceedHrRate)) * carCharge)

            if (hoursDiff >= exceedHrRate && Math.round(minutesDiff / 60) === 1) payment += carCharge
            //oks nani siya

            const getSlotStatus = _.find(state.slots, { number: slotNum })


            state.currentSlot = {
                ...state.currentSlot,
                number: slotNum,
                slotType,
                carID,
                carSize,
                timeIn,
                currTime: formatISO(currTime),
                totalPayment: payment,
                status: getSlotStatus.status,
                timeOut: timeOut
            }

        }
    }
})

export const { setSlots, updateSlot, unparkSlot, markLeaveSlot, markReturnedSlot, calculatePayment } = parkinglotStore.actions

export default parkinglotStore.reducer