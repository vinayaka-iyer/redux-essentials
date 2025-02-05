import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { type Post, type NewPost, PostUpdate, ReactionName } from '../posts/postsSlice'
import type { User } from '@/features/users/usersSlice'
export type { Post }

export const apiSlice = createApi({
  reducerPath: 'api', // optional
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  // A root tagTypes field in the API slice object, declaring an array of string tag names for data types
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    // builder.query() accepts two generic arguments <ReturnType, ArgumentType>
    getPosts: builder.query<Post[], void>({
      // a query operation that returns Post[] array
      query: () => '/posts',
      // A providesTags array in query endpoints, listing a set of tags describing the data in that query
      providesTags: (result = [], error, arg) => ['Post', ...result.map(({ id }) => ({ type: 'Post', id }) as const)],
    }),
    getPost: builder.query<Post, string>({
      query: (postId) => `/posts/${postId}`,
      providesTags: (result, error, arg) => [{ type: 'Post', id: arg }],
    }),
    addNewPost: builder.mutation<Post, NewPost>({
      query: (initialPost) => ({
        url: '/posts',
        method: 'POST',
        body: initialPost,
      }),
      // An invalidatesTags array in mutation endpoints, listing a set of tags that are invalidated every time that mutation runs
      invalidatesTags: ['Post'],
    }),
    editPost: builder.mutation<Post, PostUpdate>({
      query: (post) => ({
        url: `/posts/${post.id}`,
        method: 'PATCH',
        body: post,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Post', id: arg.id }],
    }),
    addReaction: builder.mutation<Post, { postId: string; reaction: ReactionName }>({
      query: ({ postId, reaction }) => ({
        url: `posts/${postId}/reactions`,
        method: 'POST',
        body: { reaction },
      }),
      // optimistic updates using updateQueryData
      async onQueryStarted({ postId, reaction }, lifecycleApi) {
        const getPostsPatchResult = lifecycleApi.dispatch(
          apiSlice.util.updateQueryData('getPosts', undefined, (draft) => {
            // draft is Immer-wrapped and can be mutated
            const post = draft.find((post) => post.id === postId)
            if (post) {
              post.reactions[reaction]++
            }
          }),
        )

        // we have another copy of the same data in the `getPost` cache
        const getPostPatchResult = lifecycleApi.dispatch(
          apiSlice.util.updateQueryData('getPost', postId, (draft) => {
            draft.reactions[reaction]++
          }),
        )

        // cancel the optimistic update if request fails
        try {
          await lifecycleApi.queryFulfilled
        } catch {
          getPostsPatchResult.undo()
          getPostPatchResult.undo()
        }
      },
    }),
  }),
})

export const { useGetPostsQuery, useGetPostQuery, useAddNewPostMutation, useEditPostMutation, useAddReactionMutation } =
  apiSlice
