import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import type { Post } from '../posts/postsSlice'
export type { Post }

export const apiSlice = createApi({
  reducerPath: 'api', // optional
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  endpoints: (builder) => ({
    // builder.query() accepts two generic arguments <ReturnType, ArgumentType>
    getPosts: builder.query<Post[], void>({
      // a query operation that returns Post[] array
      query: () => '/posts',
    }),
  }),
})

export const { useGetPostsQuery } = apiSlice
