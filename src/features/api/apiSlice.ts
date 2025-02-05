import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Post, NewPost } from '../posts/postsSlice'
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
      providesTags: ['Post'],
    }),
    getPost: builder.query<Post, string>({
      query: (postId) => `/posts/${postId}`,
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
  }),
})

export const { useGetPostsQuery, useGetPostQuery, useAddNewPostMutation } = apiSlice
