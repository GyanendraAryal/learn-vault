import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  displayName: string;
  includeSources: boolean;
}

const initialState: SettingsState = {
  displayName: "Student",
  includeSources: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setDisplayName: (state, action: PayloadAction<string>) => {
      state.displayName = action.payload.slice(0, 60);
    },
    setIncludeSources: (state, action: PayloadAction<boolean>) => {
      state.includeSources = action.payload;
    },
  },
});

export const { setDisplayName, setIncludeSources } = settingsSlice.actions;
export default settingsSlice.reducer;
