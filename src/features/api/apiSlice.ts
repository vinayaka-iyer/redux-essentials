import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { type Post, type NewPost, PostUpdate } from '../posts/postsSlice'
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
    getUsers: builder.query<User[], void>({
      query: () => '/users',
    }),
  }),
})

export const { useGetPostsQuery, useGetPostQuery, useAddNewPostMutation, useEditPostMutation, useGetUsersQuery } =
  apiSlice
