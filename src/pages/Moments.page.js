import React from 'react'

import useMomentTemplates from '../hooks/use-moment-templates.hook'
import MomentList from '../components/MomentList'
import Header from '../components/Header'
import ErrorLoadingRenderer from '../components/ErrorLoadingRenderer'

export default function Moments() {
  const { data: momentTemplates, loading, error } = useMomentTemplates()

  return (
    <>
      <Header
        title={<><span className="highlight">Moments</span></>}
        subtitle={<>Buy individual <span className="highlight">moments</span> in our store</>}
      />
      <ErrorLoadingRenderer loading={loading} error={error}>
        <MomentList moments={momentTemplates} store />
      </ErrorLoadingRenderer>
    </>
  )
}