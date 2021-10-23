import React from 'react';
import ColumnNewThreeColRedux from '../components/ColumnNewThreeColRedux';
import Footer from '../components/Footer';
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  .navbar {
    border-bottom: solid 1px rgba(255, 255, 255, .1) !important;
  }
`;


const holdings= () => (
<div>
<GlobalStyles/>
  <section className='container'>
        <div className='row'>
        <div className="spacer-double"></div>

          <div className='col-md-3'>

          <div className="item_filter_group">
              <h4>Placeholder Categories</h4>
              <div className="de_form">
                  <div className="de_checkbox">
                      <input id="check_cat_1" name="check_cat_1" type="checkbox" value="check_cat_1"/>
                      <label htmlFor="check_cat_1">Placeholder</label>
                  </div>

                  <div className="de_checkbox">
                      <input id="check_cat_2" name="check_cat_2" type="checkbox" value="check_cat_2"/>
                      <label htmlFor="check_cat_2">Placeholder</label>
                  </div>

                  <div className="de_checkbox">
                      <input id="check_cat_3" name="check_cat_3" type="checkbox" value="check_cat_3"/>
                      <label htmlFor="check_cat_3">Placeholder</label>
                  </div>

                  <div className="de_checkbox">
                      <input id="check_cat_4" name="check_cat_4" type="checkbox" value="check_cat_4"/>
                      <label htmlFor="check_cat_4">Placeholder</label>
                  </div>

                  <div className="de_checkbox">
                      <input id="check_cat_5" name="check_cat_5" type="checkbox" value="check_cat_5"/>
                      <label htmlFor="check_cat_5">Placeholder</label>
                  </div>

                  <div className="de_checkbox">
                      <input id="check_cat_6" name="check_cat_6" type="checkbox" value="check_cat_6"/>
                      <label htmlFor="check_cat_6">Placeholder</label>
                  </div>

                  <div className="de_checkbox">
                      <input id="check_cat_7" name="check_cat_7" type="checkbox" value="check_cat_7"/>
                      <label htmlFor="check_cat_7">Placeholder</label>
                  </div>

                  <div className="de_checkbox">
                      <input id="check_cat_8" name="check_cat_8" type="checkbox" value="check_cat_8"/>
                      <label htmlFor="check_cat_8">Placeholder</label>
                  </div>

              </div>
          </div>


          </div>

          <div className="col-md-9">
            <ColumnNewThreeColRedux/>
          </div>
        </div>
      </section>


  <Footer />
</div>

);
export default holdings;