import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';
import { clearNfts } from '../../store/actions';
import NftCard from './NftCard';
import { shuffleArray } from '../../store/utils';
import { propTypes } from 'react-bootstrap/esm/Image';

//react functional component
const ColumnNewRedux = (props) => {
    const shuffle = false;
    const dispatch = useDispatch();
    const nftsState = useSelector(selectors.nftBreakdownState);
    const nfts = nftsState.data ? shuffle ? shuffleArray(nftsState.data) : nftsState.data : [];
    const nftObj = {props}
    //const nftsList = {props};

    const [height, setHeight] = useState(0);
    const [nftsList, setNftsList] = useState([])

    const onImgLoad = ({target:img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }
    
    useEffect(() => {
        dispatch(actions.fetchNftsBreakdown());
    }, [dispatch]);

    //will run when component unmounted
    useEffect(() => {
        return () => {
            dispatch(clearNfts());
        }
    },[dispatch])

    const loadMore = () => {
        dispatch(actions.fetchNftsBreakdown());
    }

    return (
        <div className='row'>
            {nfts && nfts.map( (nft, index) => (
                <NftCard nft={nft} key={index} onImgLoad={onImgLoad} height={height} />
            ))}
            {
                /*nftsList later*/
            }
        </div>              
    );
};

export default memo(ColumnNewRedux);