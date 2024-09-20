import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    describe: { type: String, required: true },
    rating: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    parentId: { type: String, default: "none" },
    likes: { type: [String], default: [] },
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editCount: { type: Number, default: 0 }
});

const commentModel = mongoose.models.comment || mongoose.model("comment", commentSchema);

export default commentModel;
