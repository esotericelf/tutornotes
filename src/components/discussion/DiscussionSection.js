import React, { useEffect, useCallback } from 'react'
import { DiscussionService } from '../../services/discussion/discussionService'
import { useAuth, useDiscussion } from '../../store/hooks'
import {
    loadDiscussionsWithUsers,
    createDiscussion,
    setNewDiscussionContent,
    clearNewDiscussion
} from '../../store/slices/discussionSlice'
import './DiscussionSection.css'

const DiscussionSection = ({ questionId }) => {
    const { user } = useAuth()
    const {
        currentQuestionDiscussions: discussions,
        newDiscussion,
        loading,
        error,
        dispatch
    } = useDiscussion()

    const loadDiscussions = useCallback(async () => {
        if (questionId) {
            dispatch(loadDiscussionsWithUsers(questionId))
        }
    }, [questionId, dispatch])

    // Load discussions when component mounts or questionId changes
    useEffect(() => {
        if (questionId) {
            loadDiscussions()
        }
    }, [questionId, loadDiscussions])

    const handleSubmitComment = async (e) => {
        e.preventDefault()

        if (!newDiscussion.content.trim() || !user) {
            return
        }

        try {
            const discussionData = {
                question_id: questionId,
                user_id: user.id,
                comment: newDiscussion.content.trim(),
                votes_count: 0
            }

            const result = await dispatch(createDiscussion(discussionData))

            if (result.error) {
                dispatch(setError(result.error))
            } else {
                dispatch(clearNewDiscussion())
                // Reload discussions to show the new comment
                loadDiscussions()
            }
        } catch (err) {
            dispatch(setError('Failed to post comment'))
        }
    }

    const handleVote = async (discussionId) => {
        try {
            const { error } = await DiscussionService.voteDiscussion(discussionId)

            if (error) {
                setError(error.message)
            } else {
                // Reload discussions to show updated vote count
                loadDiscussions()
            }
        } catch (err) {
            setError('Failed to vote')
        }
    }

    const handleDeleteComment = async (discussionId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return
        }

        try {
            const { error } = await DiscussionService.deleteDiscussion(discussionId)

            if (error) {
                setError(error.message)
            } else {
                // Reload discussions to remove the deleted comment
                loadDiscussions()
            }
        } catch (err) {
            setError('Failed to delete comment')
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return <div className="discussion-loading">Loading discussions...</div>
    }

    return (
        <div className="discussion-section">
            <h3>Discussions ({discussions.length})</h3>

            {error && (
                <div className="discussion-error">
                    Error: {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Add new comment form */}
            {user && (
                <form onSubmit={handleSubmitComment} className="comment-form">
                    <textarea
                        value={newDiscussion.content}
                        onChange={(e) => dispatch(setNewDiscussionContent(e.target.value))}
                        placeholder="Add a comment..."
                        rows="3"
                        required
                    />
                    <button type="submit" disabled={!newDiscussion.content.trim()}>
                        Post Comment
                    </button>
                </form>
            )}

            {/* Display comments */}
            <div className="comments-list">
                {discussions.length === 0 ? (
                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                ) : (
                    discussions.map((discussion) => (
                        <div key={discussion.id} className="comment-item">
                            <div className="comment-header">
                                <span className="comment-author">
                                    {discussion.user_full_name || discussion.user_email || 'Anonymous'}
                                </span>
                                <span className="comment-date">
                                    {formatDate(discussion.created_at)}
                                </span>
                            </div>

                            <div className="comment-content">
                                {discussion.comment}
                            </div>

                            {/* Show diagram if exists */}
                            {discussion.diagram && (
                                <div className="comment-diagram">
                                    <iframe
                                        src={discussion.diagram}
                                        title="Discussion diagram"
                                        width="100%"
                                        height="300"
                                        frameBorder="0"
                                    />
                                </div>
                            )}

                            <div className="comment-actions">
                                <button
                                    onClick={() => handleVote(discussion.id)}
                                    className="vote-button"
                                >
                                    👍 {discussion.votes_count || 0}
                                </button>

                                {user && discussion.user_id === user.id && (
                                    <button
                                        onClick={() => handleDeleteComment(discussion.id)}
                                        className="delete-button"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default DiscussionSection
