import { locationRouter } from "~/server/api/routers/location";
import { api } from "./api";
import { RideOption, rideRouter } from "~/server/api/routers/ride";

export type GetMapReturnType = Awaited<ReturnType<typeof locationRouter.getMap>>

export type RideReturnType = Awaited<ReturnType<typeof rideRouter.getRides>>

export type RideReturn = typeof RideOption._getType