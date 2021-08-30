  
import React from 'react'

import { Pack } from '../utils/PackClass'
import useMomentPacks from '../hooks/use-moment-packs.hook'
import Header from '../components/Header'
import MomentList from '../components/MomentList'
import ErrorLoadingRenderer from '../components/ErrorLoadingRenderer'


export default function Packs() {
  const { loading, error, data: packs } = useMomentPacks()
  return (
    <>
      <Header
        title={<><span className="highlight">Packs</span></>}
        subtitle={<>Join the <span className="highlight">latest pack drop</span> to get more moments</>}
      />
      <ErrorLoadingRenderer loading={loading} error={error}>
        <MomentList moments={packs.map(p => new Pack(p?.familyID, p?.name))} store />
      </ErrorLoadingRenderer>
    </>
  )
}