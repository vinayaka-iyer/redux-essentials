import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'

// Define a TS type for the data
export interface Post {
  id: string
  title: string
  content: string
}

const initialState: Post[] = [
  { id: '1', title: 'First Post!', content: 'Hello!' },
  { id: '2', title: 'Second Post', content: 'More text' },
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
      prepare(title: string, content: string) {
        return {
          payload: { id: nanoid(), title, content },
        }
      },
    },
    postUpdated(state, action: PayloadAction<Post>) {
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
