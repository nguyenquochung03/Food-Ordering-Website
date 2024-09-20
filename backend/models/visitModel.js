import mongoose from 'mongoose'

const pageVisitSchema = new mongoose.Schema({
    pageUrl: { type: String, required: true },
    enterTime: { type: Date, required: true },
    leaveTime: { type: Date },
});

const visitSchema = new mongoose.Schema({
    userId: { type: String, required: false },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    pagesVisited: [pageVisitSchema],
    timestamp: { type: Date, default: Date.now },
});

const visitModel = mongoose.model.visit || mongoose.model('visit', visitSchema);

export default visitModel
