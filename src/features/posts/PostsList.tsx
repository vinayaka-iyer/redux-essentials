import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Link } from 'react-router-dom'
import {
  fetchPosts,
  selectAllPosts,
  selectPostIds,
  selectPostById,
  selectPostsError,
  selectPostsStatus,
} from './postsSlice'
import PostAuthor from './PostAuthor'
import { TimeAgo } from '@/components/TimeAgo'
import { ReactionButton } from './ReactionButton'
import React, { useEffect } from 'react'
import { Spinner } from '@/components/Spinner'

interface PostExcerptProps {
  postId: string
}

export const PostsList = () => {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(selectAllPosts)
  const postsStatus = useAppSelector(selectPostsStatus)
  const postsError = useAppSelector(selectPostsError)

  const orderedPostIds = useAppSelector(selectPostIds)

  useEffect(() => {
    if (postsStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postsStatus, dispatch])

  let content: React.ReactNode

  if (postsStatus === 'pending') {
    content = <Spinner text="Loading..." />
  } else if (postsStatus === 'succeeded') {
    content = orderedPostIds.map((postId) => <PostExcerpt key={postId} postId={postId} />)
  } else if (postsStatus === 'failed') {
    content = <div>{postsError}</div>
  }

  // Suggestion: we could wrap the <PostExcerpt> component in React.memo(), which will ensure that
  // the component inside of it only re-renders if the props have actually changed
  function PostExcerpt({ postId }: PostExcerptProps) {
    const post = useAppSelector((state) => selectPostById(state, postId))
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

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  )
}
