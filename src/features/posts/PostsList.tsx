import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Link } from 'react-router-dom'
import PostAuthor from './PostAuthor'
import { TimeAgo } from '@/components/TimeAgo'
import { ReactionButton } from './ReactionButton'
import React, { useEffect } from 'react'
import { Spinner } from '@/components/Spinner'
import { useGetPostsQuery, Post } from '../api/apiSlice'

interface PostExcerptProps {
  post: Post
}

function PostExcerpt({ post }: PostExcerptProps) {
  return (
    <article className="post-excerpt" key={post.id}>
      <h3>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>
      <ReactionButton post={post} />
    </article>
  )
}

export const PostsList = () => {
  const { data: posts = [], isLoading, isSuccess, isError, error } = useGetPostsQuery()

  let content: React.ReactNode

  if (isLoading) {
    content = <Spinner text="Loading..." />
  } else if (isSuccess) {
    content = posts.map((post) => <PostExcerpt key={post.id} post={post} />)
  } else if (isError) {
    content = <div>{error.toString()}</div>
  }

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  )
}
