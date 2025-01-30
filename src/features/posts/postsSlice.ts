import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/app/store'

// Define a TS type for the data
export interface Post {
  id: string
  title: string
  content: string
  user: string
}

// Constructs a type by picking the set of properties
type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>

const initialState: Post[] = [
  { id: '1', title: 'First Post!', content: 'Hello!', user: '0' },
  { id: '2', title: 'Second Post', content: 'More text', user: '2' },
]

// posts slice with initial state
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action: PayloadAction<Post>) {
        state.push(action.payload)
      },
      // can take multiple arguments, generate random values like unique IDs, must return payload object
      prepare(title: string, content: string, userId: string) {
        return {
          payload: { id: nanoid(), title, content, user: userId },
        }
      },
    },
    postUpdated(state, action: PayloadAction<PostUpdate>) {
      const { id, title, content } = action.payload
      const existingPost = state.find((post) => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
  },
})

// export the auto-generated action creators
export const { postAdded, postUpdated } = postsSlice.actions

export default postsSlice.reducer

// Extracting Post Selectors
export const selectAllPosts = (state: RootState) => state.posts

export const selectPostById = (state: RootState, postId: string) => state.posts.find((post) => post.id === postId)
