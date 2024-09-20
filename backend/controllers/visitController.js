import visitModel from "../models/visitModel.js";
import moment from 'moment';

const trackVisit = async (req, res) => {
    const { userId, pageUrl } = req.body;

    try {
        let visit;
        if (userId) {
            visit = await visitModel.findOne({ userId });
        } else {
            visit = await visitModel.findOne({ ipAddress: req.ip });
        }

        if (!visit) {
            visit = new visitModel({
                userId: userId || null,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                pagesVisited: [],
            });
        }

        visit.pagesVisited.push({
            pageUrl: pageUrl,
            enterTime: new Date(),
        });

        await visit.save();
        res.json({ success: true, data: visit });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

const leavePage = async (req, res) => {
    const { userId, pageUrl } = req.body;

    try {
        let updateQuery;
        if (userId) {
            updateQuery = { userId };
        } else {
            updateQuery = { ipAddress: req.ip };
        }

        const result = await visitModel.findOneAndUpdate(
            updateQuery,
            {
                $set: {
                    'pagesVisited.$[elem].leaveTime': new Date()
                }
            },
            {
                arrayFilters: [{ 'elem.pageUrl': pageUrl, 'elem.leaveTime': null }],
                new: true,
                useFindAndModify: false
            }
        );

        res.json({ success: true, data: result });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const getVisitStatistics = async (req, res) => {
    try {
        const { month, year } = req.query;

        const startOfMonth = moment(`${year}-${month}`, "YYYY-MM").startOf('month').toDate();
        const endOfMonth = moment(`${year}-${month}`, "YYYY-MM").endOf('month').toDate();

        const visitStats = await visitModel.aggregate([
            {
                $match: {
                    "pagesVisited.enterTime": {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            { $unwind: "$pagesVisited" },
            {
                $group: {
                    _id: {
                        $hour: {
                            $add: ["$pagesVisited.enterTime", 7 * 60 * 60 * 1000]
                        }
                    },
                    visitCount: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        const hourlyStats = Array(24).fill(0);
        visitStats.forEach(stat => {
            hourlyStats[stat._id] = stat.visitCount;
        });

        res.json({ success: true, data: hourlyStats });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching visit statistics" });
    }
};

export { trackVisit, leavePage, getVisitStatistics };
