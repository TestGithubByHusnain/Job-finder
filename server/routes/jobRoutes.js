import express from "express";
import { createJob,
 getJobs,
getJobsByUser,
searchJobs,
applyJob,
likeJob, 
getJobById,
deleteJob } from "../controllers/jobController.js";
import protect from "../middleware/protect.js";

const router= express.Router();

router.post("/jobs",protect, createJob);
router.get("/jobs", getJobs);
router.get("/jobs/user/:id", protect,  getJobsByUser);
//Search jobs
router.get("/jobs/search", searchJobs);
// Apply for job
router.purge("/jobs/apply/:id", protect, applyJob);
// like and unlike job
router.put("/jobs/like/:id", protect, likeJob);
// getjobbyid
router.get("/jobs/:id" ,protect,  getJobById)
// delete job
router.delete("/jobs/:id", protect, deleteJob)

export default router