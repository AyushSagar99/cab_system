import Head from "next/head";
import Image from "next/image"; // Import Image from Next.js
import imageToAdd from "../../images.png";
import { api } from "~/utils/api";
import { Button, Dropdown } from "flowbite-react";
import { ChangeEvent, Dispatch, FormEvent, JSXElementConstructor, SetStateAction, lazy, use, useEffect, useMemo, useState } from "react";
import { Modal } from "flowbite-react";
import { Card } from "flowbite-react";
import Graph from "graphology";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css" 
import dynamic, { LoaderComponent } from 'next/dynamic';
import { ComponentType } from 'react';
import {Map} from '../components/Map';
import { GetMapReturnType, RideReturn, RideReturnType } from "~/utils/types";
import emailjs from '@emailjs/browser'

const MapDynamic = dynamic(() => import('../components/Map').then(module => ({ default: module.Map })), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});



export function YourComponent(): JSX.Element {
  const {data:map} = api.location.getMap.useQuery()
  return (
    <div >
   { map &&  <MapDynamic  map={map as GetMapReturnType}/> }
  </div>
  );
}

export function RidesOptionModal({rides,openModal,setOpenModal,destination,source,email}:{openModal:boolean,setOpenModal:Dispatch<SetStateAction<boolean>>,rides:RideReturnType,destination:string,source:string,email:string}) {
  const {mutateAsync:bookRideMutate} = api.ride.bookRide.useMutation({
      
  })
  const confirmRide = async (ride:RideReturnType,)=>{
    await bookRideMutate({
      destination:destination,
      email:email,
      location:source,
      rideOption:{
        locations: ride[0]?.locations!,
        cabId:ride[0]?.cabId!,
        startingPoint:ride[0]?.startingPoint!,
        totalCost:ride[0]?.totalCost!,
        totalJourneyTime:ride[0]?.totalJourneyTime!,
        totalTimeToReachSource:ride[0]?.totalTimeToReachSource!,
        userJourneyTime:ride[0]?.userJourneyTime!
  

      }

    })
    emailjs.init({
      publicKey:'Rh-Im1-W1BYAzLXcE',
    
    })
    await emailjs.send('service_l9t367s','template_9gn5l2z',{
      reply_to:email,
      send:email,
      message: `Your Ride has been booked from ${source} to ${destination} with the cab id ${ride[0]?.cabId} and the total cost is ${ride[0]?.totalCost} Rupees`

    })
    alert("Ride Booked")
    
  }

  return (
    <>
      <Button onClick={() => setOpenModal(true)}>Toggle modal</Button>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
      <Modal.Header>Choose Your Ride </Modal.Header>
        <Modal.Body>
        <div className="flex flex-col bg-white m-auto p-auto">
<h1
        className=" py-5 lg:px-20 md:px-10 px-5 lg:mx-40 md:mx-20 mx-5 font-bold text-4xl text-gray-800 text-center"
      >
        Total Rides
      </h1>
      <div
        className="flex overflow-x-scroll pb-10 hide-scroll-bar"
      >
        <div
          className="flex flex-nowrap lg:ml-40 md:ml-20 ml-10 "
        >
          <div className="inline-block px-3">
            <div
              className="w-64 h-64 max-w-xs overflow-hidden rounded-lg  bg-white  transition-shadow duration-300 ease-in-out"
            >

              {
                rides.map((ride) => (
                  <Card href="#" className="max-w-sm ">
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Cab with id {ride.cabId}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              Price: {ride.totalCost} Rupees
              Distance: {ride.totalTimeToReachSource} (Cab Distance) + {ride.userJourneyTime} (Fastest Journey Path Time) = {ride.totalJourneyTime} 

            </p>
            <Button onClick={() => confirmRide([ride])}>Book </Button>
          
          </Card>

                ))
              }
        
          </div>
          </div>
          </div>
          </div>
          </div>
          
         
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setOpenModal(false)}>I accept</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Decline
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )

}

export function RidesOption({rides}:{rides:RideReturnType}) {

}

