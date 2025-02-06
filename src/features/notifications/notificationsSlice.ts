import { createAppAsyncThunk } from '@/app/withTypes'
import { createSlice, createEntityAdapter, createSelector, createAction, isAnyOf } from '@reduxjs/toolkit'
import { client } from '@/api/client'
import { forceGenerateNotifications } from '@/api/server'
import type { AppThunk, RootState } from '@/app/store'
import { apiSlice } from '../api/apiSlice'

export interface ServerNotification {
  id: string
  date: string
  message: string
  user: string
}

export interface NotificationMetadata {
  id: string
  read: boolean
  isNew: boolean
}

const notificationsReceived = createAction<ServerNotification[]>('notifications/notificationsReceived')

export const apiSliceWithNotifications = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<ServerNotification[], void>({
      query: () => '/notifications',

      async onCacheEntryAdded(arg, lifecycleApi) {
        // create a websocket connection when cache subscription starts
        const ws = new WebSocket('ws://localhost')
        try {
          // wait for initial query to resolve before proceeding
          await lifecycleApi.cacheDataLoaded

          // update our query result when data is received form server
          const listener = (event: MessageEvent<string>) => {
            const message: {
              type: 'notifications'
              payload: ServerNotification[]
            } = JSON.parse(event.data)
            switch (message.type) {
              case 'notifications': {
                lifecycleApi.updateCachedData((draft) => {
                  // insert all notifications from ws into existing RTKQ cache
                  draft.push(...message.payload)
                  draft.sort((a, b) => b.date.localeCompare(a.date))
                })

                // dispatch an additional action so we can track 'read' state
                lifecycleApi.dispatch(notificationsReceived(message.payload))
                break
              }
              default:
                break
            }
          }
          ws.addEventListener('message', listener)
        } catch {}
        await lifecycleApi.cacheEntryRemoved
        // perform cleanup once the 'cacheEntryRemoved' promise resolves
        ws.close()
      },
    }),
  }),
})

export const fetchNotificationsWebsocket = (): AppThunk => (dispatch, getState) => {
  const allNotifications = selectNotificationsData(getState())
  const [lastestNotification] = allNotifications
  const latestTimestamp = lastestNotification?.date ?? ''

  // hardcode to simlate a server push scenario over websockets
  forceGenerateNotifications(latestTimestamp)
}

const emptyNotifications: ServerNotification[] = []

export const selectNotificationsResult = apiSliceWithNotifications.endpoints.getNotifications.select()

const selectNotificationsData = createSelector(
  selectNotificationsResult,
  (notificationsResult) => notificationsResult.data ?? emptyNotifications,
)

export const { useGetNotificationsQuery } = apiSliceWithNotifications

const matchNotificationsReceived = isAnyOf(
  notificationsReceived,
  apiSliceWithNotifications.endpoints.getNotifications.matchFulfilled,
)

const metadataAdapter = createEntityAdapter<NotificationMetadata>()

const initialState = metadataAdapter.getInitialState()

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    allNotificationsRead(state) {
      Object.values(state.entities).forEach((metadata) => {
        metadata.read = true
      })
    },
  },
  extraReducers(builder) {
    builder.addMatcher(matchNotificationsReceived, (state, action) => {
      const notificationsMetadata: NotificationMetadata[] = action.payload.map((notification) => ({
        id: notification.id,
        read: false,
        isNew: true,
      }))

      Object.values(state.entities).forEach((metadata) => {
        metadata.isNew = !metadata.read
      })

      metadataAdapter.upsertMany(state, notificationsMetadata)
    })
  },
})

export const { allNotificationsRead } = notificationsSlice.actions

export default notificationsSlice.reducer

export const { selectAll: selectAllNotificationsMetadata, selectEntities: selectMetadataEntities } =
  metadataAdapter.getSelectors((state: RootState) => state.notifications)

export const selectUnreadNotificationsCount = (state: RootState) => {
  const allNotifications = selectAllNotificationsMetadata(state)
  const unreadNotifications = allNotifications.filter((metadata) => !metadata.read)
  return unreadNotifications.length
}
