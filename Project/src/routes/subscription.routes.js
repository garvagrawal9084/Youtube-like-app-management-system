import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const subscriberRouter = Router()

subscriberRouter.route("/toggle-subscribe/c/:channelId").get(verifyJWT , toggleSubscription)
subscriberRouter.route("/get-channel-subscriber/c/:channelId").get(verifyJWT , getUserChannelSubscribers)

export {subscriberRouter}