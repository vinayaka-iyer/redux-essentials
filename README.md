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

## Using Data

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
