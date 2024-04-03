import { createTRPCRouter, publicProcedure } from "../trpc";

export const locationRouter = createTRPCRouter({
    getMap: publicProcedure
    
    .query(async ({ ctx }) => {
      const locations = await ctx.db.location.findMany({
        include:{
            cabs:true
        }
      });
      const paths =  await ctx.db.edge.findMany();
      return {
        locations,
        paths,
    
      };
    }),
})