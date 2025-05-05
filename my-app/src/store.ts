import { configureStore } from '@reduxjs/toolkit';
import appReducer from './features/app/appSlice';
import authReducer from './features/auth/authSlice';

const store = configureStore({
    reducer: {
        app: appReducer,
        auth: authReducer,
        // Add other reducers here if needed
    },
});

// Define RootState and AppDispatch types for use throughout your app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;