import { useAppDispatch } from '@/app/hooks'

import type { Post, ReactionName } from './postsSlice'
import { useAddReactionMutation } from '../api/apiSlice'

const reactionEmoji: Record<ReactionName, string> = {
  thumbsUp: '👍',
  tada: '🎉',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀',
}

interface ReactionButtonProps {
  post: Post
}

export const ReactionButton = ({ post }: ReactionButtonProps) => {
  const [addReaction] = useAddReactionMutation()

  const reactionButtons = Object.entries(reactionEmoji).map(([stringName, emoji]) => {
    // Ensure TS knows this is a _specific_ string type
    const reaction = stringName as ReactionName
    return (
      <button
        key={reaction}
        type="button"
        className="muted-button reaction-button"
        onClick={() => addReaction({ postId: post.id, reaction })}
      >
        {emoji} {post.reactions[reaction]}
      </button>
    )
  })
  return <div>{reactionButtons}</div>
}
