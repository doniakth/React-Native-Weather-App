import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import weatherReducer from './slices/weatherSlice';
import favoritesReducer from './slices/favoritesSlice';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['weather', 'favorites'], // Persist both weather and favorites
};

const rootReducer = combineReducers({
    weather: weatherReducer,
    favorites: favoritesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);
