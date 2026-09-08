import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { authApi } from "./api/authapi";
import { productApi } from "./api/product.api";
import { orderApi } from "./api/order.api";
import { userApi } from "./api/user.api";
import { paymentApi } from "./api/payment.api";
import { campaignApi } from "./api/campaign.api";
import { collectionApi } from "./api/collection.api";
import { aboutApi } from "./api/about.api";
import { messageApi } from "./api/message.api";
import authReducer from "./slice/auth.slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      [productApi.reducerPath]: productApi.reducer,
      [orderApi.reducerPath]: orderApi.reducer,
      [userApi.reducerPath]: userApi.reducer,
      [paymentApi.reducerPath]: paymentApi.reducer,
      [campaignApi.reducerPath]: campaignApi.reducer,
      [collectionApi.reducerPath]: collectionApi.reducer,
      [aboutApi.reducerPath]: aboutApi.reducer,
      [messageApi.reducerPath]: messageApi.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        productApi.middleware,
        orderApi.middleware,
        userApi.middleware,
        paymentApi.middleware,
        campaignApi.middleware,
        collectionApi.middleware,
        aboutApi.middleware,
        messageApi.middleware
      ),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
