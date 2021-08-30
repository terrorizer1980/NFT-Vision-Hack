import React from 'react'
import Header from '../components/Header'
import "./Home.page.css"

export default function Home() {

  return (
    <>
      <Header
        title={<><span className="highlight">Crypto</span>League</>}
        subtitle={<>The brand new <span className="highlight">collectible game</span> on the blockchain</>}
      />
    </>
  )
}