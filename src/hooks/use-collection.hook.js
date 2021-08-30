import { useEffect, useState } from 'react'
import {mutate, query, tx} from "@onflow/fcl"

export default function useCollection(user) {
  const [loading,setLoading] = useState(true)
  const [collection, setCollection] = useState(false)

  useEffect(() => {
    if(!user?.addr) return
    const checkCollection = async () => {
      try{
        let res = await query({
          cadence:`
          import CryptoLeague from 0xCryptoLeague 

          pub fun main(addr: Address): Bool {
            let ref = getAccount(addr).getCapability<&{CryptoLeague.CollectionPublic}>(CryptoLeague.CollectionPublicPath).check()
            return ref
          }
          `,
          args: (arg,t) => [arg(user?.addr, t.Address)] 
        })
        setCollection(res)
        setLoading(false)
      }catch(err){
        console.log(err)
        setLoading(false)
      }
    }
    checkCollection()
    //eslint-disable-next-line
  }, [])

  const createCollection = async () => {
    try{
      let res = await mutate({
        cadence:`
        import CryptoLeague from 0xCryptoLeague
  
        transaction {
          prepare(acct: AuthAccount) {
            let collection <- CryptoLeague.createEmptyCollection()
            acct.save<@CryptoLeague.Collection>(<-collection, to: CryptoLeague.CollectionStoragePath)
            acct.link<&{CryptoLeague.CollectionPublic}>(CryptoLeague.CollectionPublicPath, target: CryptoLeague.CollectionStoragePath)
          }
        }
        `,
        limit: 55
      })
      await tx(res).onceSealed()
      setCollection(true)
    }catch(err){
      console.log(err)
      setLoading(false)
    }
    setCollection(true)
  }

  const deleteCollection = async () => {
    try{
      let res = await mutate({
        cadence:`
        import CryptoLeague from 0x851993044a31796b
        transaction() {
          prepare(acct: AuthAccount) {
            let collectionRef <- acct.load<@CryptoLeague.Collection>(from: CryptoLeague.CollectionStoragePath)
              ?? panic("Could not borrow collection reference")
            destroy collectionRef
            acct.unlink(CryptoLeague.CollectionPublicPath)
          }
        }
        `,
        limit: 75
      })
      await tx(res).onceSealed();
      setCollection(false);
    }catch(err){
      console.log(err)
      setLoading(false)
    }
    setCollection(false)
    window.location.reload()
  }

  return {
    loading,
    collection,
    createCollection,
    deleteCollection
  }
}