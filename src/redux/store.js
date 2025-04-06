import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "./reducer/notification";

const store = configureStore({
  reducer: {
    notification: notificationReducer,
  },
});

export default store;
