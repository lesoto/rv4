import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import undoable from 'redux-undo';

import authReducer from '@/store/auth/authSlice';
import buildReducer from '@/store/build/buildSlice';
import modalReducer from '@/store/modal/modalSlice';
import websiteReducer from '@/store/website/websiteSlice';

import syncSaga from './sagas/sync';
import storage from './storage';

const sagaMiddleware = createSagaMiddleware();

const reducers = combineReducers({
  auth: authReducer,
  modal: modalReducer,
  build: buildReducer,
  website: undoable(websiteReducer),
});

const persistedReducers = persistReducer({ key: 'root', storage, whitelist: ['auth', 'build'] }, reducers);

const store = configureStore({
  reducer: persistedReducers,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(sagaMiddleware);
  },
});

sagaMiddleware.run(syncSaga);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
