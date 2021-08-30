import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import useMomentPacks from '../hooks/use-moment-packs.hook'
import Spinner from '../components/Spinner'
import "./PackDetails.page.css"

export default function PackDetails() {
  const [pack, setPack] = useState(null)
  const [moments, setMoments] = useState([])
  const { packID } = useParams()
  const { fetchMomentsOfPack, mintFromPack, fetchPackDetails } = useMomentPacks()

  useEffect(() => {
    fetchMoments()
    //eslint-disable-next-line
  }, [])

  const fetchMoments = async () => {
    let momentsOfPack = await fetchMomentsOfPack(parseInt(packID.replace("Pack", "")))
    setMoments(momentsOfPack)
    let packDetails = await fetchPackDetails(parseInt(packID.replace("Pack", "")))
    setPack(packDetails)
  }

  if (!pack) return <Spinner />

  return (
    <div className="packdetails__wrapper">
      <img className="pack__img" src={`${process.env.PUBLIC_URL}/assets/${packID}.png`} alt='Pack' />
      <div className="pack__content">
        <h3 className="app__title">{pack?.name}</h3>
        <div
          onClick={() => mintFromPack(packID, moments, pack?.price)}
          className="btn btn-bordered btn-light"
          style={{ width: "60%", margin: "0 auto", display: "flex", justifyContent: "center" }}>
          <i className="ri-shopping-cart-fill" style={{ fontSize: "1.2rem", marginRight: ".2rem" }}></i> {parseInt(pack?.price)} FUSD
        </div>
        <p>moments included:</p>
        <p>
          {moments.map((d, i) => ` #${d} `)}
        </p>
      </div>
    </div>
  )
}