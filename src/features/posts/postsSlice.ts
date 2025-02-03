import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/app/store'
import { sub } from 'date-fns'
import { userLoggedOut } from '../auth/authSlice'
import { client } from '@/api/client'
import { createAppAsyncThunk } from '@/app/withTypes'

export interface Reactions {
  thumbsUp: number
  tada: number
  heart: number
  rocket: number
  eyes: number
}

export interface Post {
  id: string
  title: string
  content: string
  user: string
  date: string
  reactions: Reactions
}

export type ReactionName = keyof Reactions

// Constructs a type by picking the set of properties
type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>
type NewPost = Pick<Post, 'title' | 'content' | 'user'>

const initialReactions: Reactions = {
  thumbsUp: 0,
  tada: 0,
  heart: 0,
  rocket: 0,
  eyes: 0,
}
const initialState: PostsState = {
  posts: [],
  status: 'idle',
  error: null,
}

// posts fetch states
interface PostsState {
  posts: Post[]
  status: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
}

// createAsyncThunk: prefix string, payload creator callback function containing data
export const fetchPosts = createAppAsyncThunk(
  'posts/fetchPosts',
  async () => {
    const response = await client.get<Post[]>('/fakeApi/posts')
    return response.data
  },
  {
    // condition callback runs at the start of the call and will cancel entire thunk if condition returns false
    condition(arg, thunkApi) {
      const postsStatus = selectPostsStatus(thunkApi.getState())
      if (postsStatus !== 'idle') {
        return false
      }
    },
  },
)

export const addNewPost = createAppAsyncThunk('/fakeApi/posts', async (initialPost: NewPost) => {
  const response = await client.post<Post>('/fakeApi/posts', initialPost)
  return response.data
})

// posts slice with initial state
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postUpdated(state, action: PayloadAction<PostUpdate>) {
      const { id, title, content } = action.payload
      const existingPost = state.posts.find((post) => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
    reactionAdded(state, action: PayloadAction<{ postId: string; reaction: ReactionName }>) {
      const { postId, reaction } = action.payload
      const existingPost = state.posts.find((post) => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    },
  },
  // can be used to have the slice listen for actions that were defined elsewhere in the app
  extraReducers: (builder) => {
    // Clear out the list of posts whenever the user logs out
    builder
      .addCase(userLoggedOut, (state) => {
        return initialState
      })
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'pending'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.posts.push(...action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unknown Error'
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        state.posts.push(action.payload)
      })
  },
})

// export the auto-generated action creators
export const { postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

// Extracting Post Selectors
export const selectAllPosts = (state: RootState) => state.posts.posts

export const selectPostById = (state: RootState, postId: string) => state.posts.posts.find((post) => post.id === postId)

export const selectPostsStatus = (state: RootState) => state.posts.status
export const selectPostsError = (state: RootState) => state.posts.error
