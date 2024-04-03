import { RideStatus } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {  WeightedGraph  } from "~/utils/map";

export const RideOption = z.object({
  userJourneyTime: z.number(), 
  locations: z.array(z.string()),
  totalTimeToReachSource: z.number(),
  totalJourneyTime: z.number(),
  cabId: z.string(),
  startingPoint: z.any(), // You may want to specify the type more precisely if you have a specific structure for startingPoint
  totalCost: z.number(),
});

// Extracting the TypeScript type
type RideOptionType = z.TypeOf<typeof RideOption>;

export const rideRouter = createTRPCRouter({
    getRides: publicProcedure
    .input(z.object({ email: z.string().email(),location: z.string(),destination: z.string()}))
    // Get email from input , register user  if email does not exist in db , find the nearest cab to the location and assign it to the user and estimate the shortest path and time it will take also send an email
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          email: input.email,
        },
      })
      if(!user){
        //create user 
        await ctx.db.user.create({
          data: {
            email: input.email,
          },
        });
      }
      
      // const edges = await ctx.db.edge.findMany();
      // console.log(edges)

      // //find nearest cab
      const cabs = await ctx.db.cab.findMany({
        include:{
           startingPoint: true
        }
      });
      const locations = await ctx.db.location.findMany();
      const sourceLocation = locations.find((location) => location.name === input.location);
      const edges = await ctx.db.edge.findMany();
      if(!sourceLocation){
        throw Error("Location not found")
      }
      // }

      const rides: RideOptionType[]= [];
      const locationMap = new WeightedGraph();
     
      locations.forEach((location) => {
        locationMap.addVertex(location.name)
      })
      edges.forEach((edge) => {
        if(edge.sourceLocationId || edge.targetLocationId || edge.price){
          locationMap.addEdge(edge.sourceLocationId as string, edge.targetLocationId as string, edge.price)
        }
      })

      const totalVertices = locationMap.Dijkstra(sourceLocation.name,input.destination)
      console.log({totalVertices})
      const totalTimeOfJourney = locationMap.getTotalWeight(totalVertices)

      cabs.forEach((cab) => {
        const vertices =  locationMap.Dijkstra(sourceLocation.name, cab.startingPoint.name)
        const weights = locationMap.getTotalWeight(vertices)
        rides.push({
          userJourneyTime: totalTimeOfJourney,
          locations: vertices,
          totalTimeToReachSource: weights,
          totalJourneyTime: weights + totalTimeOfJourney,
          cabId: cab.id,
          startingPoint: cab.startingPoint,
          totalCost: (weights + totalTimeOfJourney) * cab.price_per_minute,
           
        })
      })
      
      const vertices =  locationMap.Dijkstra(sourceLocation.name, cabs[0]?.startingPoint.name ?? "")
      console.log(vertices)
      const weights = locationMap.getTotalWeight(vertices)
      console.log({weights})

      console.log({rides})
      return rides.sort((a,b) => a.totalCost - b.totalCost)
    }),

    bookRide: 
    publicProcedure.input(
      z.object({ 
        email: z.string().email(),
        location: z.string(),
        destination: z.string(),
        rideOption: RideOption
        })).mutation(async ({ ctx, input }) => {

          const user = await ctx.db.user.findFirstOrThrow({
            where: {
              email: input.email,
            },
          })
          const cab = await ctx.db.cab.findFirstOrThrow({
            where:{
               id: input.rideOption.cabId
            }
          })
          const newRide  = await ctx.db.ride.create({
            data:{
              cabId: input.rideOption.cabId,
              status: RideStatus.ACCEPTED,
              sourceLocationName: input.location,
              targetLocationName: input.destination,
              userId: user.id,

            }
          })
          return newRide
      })

  });