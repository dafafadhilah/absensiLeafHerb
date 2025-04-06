import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  count: {
    KoreksiAbsensi: 0,
    PengajuanLembur: 0,
  }, // Jumlah pending koreksi absensi
};

const notification = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotificationCount: (state, action) => {
      state.count = action.payload; // Update jumlah koreksi
    },
  },
});

export const { setNotificationCount } = notification.actions;
export default notification.reducer;
