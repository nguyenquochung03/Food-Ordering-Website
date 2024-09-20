import express from "express"
import { getVisitStatistics, leavePage, trackVisit } from "../controllers/visitController.js"
import getId from "../middleware/authVer2.js";

const visitRoute = express.Router()

visitRoute.post("/trackVisit", getId, trackVisit);
visitRoute.post("/leavePage", getId, leavePage);
visitRoute.get("/visitStatistics", getVisitStatistics);

export default visitRoute