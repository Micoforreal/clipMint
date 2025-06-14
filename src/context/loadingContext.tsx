import { createContext, ReactNode, useState } from "react";
import Loading from "../components/Loading";

export const LoadingContext = createContext({});



export const LoadingContextProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false)


  if (isLoading) {
    return(
        <Loading/>
    )
    
  }



  return(
        
    <LoadingContext.Provider value={{isLoading,setIsLoading}}>

        {children}
    </LoadingContext.Provider>
    
    )
    

}