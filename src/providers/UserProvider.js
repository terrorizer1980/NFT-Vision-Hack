import React, { createContext, useContext } from 'react'

import useUserMoments from '../hooks/use-user-moments.hook'
import useCollection from '../hooks/use-collection.hook'
import useFUSD from '../hooks/use-fusd.hook'
import {useAuth} from './AuthProvider'

const UserContext = createContext()

export default function UserProvider({ children }) {
  const {user} = useAuth()
  const { collection, createCollection, deleteCollection } = useCollection(user)
  const { data: balance, createFUSDVault, getFUSDBalance } = useFUSD(user)
  const { data: userMoments, addDappy, batchAddMoments, mintMoment } = useUserMoments()

  return (
    <UserContext.Provider
      value={{
        userMoments,
        mintMoment,
        addDappy,
        batchAddMoments,
        collection,
        createCollection,
        deleteCollection,
        balance,
        createFUSDVault,
        getFUSDBalance
      }}>

      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  return useContext(UserContext)
}