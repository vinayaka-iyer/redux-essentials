import { configureStore } from '@reduxjs/toolkit'
import type { Action } from '@reduxjs/toolkit'

interface CounterState {
  value: number
}

function counterReducer(state: CounterState = { value: 0 }, action: Action) {
  switch (action.type) {
    default: {
      return state
    }
  }
}

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})

// Types
export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
