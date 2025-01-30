# Documentation

## Basic Redux Data Flow

- A Redux app has a single store that is passed to React components via a <Provider> component
- Redux state is updated by "reducer functions":
  - Reducers always calculate a new state immutably, by copying existing state values and modifying the copies with the new data
  - The Redux Toolkit createSlice function generates "slice reducer" functions for you, and lets you write "mutating" code that is turned into safe immutable updates
  - Those slice reducer functions are added to the reducer field in configureStore, and that defines the data and state field names inside the Redux store
- React components read data from the store with the useSelector hook
  - Selector functions receive the whole state object, and should return a value
  - Selectors will re-run whenever the Redux store is updated, and if the data they return has changed, the component will re-render
- React components dispatch actions to update the store using the useDispatch hook
  - createSlice will generate action creator functions for each reducer we add to a slice
  - Call dispatch(someActionCreator()) in a component to dispatch an action
  - Reducers will run, check to see if this action is relevant, and return new state if appropriate
  - Temporary data like form input values should be kept as React component state or plain HTML input fields. Dispatch a Redux action to update the store when the user is done with the form.
- If you're using TypeScript, the initial app setup should define TS types for RootState and AppDispatch based on the store, and export pre-typed versions of the React-Redux useSelector and useDispatch hooks
