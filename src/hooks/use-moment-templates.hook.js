import { useEffect, useReducer } from 'react'
import {query} from "@onflow/fcl"
import { defaultReducer } from '../reducer/defaultReducer'
import MomentClass from '../utils/MomentClass'

export default function useMomentTemplates() {
  const [state, dispatch] = useReducer(defaultReducer, { loading: false, error: false, data: [] })

  useEffect(() => {
    const fetchMomentTemplates = async () => {
      dispatch({ type: 'PROCESSING' })
      try {
        let res = await query({ 
          cadence: `
            import CryptoLeague from 0x851993044a31796b 

            pub fun main(UInt32: CryptoLeague.Template) {
              return CryptoLeague.listTemplates()
            }
          ` })
        let mappedMoment = Object.values(res).map(d => {
          return new MomentClass(d?.templateID, d?.team, d?.name, d?.price)
        })
        dispatch({ type: 'SUCCESS', payload: mappedMoment })
      } catch (err) {
        dispatch({ type: 'ERROR' })
      }
    }
    fetchMomentTemplates()
  }, [])

  return state
}