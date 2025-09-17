import express from "express";

import { createRoomByAdmin, getAllRooms, deleteRoom } from "../../controller/admin/chat";
import { catchAsync } from "../../utils/catchAsync";

const router = express.Router();


// Admin-only routes
router.post("/", catchAsync(createRoomByAdmin));
router.get("/", catchAsync(getAllRooms));
router.delete("/:roomId",catchAsync(deleteRoom));

export default router;
