import React, { memo, useEffect } from 'react';
import styled from "styled-components";

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

//react functional component
const NewNftCard = ({ nft, className = 'd-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4', height, onImgLoad, metaData }) => {

    useEffect(() => {
        return () => {
          console.log("cleaned up");
        };
      }, [metaData]);

    return (
        <div className={className}>
            <div className="nft__item m-0">
                
                <div className="author_list_pp">
                    
                </div>
                <div className="nft__item_wrap" style={{height: `${height}px`}}>
                <Outer>
                    <span>
                        <img key = {metaData} onLoad={onImgLoad} src={metaData ? `https://gateway.pinata.cloud/ipfs/${metaData.image.slice(7)}` : ""} className="lazy nft__item_preview" alt=""/>
                    </span>
                </Outer>
                </div>
                
                <div className="nft__item_info">
                    <span>
                        <h4>{metaData ? `${metaData.name.slice(0,-34)}...${metaData.name.slice(-4)}` : ""}</h4>
                    </span>
                    <div className="nft__item_price">
                        <span>Score: {metaData ?  metaData.attributes.score : ""}</span><span>Rating: {metaData ? metaData.attributes.rating : ""}</span><span>Avg: {metaData ? metaData.attributes.average : ""}</span>
                    </div>
                    
                    <div className="nft__item_like" style={{paddingTop: "0.75em"}}>
                        <i className="fa fa-heart"></i><span>{Math.round(Math.random()*20)+10}</span>
                    </div>                            
                </div> 
            </div>
        </div>             
    );
};

export default NewNftCard;