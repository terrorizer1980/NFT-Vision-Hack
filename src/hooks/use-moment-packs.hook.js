import { useEffect, useReducer } from 'react'
import { defaultReducer } from '../reducer/defaultReducer'
import { useUser } from '../providers/UserProvider'
import { useTxs } from '../providers/TxProvider'

import { Pack } from '../utils/PackClass'
import { mutate, query, tx } from '@onflow/fcl'

export default function useMomentPacks() {
  const [state, dispatch] = useReducer(defaultReducer, {
    loading: true,
    error: false,
    data: []
  })
  const { collection, batchAddMoments, getFUSDBalance } = useUser()
  const { runningTxs, addTx } = useTxs()

  useEffect(() => {
    const fetchPacks = async () => {
      dispatch({ type: 'PROCESSING' })
      try {
        const res = await query({
          cadence: `
          import CryptoLeague from 0x851993044a31796b
  
          pub fun main(): [CryptoLeague.PackReport] {
            let packs = CryptoLeague.listPacks()
            return packs
          }
          `
        })
        dispatch({ type: 'SUCCESS', payload: res })
      } catch (err) {
        dispatch({ type: 'ERROR' })
      }
    }
    fetchPacks()
  }, [])

  const fetchPackDetails = async (packID) => {
    let res = await query({
      cadence: `
      import CryptoLeague from 0x851993044a31796b
      pub fun main(packID: UInt32): CryptoLeague.PackReport {
        let pack = CryptoLeague.getPack(packID: packID)
        return pack
      }
      `,
      args: (arg, t) => [arg(packID, t.UInt32)]
    })
    return new Pack(res?.packID, res?.name, res?.price)
  }

  const fetchMomentsOfPack = async (packID) => {
    let res = await query({
      cadence: `
      import CryptoLeague from 0x851993044a31796b
      pub fun main(packID: UInt32): [UInt32] {
        let templates = CryptoLeague.listPackTemplates(packID: packID)
        return templates
      }
      `,
      args: (arg, t) => [arg(packID, t.UInt32)]
    })
    return res
  }

  const mintFromPack = async (packID, moments, amount) => {
    if (!collection) {
      alert(`
      You need to enable the collection first. 
      Go to the tab 'Collection' and click on 'Create Collection'.`)
      return
    }

    if (runningTxs) {
      alert("Transactions are still running. Please wait for them to finish first.")
      return
    }

    var momentsToMint = []

    for (let index = 0; index < moments.length; index++) {
      if (index > 4) break
      const randomNumber = Math.floor(Math.random() * moments.length);
      momentsToMint.push(moments[randomNumber])
    }

    let packNum = parseInt(packID.replace("Pack", ""))
    let res = await mutate({
      cadence: `
      import CryptoLeague from 0x851993044a31796b
      import FungibleToken from 0xFungibleToken
      import FUSD from 0xFUSD

      transaction(packID: UInt32, templateIDs: [UInt32], amount: UFix64 ) {

        let receiverReference: &CryptoLeague.Collection{CryptoLeague.Receiver}
        let sentVault: @FungibleToken.Vault

        prepare(acct: AuthAccount) {
          self.receiverReference = acct.borrow<&CryptoLeague.Collection>(from: CryptoLeague.CollectionStoragePath) 
              ?? panic("Cannot borrow")
          let vaultRef = acct.borrow<&FUSD.Vault>(from: /storage/fusdVault) ?? panic("Could not borrow FUSD vault")
          self.sentVault <- vaultRef.withdraw(amount: amount)
        }

        execute {
          let collection <- CryptoLeague.batchMintCardsFromPack(packID: packID, templateIDs: templateIDs, paymentVault: <-self.sentVault)
          self.receiverReference.batchDeposit(collection: <-collection)
        }
      }
      `,
      limit: 300,
      args: (arg, t) => [arg(packNum, t.UInt32), arg(momentsToMint, t.Array(t.UInt32)), arg(amount, t.UFix64)]

    })
    addTx(res)
    await tx(res).onceSealed()
    await getFUSDBalance()
    batchAddMoments(momentsToMint)
  }


  return {
    ...state,
    fetchMomentsOfPack,
    fetchPackDetails,
    mintFromPack,
  }
}