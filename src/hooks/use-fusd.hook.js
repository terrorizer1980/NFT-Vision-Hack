import { mutate, query, tx } from '@onflow/fcl';
import { useEffect, useReducer } from 'react'
import { defaultReducer } from '../reducer/defaultReducer'

export default function useFUSD(user) {
  const [state, dispatch] = useReducer(defaultReducer, {
    loading: true,
    error: false,
    data: null
  })

  useEffect(() => {
    getFUSDBalance();
    //eslint-disable-next-line 
  }, [])

  const getFUSDBalance = async (user) => {
    dispatch({ type: 'PROCESSING' })
    try {
      let response = await query({
        cadence:`
        import FungibleToken from 0x851993044a31796b
        import FUSD from 0xFUSD
        pub fun main(address: Address): UFix64? {
          let account = getAccount(address)
          if let vaultRef = account.getCapability(/public/fusdBalance).borrow<&FUSD.Vault{FungibleToken.Balance}>() {
            return vaultRef.balance
          } 
          return nil
        }
        `,
        args: (arg,t) => [arg(user?.addr, t.Address)]
      })
      dispatch({ type: 'SUCCESS', payload: response })
    } catch (err) {
      dispatch({ type: 'ERROR' })
      console.log(err)
    }
  }

  const createFUSDVault = async () => {
    dispatch({ type: "PROCESSING" });
    try {
      let transaction = await mutate({
        cadence: `
        import FungibleToken from 0x851993044a31796b
        import FUSD from 0xFUSD
        transaction {
          prepare(signer: AuthAccount) {
            if(signer.borrow<&FUSD.Vault>(from: /storage/fusdVault) != nil) {
              return
            }
            signer.save(<-FUSD.createEmptyVault(), to: /storage/fusdVault)
            signer.link<&FUSD.Vault{FungibleToken.Receiver}>(
              /public/fusdReceiver,
              target: /storage/fusdVault
            )
            signer.link<&FUSD.Vault{FungibleToken.Balance}>(
              /public/fusdBalance,
              target: /storage/fusdVault
            )
          }
        }
        `,
      });
      await tx(transaction).onceSealed();
      dispatch({ type: "SUCCESS" });
    } catch (err) {
      dispatch({ type: "ERROR" });
    }
  };

  return {
    ...state,
    createFUSDVault,
    getFUSDBalance
  }
}