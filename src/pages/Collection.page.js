import React from 'react'
import MomentList from '../components/MomentList'
import Header from '../components/Header'
import { useUser } from '../providers/UserProvider'


export default function Collection() {
  const { collection, createCollection, deleteCollection, userMoments } = useUser()

  return (
    <>
      <Header
        title={<><span className="highlight">Collection</span></>}
        subtitle={<>Here are the <span className="highlight">Moments and Packs</span> you have collected</>}
      />

      {!collection ?
        <div className="btn btn-round" onClick={() => createCollection()}>Create Collection</div> :
        <>
          <MomentList moments={userMoments} />
          <div className="btn btn-round" onClick={() => deleteCollection()}>Delete Collection</div>
        </>
      }
    </>
  )
}