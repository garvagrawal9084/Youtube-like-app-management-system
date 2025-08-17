import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { Subscriptions } from "../models/subscriptions.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // Todo
  // 1) Get channelId from params (User id which channel is this)
  // 2) Get user id from req user (User that is subscribing)
  // 3) Check if a record exist if exist delete if not create one
  // 4) Send response

  // 1)
  const { channelId } = req.params;

  console.log(channelId);

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new APIError(400, "Invalid channel id");
  }

  // 2)

  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new APIError(400, "Invalid user id");
  }

  //   3)

  const filter = {
    subscribers: userId,
    channel: channelId,
  };

  const existingSubscriber = await Subscriptions.findOne(filter);

  if (existingSubscriber) {
    await Subscriptions.deleteOne(existingSubscriber);
    return res
      .status(200)
      .json(new ApiResponse(200, existingSubscriber, "Channel Unsubscribe"));
  }

  const subscribing = await Subscriptions.create(filter);

  return res
    .status(200)
    .json(new ApiResponse(200, subscribing, "Channel Subscribe"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new APIError(400, "Invalid Channel Id");
  }

  const subscriber = await Subscriptions.aggregate([
    {
      $match: {
        channel: mongoose.Types.ObjectId(channelId) // find all docs for this channel
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscribers", // must match schema field
        foreignField: "_id",
        as: "SubscriberDetail",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "ChannelDetail",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        ChannelDetail: { $first: "$ChannelDetail" },
      },
    },
  ]);

  if (!subscriber.length) {
    throw new APIError(500, "Cannot fetch subscriber right now");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscriber, "Subscriber list fetch successfully")
    );
});

export { toggleSubscription, getUserChannelSubscribers };
