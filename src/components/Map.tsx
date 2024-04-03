import { Edge } from "@prisma/client";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import Graph from "graphology";
import { useEffect } from "react";
import { GetMapReturnType } from "~/utils/types";


export function Map({map}:{map:GetMapReturnType}){
    return <SigmaContainer settings={{
        renderLabels: true,
        renderEdgeLabels: true
    }} style={{ height: "500px", width: "500px" }}>
    <LoadGraph  map={map}/>
  </SigmaContainer>
}
export function LoadGraph({map}:{map:GetMapReturnType}) {
    const loadGraph = useLoadGraph();
    useEffect(() => {
          const graph = new Graph();
          let x = 1;
          let y = 1;
      
          map?.locations.forEach((location) => {
            graph.addNode(location.name, { x: x, y: y, size: 15, label: location.name, color: "#FA4F40" });
             
      
            x = x + 1;
           
          })
          map?.paths.forEach((path) => {
            // graph.addEdge(path.sourceLocationId, path.targetLocationId, { size: 100, label: path.price.toString(),type: "arrow", color: "#000000" ,forceLabel: true, curvature: 0.5});

            graph.addEdgeWithKey(`${path.sourceLocationId}-${path.targetLocationId}`, path.sourceLocationId, path.targetLocationId, { size: 2, label: path.price.toFixed(),type: "arrow", color: "#000000" ,forceLabel: true, curvature: 0.5});
          })

        // graph.addEdge("A", "B", { size: 2, label: "10",type: "arrow", color: "#000000" ,forceLabel: true, curvature: 0.5});
        graph.nodes().forEach((node, i) => {
            const angle = (i * 2 * Math.PI) / graph.order;
            
            graph.setNodeAttribute(node, "x", 100 * Math.cos(angle));
            graph.setNodeAttribute(node, "y", 100 * Math.sin(angle));
            const location = map.locations.find((location) => location.name === node);
            if(location?.cabs){
                location.cabs.forEach((cab) => {
                    graph.addNode(cab.id, { x: 100 * Math.cos(angle) + 5, y: 100 * Math.sin(angle) + 5  , size: 5, label: "Cab", color: "blue" ,forceLabel: true});
                })
                
            }
            }
        );
        
        // graph.addEdgeWithKey("A-B", "A", "B", { size: 2, label: "10",type: "arrow", color: "#000000" ,forceLabel: true, curvature: 0.5});
        // graph.addEdgeWithKey("A-C", "A", "C", { size: 2, label: "3",type: "arrow", color: "#000000" ,forceLabel: true, curvature: 0.5});
          loadGraph(graph);
      
    }, [loadGraph]);


    return null;  
}