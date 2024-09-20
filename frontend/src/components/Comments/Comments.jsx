import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import "./Comments.css";

import { StoreContext } from '../../context/StoreContext';

import HeartIcon from '../Icons/HeartIcon';
import ReplyIcon from '../Icons/ReplyIcon';
import EditIcon from '../Icons/EditIcon';
import TrashIcon from '../Icons/TrashIcon';

const Comment = ({ foodId, setIsLoading, setShowLogin, fetchComments, idComment, nameUser, avatarUser, timeCreated, contentComment, initialLikes, rating, parentId, parentName, isShowReply, toggleShowReply, replyCount, isLike, isUser }) => {
    const { url, token } = useContext(StoreContext);
    const replyRef = useRef(null);
    const editRef = useRef(null)

    const [likes, setLikes] = useState(initialLikes);
    const [hasLiked, setHasLiked] = useState(isLike);
    const [isRepling, setIsRepling] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('')

    useEffect(() => {
        setLikes(initialLikes);
        setHasLiked(isLike);
    }, [isLike, initialLikes]);

    useEffect(() => {
        if (isRepling && replyRef.current) {
            replyRef.current.focus();
        }
    }, [isRepling])

    useEffect(() => {
        if (isEditing && editRef.current) {
            editRef.current.focus();
        }
    }, [isEditing])

    const handleLike = async () => {
        if (token) {
            try {
                setIsLoading(true)
                const response = hasLiked
                    ? await axios.post(`${url}/api/comment/unlikeComment`, { commentId: idComment }, { headers: { token } })
                    : await axios.post(`${url}/api/comment/likeComment`, { commentId: idComment }, { headers: { token } });

                if (response.data.success) {
                    setLikes(prevLikes => prevLikes + (hasLiked ? -1 : 1));
                    setHasLiked(!hasLiked);
                } else {
                    console.log(response.data.message);
                }
            } catch (error) {
                console.error("Error during like/unlike action:", error);
            } finally {
                setIsLoading(false)
            }
        } else {
            const result = window.confirm("Log in to comment or interact with other users");
            if (result) setShowLogin(true);
        }
    };

    const onReplingHandler = () => {
        if (token) {
            setIsRepling(prevState => !prevState);
        } else {
            const result = window.confirm("Log in to comment or interact with other users");
            if (result) setShowLogin(true);
        }
    };

    const onCancelCommentHandler = () => {
        setIsRepling(false);
        setReplyContent('');
    };

    const onPostCommentHandler = async () => {
        if (!replyContent.trim()) return;

        try {
            setIsLoading(true)
            const response = await axios.post(`${url}/api/comment/reply`, { foodId: foodId, parentId: idComment, describe: replyContent }, { headers: { token } });
            if (response.data.success) {
                fetchComments();
                setIsRepling(false);
                toggleShowReply("post")
                setReplyContent('');
            } else {
                console.log(response.data.message);
            }
        } catch (error) {
            console.error("Error posting reply:", error);
        } finally {
            setIsLoading(false)
        }
    };

    const onCancelEditCommentHandler = () => {
        setIsEditing(false);
        setEditContent('');
    }

    const onEditCommentHandler = async () => {
        setIsEditing(prevState => !prevState)
        try {
            setIsLoading(true)
            const response = await axios.post(`${url}/api/comment/edit`, { commentId: idComment, describe: editContent });
            if (response.data.success) {
                fetchComments();
                setIsEditing(false);
                setEditContent('');
            } else {
                console.log(response.data.message);
            }
        } catch (error) {
            console.error("Error editing:", error);
        } finally {
            setIsLoading(false)
        }
    }

    const onDeleteCommentHandler = async () => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                setIsLoading(true)
                const response = await axios.post(`${url}/api/comment/delete`, { commentId: idComment });
                if (response.data.success) {
                    fetchComments();
                } else {
                    console.log(response.data.message);
                }
            } catch (error) {
                console.error("Error removing:", error);
            } finally {
                setIsLoading(false)
            }
        }
    }

    return (
        <React.Fragment>
            <div className="comment">
                <div className="comment-img">
                    <img src={`${url}/images/${avatarUser}`} alt={nameUser} />
                </div>
                <div className="comment-content">
                    <div className="comment-content-header">
                        <div className="comment-content-header-name-rating">
                            <p className='comment-content-header-name'>{nameUser}</p>
                            {parentId === "none" && (
                                <div className="comment-content-header-rating-container">
                                    <div className="comment-content-header-rating">
                                        {[...Array(5)].map((_, i) => (
                                            <button
                                                key={i}
                                                className="comment-content-header-star"
                                                style={{ color: i < 'var(--color-main)' }}
                                            >
                                                {i < rating ? '★' : '☆'}
                                            </button>
                                        ))}
                                    </div>
                                    <p>({rating}.0)</p>
                                </div>
                            )}
                        </div>
                        <div className="comment-content-time-edit-remove">
                            <p className='comment-content-header-time'>{timeCreated}</p>
                            {isUser && (
                                <div className="comment-content-header-you">
                                    <p>You</p>
                                    <div className='comment-content-header-you-edit' onClick={() => setIsEditing(prevState => !prevState)}>
                                        <EditIcon color={"#e3a239"} size={16} />
                                    </div>
                                    <div className='comment-content-header-you-remove' onClick={() => onDeleteCommentHandler()}>
                                        <TrashIcon color={"#d45b53"} size={16} />
                                    </div>
                                </div>
                            )}
                        </div>
                        {parentId !== "none" && parentName && (
                            <p className='comment-content-header-parent-name'>Replying to {parentName}</p>
                        )}
                    </div>
                    <p className='comment-content-content'>
                        {contentComment.split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                <br style={{ margin: "10px 0" }} />
                            </React.Fragment>
                        ))}
                    </p>
                    {
                        isEditing &&
                        <div className="comment-edit">
                            <input ref={editRef} value={editContent} type="text" onChange={(e) => setEditContent(e.target.value)} />
                            <div className="reply-comment-btn">
                                <button onClick={onCancelEditCommentHandler} className='btn-cancel'>Cancel</button>
                                <button onClick={onEditCommentHandler} className='btn-publish' disabled={!editContent.trim()}>Edit</button>
                            </div>
                        </div>
                    }
                    <div className="comment-footer">
                        <div className="comment-footer-num-reply" onClick={() => toggleShowReply("none")}>
                            <img src={isShowReply ? "https://rvs-comment-module.vercel.app/Assets/Down.svg" : "https://rvs-comment-module.vercel.app/Assets/Up.svg"} alt="" />
                            <p>{replyCount} {replyCount <= 1 ? 'reply' : 'replies'}</p>
                        </div>
                        <div className="comment-footer-num-likes" onClick={handleLike}>
                            <HeartIcon color={hasLiked ? "red" : "black"} size={16} />
                            <p>{likes} {likes <= 1 ? 'Like' : 'Likes'}</p>
                        </div>
                        <div className="comment-footer-reply" onClick={onReplingHandler}>
                            <ReplyIcon color={"black"} size={16} />
                            <p>Reply</p>
                        </div>
                    </div>
                </div>
            </div>
            {isRepling && (
                <div className='reply-comment'>
                    <input ref={replyRef} type="text" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
                    <div className="reply-comment-btn">
                        <button onClick={onCancelCommentHandler} className='btn-cancel'>Cancel</button>
                        <button onClick={onPostCommentHandler} className='btn-publish' disabled={!replyContent.trim()}>Publish</button>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

const Comments = ({ foodId, setShowLogin, comments, fetchComments, setIsLoading }) => {
    const [isShowReply, setIsShowReply] = useState({});

    const toggleShowReply = (id, value) => {
        if (value === "post") {
            setIsShowReply(prevState => ({
                ...prevState,
                [id]: true,
            }));
        } else {
            setIsShowReply(prevState => ({
                ...prevState,
                [id]: !prevState[id],
            }));
        }
    };

    if (!Array.isArray(comments)) return null;

    const commentMap = comments.reduce((acc, comment) => {
        acc[comment.idComment] = { ...comment, children: [] };
        return acc;
    }, {});

    comments.forEach(comment => {
        if (comment.parentId !== 'none') {
            const parentComment = commentMap[comment.parentId];
            if (parentComment) {
                parentComment.children.push(commentMap[comment.idComment]);
            }
        }
    });

    const rootComments = Object.values(commentMap).filter(comment => comment.parentId === 'none');

    const renderComments = (comment, parentName) => (
        <li key={comment.idComment}>
            <Comment
                {...comment}
                parentName={parentName}
                isShowReply={isShowReply[comment.idComment] || false}
                toggleShowReply={(value) => toggleShowReply(comment.idComment, value)}
                replyCount={comment.children.length}
                initialLikes={comment.likes}
                fetchComments={fetchComments}
                setShowLogin={setShowLogin}
                foodId={foodId}
                setIsLoading={setIsLoading}
            />
            {comment.children && comment.children.length > 0 && isShowReply[comment.idComment] && (
                <ul>
                    {comment.children.map(child => renderComments(child, comment.nameUser))}
                </ul>
            )}
        </li>
    );

    return (
        <section className="comment-module">
            <ul>
                {rootComments.map(comment => renderComments(comment, ''))}
            </ul>
        </section>
    );
};

export default Comments;
