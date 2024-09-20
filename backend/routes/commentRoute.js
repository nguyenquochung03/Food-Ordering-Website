import express from 'express'
import { addComment, checkCommentOwnership, deleteCommentAndReplies, editComment, getComment, getCommentsSorted, getHighRatingCommentTotals, getLowRatingCommentTotals, getWeeklyHighRatingCommentTotals, getWeeklyLowRatingCommentTotals, isUserLikeComment, likeComment, replyComment, unlikeComment } from '../controllers/commentController.js';
import authMiddleware from '../middleware/auth.js';

const commentRouter = express.Router();

commentRouter.post('/add', authMiddleware, addComment)
commentRouter.post('/reply', authMiddleware, replyComment)
commentRouter.post('/delete', deleteCommentAndReplies)
commentRouter.post('/edit', editComment)
commentRouter.get('/getAll', getComment)
commentRouter.get('/getCommentsSorted', getCommentsSorted)
commentRouter.post('/isUserLikeComment', authMiddleware, isUserLikeComment)
commentRouter.post('/likeComment', authMiddleware, likeComment)
commentRouter.post('/unlikeComment', authMiddleware, unlikeComment)
commentRouter.post('/checkCommentOwnership', authMiddleware, checkCommentOwnership)
commentRouter.get('/getWeeklyHighRatingCommentTotals', getWeeklyHighRatingCommentTotals)
commentRouter.get('/getWeeklyLowRatingCommentTotals', getWeeklyLowRatingCommentTotals)
commentRouter.get('/getHighRatingCommentTotals', getHighRatingCommentTotals)
commentRouter.get('/getLowRatingCommentTotals', getLowRatingCommentTotals)

export default commentRouter