import React from 'react'
import { useHistory } from 'react-router-dom'

import { useUser } from '../providers/UserProvider'
import "./MomentCard.css"

export default function MomentCard({ moment, store }) {
  const { userMoments, mintMoment } = useUser()
  const history = useHistory()
  const { id, image, name, rarity, price, type, serialNumber, team } = moment
  const owned = userMoments.some(d => d?.id === moment?.id)

  const MomentButton = () => (
    <div
      onClick={() => mintMoment(id, price)}
      className="btn btn-bordered btn-light btn-moment">
      <i className="ri-shopping-cart-fill btn-icon"></i> {parseInt(price)} FUSD
    </div>
  )

  const PackButton = () => (
    <div
      onClick={() => history.push(`/packs/${id}`)}
      className="btn btn-bordered btn-light btn-moment">
      More
    </div>
  )

  return (
    <div className="moment-card__border">
      <div className={`moment-card__wrapper ${owned && store && "faded"}`} >
      {type === "Moment" ? <img className={`dappy-card__imagee ${type === "Moment" && "img-large"}`} src={image} alt="Card" /> :
          <img className={`moment-card__image ${type === "Pack" && "img-large"}`} src={image} alt="Pack" />
        }
        <br />
        <h3 className="moment-card__title">{name}</h3>
        <p className="moment-card__info"># {id} {owned && !store && ` / ${serialNumber}`}</p>
        <p className="moment-card__info">Team: {team}</p>
        <p className="moment-card__info">{rarity}</p>
      </div>

      {!owned && type === "Moment" && <MomentButton />}
      {!owned && type === "Pack" && <PackButton />}

      {store && owned && <div className="collected">Collected</div>}
    </div >
  )
}