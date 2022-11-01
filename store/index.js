import { combineReducers, configureStore } from '@reduxjs/toolkit';
import parkingLotReducer from './slot';
import vehicleReducer from './vehicle';
import entryReducer from './entry';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'parkinglot',
    storage
}

const reducer = combineReducers({
    slot: parkingLotReducer,
    vehicle: vehicleReducer,
    entry: entryReducer
})

const persistedReducer = persistReducer(persistConfig, reducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false
    })
})