import React, {useState, useContext, useEffect} from "react";
import ColumnNewRedux from '../components/ColumnNewRedux';
import Footer from '../components/Footer';
import { createGlobalStyle } from 'styled-components';
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from '@web3-react/injected-connector'
import { AccountContext } from '../App';
//const Web3 = require('web3');

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #212428;
  }
`;

const Collection= function(props) {
const [openMenu, setOpenMenu] = React.useState(true);
const [openMenu1, setOpenMenu1] = React.useState(false);

const { active, account, chainId, library, connector, activate, deactivate } = useWeb3React();

const {globalAccount, setGlobalAccount, globalActive, setGlobalActive} = useContext(AccountContext);

useEffect(() => {
  setGlobalAccount(account);
  setGlobalActive(active);
}, [account, active])


const handleBtnClick = () => {
  setOpenMenu(!openMenu);
  setOpenMenu1(false);
  document.getElementById("Mainbtn").classList.add("active");
  document.getElementById("Mainbtn1").classList.remove("active");
};
const handleBtnClick1 = () => {
  setOpenMenu1(!openMenu1);
  setOpenMenu(false);
  document.getElementById("Mainbtn1").classList.add("active");
  document.getElementById("Mainbtn").classList.remove("active");
};



return (
<div>
<GlobalStyles/>

  <section id='profile_banner' className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'./img/background/4.jpg'})`}}>
    <div className='mainbreadcumb'>
    </div>
  </section>

  <section className='container d_coll no-top no-bottom'>
    <div className='row'>
      <div className="col-md-12">
         <div className="d_profile">
                  <div className="profile_avatar">
                      <div className="d_profile_img">
                          <img src="./img/author/author-1.jpg" alt=""/>
                          <i className="fa fa-check"></i>
                      </div>
                      
                      <div className="profile_name">
                          <h4>
                          {globalActive && `${globalAccount.slice(0,5)}...${globalAccount.slice(-4)}`}                                              
                              <div className="clearfix"></div>
                              
                          </h4>
                      </div>
                  </div>

          </div>
      </div>
    </div>
  </section>

  <section className='container no-top'>
        <div className='row'>
          <div className='col-lg-12'>
              <div className="items_filter">
                <ul className="de_nav">
                    <li id='Mainbtn' className="active"><span onClick={handleBtnClick}>Placeholder Filter</span></li>
                    <li id='Mainbtn1' className=""><span onClick={handleBtnClick1}>Placeholder Filter</span></li>
                </ul>
            </div>
          </div>
        </div>
      {openMenu && (  
        <div id='zero1' className='onStep fadeIn'>
         <ColumnNewRedux shuffle showLoadMore={false}/>
        </div>
      )}
      {openMenu1 && ( 
        <div id='zero2' className='onStep fadeIn'>
         <ColumnNewRedux shuffle showLoadMore={false}/>
        </div>
      )}
      </section>


  <Footer />
</div>
);
}
export default Collection;