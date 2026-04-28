import { useState } from 'react'

export interface Comment {
  id: string
  message: string
  from?: { name: string; id: string }
  created_time: string
  postId: string
  reason: string
}

interface Props {
  comment: Comment
  token: string
  onDone: (id: string) => void
}

export default function CommentCard({ comment, token, onDone }: Props) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'hidden' | 'kept'>('idle')

  async function handleApprove() {
    setLoading(true)
    try {
      const res = await fetch('/api/meta/hide-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId: comment.id }),
      })
      if (res.ok) {
        setStatus('hidden')
        setTimeout(() => onDone(comment.id), 600)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleDecline() {
    setStatus('kept')
    setTimeout(() => onDone(comment.id), 400)
  }

  const date = new Date(comment.created_time).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition-all duration-300 ${
        status === 'hidden'
          ? 'border-green-200 opacity-50 scale-95'
          : status === 'kept'
            ? 'border-gray-100 opacity-50 scale-95'
            : 'border-red-100'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <p className="text-sm text-gray-800 leading-relaxed">{comment.message}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-gray-500">
              {comment.from?.name ?? 'Unknown user'}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-lg px-3 py-2 flex items-start gap-2">
        <span className="text-red-400 text-xs mt-0.5">⚠</span>
        <p className="text-xs text-red-600">{comment.reason}</p>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleApprove}
          disabled={loading || status !== 'idle'}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2 transition-colors"
        >
          {status === 'hidden' ? 'Hidden ✓' : loading ? 'Hiding…' : 'Hide comment'}
        </button>
        <button
          onClick={handleDecline}
          disabled={loading || status !== 'idle'}
          className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-sm font-medium rounded-lg py-2 transition-colors"
        >
          {status === 'kept' ? 'Kept' : 'Keep'}
        </button>
      </div>
    </div>
  )
}
