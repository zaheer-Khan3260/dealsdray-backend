import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser
} from "../controller/user.controller.js";
import { varifyJwt } from "../middleware/auth.middleware.js";
const router = new Router();



router.route("/register").post(registerUser);
router.route("/login").post(loginUser)
router.route("/logout").get(varifyJwt,logoutUser)


export default router;