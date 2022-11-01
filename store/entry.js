import { createSlice } from '@reduxjs/toolkit';

export const entryStore = createSlice({
    name: 'entry',
    initialState: {
        entries: [],
        currentEntry: {
            id: '',
            entryGate: ''
        }
    },
    reducers: {
        setEntries: (state, action) => {
            state.entries = [...action.payload]
        },

        setCurrentEntry: (state, action) => {
            const { id, entryGate } = action.payload

            state.currentEntry = { ...state.currentEntry, id, entryGate }
        }
    }
})

export const { setEntries, setCurrentEntry } = entryStore.actions

export default entryStore.reducer