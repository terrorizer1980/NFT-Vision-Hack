import { useEffect, useReducer } from 'react'
import { userMomentReducer } from '../reducer/userMomentReducer'
import MomentClass from '../utils/MomentClass'
import { mutate, query, tx } from '@onflow/fcl'
import { useTxs } from '../providers/TxProvider'

export default function useUserMoments(user, collection, getFUSDBalance) {
  const [state, dispatch] = useReducer(userMomentReducer, {
    oading: false,
    error: false,
    data: []
  })

  const {addTx} = useTxs

  useEffect(() => {
    const fetchUserMoments = async () => {
      dispatch({ type: 'PROCESSING' })
      try {
        let res = await query({
          cadence: `
          import CryptoLeague from 0x851993044a31796b
          pub fun main(addr: Address): {UInt64: CryptoLeague.Template}? {
            let account = getAccount(addr)
            if let ref = account.getCapability<&{CryptoLeague.CollectionPublic}>(CryptoLeague.CollectionPublicPath)
              .borrow() {
                let moments = ref.listCards()
                return moments
              }
              
            return nil 
          }
          `,
          args: (arg, t) => [arg(user?.addr, t.Address)],
        });
        let mappedMoments = [];

        for (let key in res) {
          const e = res[key];
          let moment = new MomentClass(
            e.templateID,e.team,e.name,e.price,key
          );
          mappedMoments.push(moment);
        }
        dispatch({ type: 'SUCCESS', payload: mappedMoments })
      } catch (err) {
        dispatch({ type: 'ERROR' })
      }
    }
    fetchUserMoments()
    //eslint-disable-next-line
  }, [])

  const mintMoment = async (templateID, amount) => {
    if(!collection){
      alert("You need to enable the collection first. Go to the tab collection")
      return 
    }
    try {
      let res = await mutate({
        cadence:`
        import CryptoLeague from 0x851993044a31796b
        import FUSD from 0xFUSD
        import FungibleToken from 0xFungibleToken

        transaction(templateID: UInt32, amount: UFix64) {

          let receiverReference: &CryptoLeague.Collection{CryptoLeague.Receiver}
          let sentVault: @FungibleToken.Vault

          prepare(acct: AuthAccount) {
            self.receiverReference = acct.borrow<&CryptoLeague.Collection>(from: CryptoLeague.CollectionStoragePath)
              ?? panic("Cannot borrow")

            let vaultRef = acct.borrow<&FUSD.Vault>(from: /storage/fusdVault) ?? panic("Could not borrow FUSD Vault")
            self.sentVault <- vaultRef.withdraw(amount: amount)
          }
          execute {
            let newMoment <- CryptoLeague.mintCard(templateID: templateID, paymentVault: <-self.sentVault)
            self.receiverReference.deposit(token: <-newMoment)
          }
        }
        `,
        limit:55,
        args: (arg, t) => [arg(templateID, t.UInt32), arg(amount, t.UFix64)],
      })
      addTx(res)
      await tx(res).onceSealed();
      await getFUSDBalance();
      await addMoment(templateID)
    } catch (error) {
      console.log(error)
    }
  }

  const addMoment = async (templateID) => {
    try {
      let res = await query({
        cadence:`
        import CryptoLeague from 0x851993044a31796b
        pub fun main(addr: Address): {UInt64: CryptoLeague.Template}? {
          let account = getAccount(addr)
          
          if let ref = account.getCapability<&{CryptoLeague.CollectionPublic}>(CryptoLeague.CollectionPublicPath)
                      .borrow() {
                        let moments = ref.listCards()
                        return moments
                      }
          
          return nil
        }
        `,
        args: (arg,t) => [arg(user?.addr, t.Address)]
      })
      const moment = Object.values(res).find(d => d?.templateID === templateID)
      const newMoment = new MomentClass(moment.templateID, moment.team, moment.name)
      dispatch({ type: 'ADD', payload: newMoment })
    } catch (err) {
      console.log(err)
    }
  }

  const batchAddMoments = async (moments) => {
    try {
      let res = await query({
        cadence: `
        import CryptoLeague from 0x851993044a31796b
        pub fun main(addr: Address): {UInt64: CryptoLeague.Template}? {
          let account = getAccount(addr)
          
          if let ref = account.getCapability<&{CryptoLeague.CollectionPublic}>(CryptoLeague.CollectionPublicPath)
                      .borrow() {
                        let moments = ref.listCards()
                        return moments
                      }
          
          return nil
        }
        `,
        args: (arg, t) => [arg(user?.addr, t.Address)]
      })
      const allMoments = Object.values(res)
      const momentToAdd = allMoments.filter(d => moments.includes(d?.templateID))
      const newMoments = momentToAdd.map(d => new MomentClass(d.templateID, d.dna, d.name))
      for (let index = 0; index < newMoments.length; index++) {
        const e = newMoments[index];
        dispatch({ type: 'ADD', payload: e })
      }
    } catch (err) {
      console.log(err)
    }
  }

  return {
    ...state,
    mintMoment,
    addMoment,
    batchAddMoments
  }
}