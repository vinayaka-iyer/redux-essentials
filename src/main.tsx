import React from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'

import { worker } from './api/server'

import './primitiveui.css'
import './index.css'

import { Provider } from 'react-redux'
import { store } from './app/store'
import { apiSlice } from './features/api/apiSlice'
import { apiSliceWithUsers } from './features/users/usersSlice'
// Wrap app rendering so we can wait for the mock API to initialize
async function start() {
  // Start our mock API server
  await worker.start({ onUnhandledRequest: 'bypass' })

  // If we want to fetch the list of users outside of React, we can dispatch the getUsers.initiate() thunk in our index file:
  store.dispatch(apiSliceWithUsers.endpoints.getUsers.initiate())

  const root = createRoot(document.getElementById('root')!)

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  )
}

start()
