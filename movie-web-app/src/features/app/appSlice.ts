import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
    theme: 'light' | 'dark';
}

const initialAppState: AppState = {
    theme: 'dark', 
};

const appSlice = createSlice({
    name: 'app',
    initialState: initialAppState,
    reducers: {
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
    },
});

export const { setTheme } = appSlice.actions;
export default appSlice.reducer;