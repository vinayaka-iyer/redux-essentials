# Documentation

## Basic Redux Data Flow

- A Redux app has a single `store` that is passed to React components via a `<Provider>` component
- Redux state is updated by "reducer functions":
  - Reducers always calculate a new state _immutably_, by copying existing state values and modifying the copies with the new data
  - The Redux Toolkit `createSlice` function generates "slice reducer" functions for you, and lets you write "mutating" code that is turned into safe immutable updates
  - Those slice reducer functions are added to the `reducer` field in `configureStore`, and that defines the data and state field names inside the Redux store
- React components read data from the store with the `useSelector` hook
  - Selector functions receive the whole `state` object, and should return a value
  - Selectors will re-run whenever the Redux store is updated, and if the data they return has changed, the component will re-render
- React components dispatch actions to update the store using the `useDispatch` hook
  - `createSlice` will generate action creator functions for each reducer we add to a slice
  - Call `dispatch(someActionCreator())` in a component to dispatch an action
  - Reducers will run, check to see if this action is relevant, and return new state if appropriate
  - Temporary data like form input values should be kept as React component state or plain HTML input fields. Dispatch a Redux action to update the store when the user is done with the form.
- If you're using TypeScript, the initial app setup should define TS types for `RootState` and `AppDispatch` based on the store, and export pre-typed versions of the React-Redux `useSelector` and `useDispatch` hooks

## Using Redux Data

- Any React component can use data from the Redux store as needed
  - Any component can read any data that is in the Redux store
  - Multiple components can read the same data, even at the same time
  - Components should extract the smallest amount of data they need to render themselves
  - Components can combine values from props, state, and the Redux store to determine what UI they need to render. They can read multiple pieces of data from the store, and reshape the data as needed for display.
  - Any component can dispatch actions to cause state updates
- Redux action creators can prepare action objects with the right contents
  - `createSlice` and `createAction` can accept a "prepare callback" that returns the action payload
  - Unique IDs and other random values should be put in the action, not calculated in the reducer
- Reducers should contain the actual state update logic
  - Reducers can contain whatever logic is needed to calculate the next state
  - Action objects should contain just enough info to describe what happened
- You can write reusable "selector" functions to encapsulate reading values from the Redux state
  - Selectors are functions that get the Redux `state` as an argument, and return some data
- Actions should be thought of as describing "events that happened", and many reducers can respond to the same dispatched action

  - Apps should normally only dispatch one action at a time
  - Case reducer names (and actions) should typically be named past-tense, like `postAdded`
  - Many slice reducers can each do their own state updates in response to the same action
  - `createSlice.extraReducers` lets slices listen for actions that were defined outside of the slice
  - State values can be reset by returning a new value from the case reducer as a replacement, instead of mutating the existing state

## Async Logic and Data Fetching

- Redux uses plugins called "middleware" to enable async logic
  - The standard async middleware is called `redux-thunk`, which is included in Redux Toolkit
  - Thunk functions receive `dispatch` and `getState` as arguments, and can use those as part of async logic
- You can dispatch additional actions to help track the loading status of an API call
  - The typical pattern is dispatching a "pending" action before the call, then either a "success" containing the data or a "failure" action containing the error
  - Loading state should usually be stored as an enum, like `'idle' | 'pending' | 'succeeded' | 'rejected'`
- Redux Toolkit has a `createAsyncThunk` API that dispatches these actions for you

  - `createAsyncThunk` accepts a "payload creator" callback that should return a Promise, and generates `pending/fulfilled/rejected` action types automatically
  - Generated action creators like `fetchPosts` dispatch those actions based on the Promise you return
  - You can listen for these action types in `createSlice` using the `extraReducers` field, and update the state in reducers based on those actions.
  - `createAsyncThunk` has a `condition` option that can be used to cancel a request based on the Redux state

## Performance, Normalizing Data and Reactive Logic

- Memoized selector functions can be used to optimize performance
  - Redux Toolkit re-exports the `createSelector` function from Reselect, which generates memoized selectors
  - Memoized selectors will only recalculate the results if the input selectors return new values
  - Memoization can skip expensive calculations, and ensure the same result references are returned
- There are multiple patterns you can use to optimize React component rendering with Redux
  - Avoid creating new object/array references inside of `useSelector` \- those will cause unnecessary re-renders
  - Memoized selector functions can be passed to `useSelector` to optimize rendering
  - `useSelector` can accept an alternate comparison function like `shallowEqual` instead of reference equality
  - Components can be wrapped in `React.memo()` to only re-render if their props change
  - List rendering can be optimized by having list parent components read just an array of item IDs, passing the IDs to list item children, and retrieving items by ID in the children
- Normalized state structure is a recommended approach for storing items
  - "Normalization" means no duplication of data, and keeping items stored in a lookup table by item ID
  - Normalized state shape usually looks like `{ids: [], entities: {}}`
- Redux Toolkit's `createEntityAdapter` API helps manage normalized data in a slice
  - Item IDs can be kept in sorted order by passing in a `sortComparer` option
  - The adapter object includes:
    - `adapter.getInitialState`, which can accept additional state fields like loading state
    - Prebuilt reducers for common cases, like `setAll`, `addMany`, `upsertOne`, and `removeMany`
    - `adapter.getSelectors`, which generates selectors like `selectAll` and `selectById`
- Redux Toolkit's `createListenerMiddleware` API is used to run reactive logic in response to dispatched actions
  - The listener middleware should be added to the store setup, with the right store types attached
  - Listeners are typically defined in slice files, but may be structured other ways as well
  - Listeners can match against individual actions, many actions, or use custom comparisons
  - Listener effect callbacks can contain any sync or async logic
  - The `listenerApi` object provides many methods for managing async workflows and behavior
