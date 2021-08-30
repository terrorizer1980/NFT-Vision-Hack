  
import React from 'react'

import MomentCard from './MomentCard'
import './MomentList.css'

export default function MomentList({ moments, store }) {

  return (
    <div className="moment-list__wrapper">
      {moments.map((moment, i) => (
        <MomentCard
          key={i}
          moment={moment}
          store={store}
        />
      ))
      }
    </div>
  )
}