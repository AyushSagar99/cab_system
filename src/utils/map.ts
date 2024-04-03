//@ts-ignore

// Dijkstra algorithm is used to find the shortest distance between two nodes inside a valid weighted graph. Often used in Google Maps, Network Router etc.

// Helper class for PriorityQueue
class Node {
  val: any;
  priority: number;

  constructor(val: any, priority: number) {
    this.val = val;
    this.priority = priority;
  }
}

function divideArray(arr: string[]): string[][] {
  const result: string[][] = [];

  for (let i = 0; i < arr.length - 1; i++) {
    result.push([arr[i] as string, arr[i + 1] as string]);
  }

  return result;
}

class PriorityQueue {
  values: Node[];

  constructor() {
    this.values = [];
  }

  enqueue(val: any, priority: number): void {
    const newNode = new Node(val, priority);
    this.values.push(newNode);
    this.bubbleUp();
  }

  bubbleUp(): void {
    let idx = this.values.length - 1;
    const element = this.values[idx];
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const parent = this.values[parentIdx] as Node; // Add type assertion
      if (element!.priority >= parent!.priority) break;
      this.values[parentIdx] = element!;
      this.values[idx] = parent!;
      idx = parentIdx;
    }
  }

  dequeue(): Node | undefined {
    const min = this.values[0];
    const end = this.values.pop();
    if (this.values.length > 0) {
      this.values[0] = end!;
      this.sinkDown();
    }
    return min;
  }

  sinkDown(): void {
    let idx = 0;
    const length = this.values.length;
    const element = this.values[0];
    while (true) {
      let leftChildIdx = 2 * idx + 1;
      let rightChildIdx = 2 * idx + 2;
      let leftChild, rightChild;
      let swap: number | null = null;

      if (leftChildIdx < length) {
        leftChild = this.values[leftChildIdx];
        if (leftChild.priority < element.priority) {
          swap = leftChildIdx;
        }
      }
      if (rightChildIdx < length) {
        rightChild = this.values[rightChildIdx];
        if (
          (swap === null && rightChild.priority < element.priority) ||
          (swap !== null && rightChild.priority < leftChild!.priority)
        ) {
          swap = rightChildIdx;
        }
      }
      if (swap === null) break;
      this.values[idx] = this.values[swap];
      this.values[swap] = element;
      idx = swap;
    }
  }
}

// Dijkstra's algorithm only works on a weighted graph.

export class WeightedGraph {
  adjacencyList: { [key: string]: { node: string; weight: number }[] };

  constructor() {
    this.adjacencyList = {};
  }

  addVertex(vertex: string): void {
    if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = [];
  }

  



  addEdge(vertex1: string, vertex2: string, weight: number): void {
    if (this.adjacencyList[vertex1]) {
      this.adjacencyList[vertex1].push({ node: vertex2, weight });
    }
    if (this.adjacencyList[vertex2]) {
      this.adjacencyList[vertex2].push({ node: vertex1, weight });
    }
  }

  Dijkstra(start: string, finish: string): string[] {
    const nodes = new PriorityQueue();
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    let path: string[] = []; // to return at end
    let smallest: string | undefined;

    // Build up initial state
    for (const vertex in this.adjacencyList) {
      if (vertex === start) {
        distances[vertex] = 0;
        nodes.enqueue(vertex, 0);
      } else {
        distances[vertex] = Infinity;
        nodes.enqueue(vertex, Infinity);
      }
      previous[vertex] = null;
    }

    // As long as there is something to visit
    while (nodes.values.length) {
      smallest = nodes.dequeue()?.val;
      if (smallest === finish) {
        // WE ARE DONE
        // BUILD UP PATH TO RETURN AT END
        while (previous[smallest!]) {
          path.push(smallest!);
          smallest = previous[smallest!];
        }
        break;
      }
      if (smallest || distances[smallest!] !== Infinity) {
        for (const neighbor of this.adjacencyList[smallest!]) {
          // Find neighboring node
          const nextNode = neighbor;
          // Calculate new distance to neighboring node
          const candidate = distances[smallest!] + nextNode.weight;
          const nextNeighbor = nextNode.node;
          if (distances[nextNeighbor] && candidate < distances[nextNeighbor]) {
            // Updating new smallest distance to neighbor
            distances[nextNeighbor] = candidate;
            // Updating previous - How we got to neighbor
            previous[nextNeighbor] = smallest!;
            // Enqueue in priority queue with new priority
            nodes.enqueue(nextNeighbor, candidate);
          }
        }
      }
    }

    return path.concat(smallest!).reverse();


  }
  getTotalWeight(vertices:string[]): number {
    console.log(this.adjacencyList)
    let totalWeight = 0;
    vertices.forEach((vertex) => {
      if(!this.adjacencyList[vertex]){
        throw Error("Vertex not found")
      }
    })
    const paths = divideArray(vertices)
    console.log({paths})
    paths.forEach((path) => {
      console.log({path})
      if (this.adjacencyList[path[0] as string]) {
      
        const weight = this.adjacencyList[path[0] as string]?.find((vertex)=>vertex.node === path[1])
        console.log({weight})
       
        totalWeight += weight?.weight ?? 0
     
      }
    })
    return totalWeight;

  }


}