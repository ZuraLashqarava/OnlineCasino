import React from "react";
import { useNavigate } from "react-router-dom";
import "./SlotCard.scss";
import logo from "./Fruit.jpg";
 
export interface SlotCardData {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isNew?: boolean;
  isHot?: boolean;
}
 
interface SlotCardProps {
  slot: SlotCardData;
}
 
const SlotCard: React.FC<SlotCardProps> = ({ slot }) => {
  const navigate = useNavigate();
 
  return (
    <div className="slot-card">
      
      {slot.isNew && <span className="slot-card__badge slot-card__badge--new">New</span>}
      {slot.isHot && <span className="slot-card__badge slot-card__badge--hot">Hot</span>}
 
      
      <div className="slot-card__image-wrap">
        <img
          src={logo}
          alt={slot.name}
          className="slot-card__image"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/assets/slots/placeholder.png";
          }}
        />
        <div className="slot-card__image-overlay" />
      </div>
 
      
      <div className="slot-card__body">
        <h3 className="slot-card__name">{slot.name}</h3>
        <p className="slot-card__desc">{slot.description}</p>
 
        <button
          className="slot-card__play-btn"
          onClick={() => navigate(`/slots/${slot.id}`)}
        >
          <span className="slot-card__play-icon">▶</span>
          Play Now
        </button>
      </div>
 
      
      <div className="slot-card__corner slot-card__corner--tl" />
      <div className="slot-card__corner slot-card__corner--br" />
    </div>
  );
};
 
export default SlotCard;