export default function App(): JSX.Element {

  
  const [bookRides,setBookRides]=useState(false)

  const [openRidesOption,setOpenRidesOption]=useState(false)
  
  const [openModal, setOpenModal] = useState(false);

  const [email , setEmail] = useState<string>()
  const [sourceLocation , setSourceLocation] = useState<string>()
  const [destinationLocation , setDestinationLocation] = useState<string>()
  
  const onChange=(e: ChangeEvent<HTMLInputElement>)=>{
    setEmail(e.target.value)
  }

  const {data:rides,refetch} = api.ride.getRides.useQuery({
    email:email ?? '',
    location:sourceLocation ?? '',
    destination:destinationLocation ?? ''
  },{
    enabled:false
  })
  const onSubmit=async (event:any)=>{
    event.preventDefault()
    // setBookRides(!bookRides)
    await refetch()
    emailjs
    setOpenRidesOption(true)
  }
 



  const {data:map} = api.location.getMap.useQuery()

  const locations = useMemo(() => {
    return map?.locations.map((location) => location.name);
  }, [map]);
  





  return (
    <>
    <div className=" bg-white w-screen h-screen  ">
      <Head>
        <title>Home Page</title>
      </Head>
     
          {/* <Button className="absolute top-0 right-0 p-1.5 m-2 w-32" onClick={() => setOpenModal(true)}>Rides</Button> */}
      <Modal show={openModal} onClose={() => setOpenModal(false)} className=" " size={"7xl"}> 
        <Modal.Header>Ride History</Modal.Header>
        <Modal.Body><div className="flex flex-col bg-white m-auto p-auto">
<h1
        className=" py-5 lg:px-20 md:px-10 px-5 lg:mx-40 md:mx-20 mx-5 font-bold text-4xl text-gray-800 text-center"
      >
        Total Rides
      </h1>
      <div
        className="flex overflow-x-scroll pb-10 hide-scroll-bar"
      >
       <div>Enter Email to See Ride History</div>
        <div
          className="flex flex-nowrap lg:ml-40 md:ml-20 ml-10 "
        >
          <div className="inline-block px-3">
            <div
              className="w-64 h-64 max-w-xs overflow-hidden rounded-lg  bg-white  transition-shadow duration-300 ease-in-out"
            ><Card href="#" className="max-w-sm ">
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Noteworthy 
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">hi
            </p>
            <Button onClick={() => setOpenModal(false)}>Cancel </Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Edit Price
          </Button>
          </Card>
        </div>
          </div>
        </div>
      </div>
</div>
          
          
        </Modal.Body>
      </Modal>
        
       {rides &&  <RidesOptionModal openModal={openRidesOption} rides={rides} setOpenModal={setOpenRidesOption} destination={destinationLocation ?? ''} source={sourceLocation ?? ''} email={email ?? ''} />}
     <div className="w-fu]l flex h-full  flex-row sm:flex-col justify-around items-center md:flex-col xl:flex-row">
        <YourComponent />


        <form  onSubmit={onSubmit} className=" p-1.5  rounded left-2/3 shadow-lg grid drop-shadow-xl place-items-center h-96 w-64 "
        style={{
          background:
            "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
        }}>
        <label className="text-base font-medium  text-white "  htmlFor="email">Email</label>
        <br />
        <input  type="text" id="email"  required className="rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={email} onChange={onChange} placeholder="Email"/>
        <br />
       
        <p>{sourceLocation}</p>
        <Dropdown label="Pickup Point" >
          {
            locations?.map((location) => (
              <Dropdown.Item key={location} onClick={() => setSourceLocation(location)}>
                {location}
              </Dropdown.Item>
            ))
          }
      </Dropdown>
       
        <br/>
       
        <p>{destinationLocation}</p>
        <Dropdown label="Dropoff Point"  onSelect={(event)=>{
          console.log({event})
        }}>
        {
            locations?.map((location) => (
              <Dropdown.Item key={location} onClick={()=>setDestinationLocation(location)}>
                {location}
              </Dropdown.Item>
            ))
          }
      </Dropdown>
       
        <br/>
        <button type="submit" className="  border-2 border-danger px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-danger-600 focus:border-danger-600 focus:text-danger-600 focus:outline-none focus:ring-0 active:border-danger-700 active:text-danger-700 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10 rounded ">Book Cab</button>
      </form>
      </div>
      
      </div>
      
    </>
  );
}