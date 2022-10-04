import { otherAbi } from './../../abis/otherAbis'
import React, { useState, useContext, useEffect } from "react";
import Footer from '../components/Footer';
import { useWeb3React } from "@web3-react/core";
import { AccountContext } from '../App';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { formatEther } from '@ethersproject/units';

const Web3 = require('web3');

const Mint = function() {
  const [files, setFiles] = useState([]);
  const [fileURL, setFileURL] = useState("");
  const [start, setStart] = useState(0);
  const [dateTime, setDateTime] = useState("");
  const [currentImageURI, setCurrentImageURI] = useState("");
  const [amountRuns, setAmountRuns] = useState(100);
  const [penaltyLevels, setPenaltyLevels] = useState([]);
  const [accLevels, setAccLevels] = useState([]);
  const [costLevels, setCostLevels] = useState([]);
  const [NFTContract, setNFTContract] = useState();
  const [VerifyContract, setVerifyContract] = useState();
  const [DAOContract, setDAOContract] = useState();
  const [deviceIMEI, setDeviceIMEI] = useState();
  const [score, setScore] = useState(0);
  const [rating, setRating] = useState("");
  const [average, setAverage] = useState("");
  const [pendingTokenURI, setPendingTokenURI] = useState("");
  const [pendingTimeStamp, setPendingTimeStamp] = useState(0);
  const [r, setR] = useState("");
  const [s, setS] = useState("");
  const [v, setV] = useState(0);
  const [ratingBreaks, setRatingBreaks] = useState([]);
  const [ratingLabels, setRatingLabels] = useState([]);
  const [daoJoin, setDAOJoin] = useState(false);
  const [daoUpdate, setDAOUpdate] = useState(false);
  const [daoShow, setDAOShow] = useState(false);
  const [daoRating, setDAORating] = useState("");
  const [daoLevel, setDAOLevel] = useState(0);
  const [pendingMint, setPendingMint] = useState(false);

  const { active, account, chainId, library, connector, activate, deactivate } = useWeb3React();

  const {globalAccount, setGlobalAccount, globalActive, setGlobalActive , globalChainId, setGlobalChainId} = useContext(AccountContext);

  

    return (
      <div>

        <section className='jumbotron breadcrumb no-bg'>
          <div className='mainbreadcrumb'>
            <div className='container'>
              <div className='row m-10-hor'>
                <div className='col-12'>
                  <h1 className='text-center'>Mint</h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='container' style={{paddingBottom: "0.1em"}}>
        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
              <form id="form-create-item" className="form-border" action="#">
                  <div className="field-set">
                      <h5>Upload file</h5>

                      <div className="d-create-file">
                          {files && files.length === 0 && <p id="file_name">PNG, JPG, GIF, WEBP or MP4. Max 200mb.</p>}
                          {files.map((x, index) => 
                          <p key={`${index}`}>{x.name}</p>
                          )}
                          <div className='browse'>
                            <input type="button" id="get_file" className="btn-main" value="Browse"/>
                            <input id='upload_file' type="file"  />
                          </div>
                          
                      </div>

                      <div className="spacer-single"></div>

                      <h5>Data Points (min: 100, max : 500) &emsp;{deviceIMEI !="" && <span>Device IMEI : {deviceIMEI}</span>} </h5>
                      <input type="number" name="item_title" id="item_title" className="form-control" value = {amountRuns} onChange = {(e) => {setAmountRuns(e.target.value)}} />

                      <div className="spacer-10"></div>

                      {pendingMint && <h5>Score: {score} and rating : {rating}</h5>}

                      <div className="spacer-10"></div>
                      
                      {deviceIMEI!=="" ? <input type="button" id="submit" className="btn-main" value="Get Mint Data"/> : <h5>Address has no registered device</h5>} {pendingMint && <span style={{marginLeft : "3em"}}><input type="button" id="submit" className="btn-main" value="Mint Now" /></span>}
                      {daoShow && <span style={{marginLeft : "3em"}}><input type="button" id="submit" className="btn-main" value="Join/Update Dao"/> &ensp; Rating: {daoRating} &ensp; Level: {daoLevel}</span>}
                  </div>
              </form>
          </div>

          <div className="col-lg-3 col-sm-6 col-xs-12">
                  <h5>Preview item</h5>
                  <div className="nft__item m-0">
                      
                      <div className="author_list_pp">
                          <span>                                    
                              <img className="lazy" src={`./img/author/author-5.jpg`} alt=""/>
                              <i className="fa fa-check"></i>
                          </span>
                      </div>
                      <div className="nft__item_wrap">
                          <span>
                              <img src={`${(files.length > 0) ? fileURL : "./img/collections/coll-item-3.jpg"}`} id="get_file_2" className="lazy nft__item_preview" alt=""/>
                          </span>
                      </div>
                  </div>
              </div>                                         
      </div>

      </section>

        <Footer />
      </div>
   );
  
}
export default Mint;