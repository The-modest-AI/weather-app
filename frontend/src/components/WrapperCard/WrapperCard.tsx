import React, { useEffect, useState } from "react";
import { DataModel, getData } from "../../utils/mapJSON";
import GeoAutoInputBox from "../GeoAutoInputBox/index";
import GeoAutoInputBoxSkeletonLoader from "../GeoAutoInputBox/GeoAutoInputBoxSkeletonLoader";
import MainCard from "./MainCard/index";
import MainCardSkeletonLoader from "./MainCard/MainCardSkeletonLoader";
import SmallCardContainer from "./SmallCardsContainer/index";
import SmallCardContainerSkeletonLoader from "./SmallCardsContainer/SmallCardContainerSkeletonLoader";
import { FlexDiv, MiddleDiv, OutermostDiv, WrapperInnerDiv } from "./WrapperCard.style";

export const SkeletonLoaderContext = React.createContext(false);

const WrapperCard: React.FC = (): JSX.Element => {
  const [shimmerState, setShimmerState] = useState(false);
  const [locationState, setLocationState] = useState<{ latitude: number; longitude: number }>();
  const [dataState, setDataState] = useState<{ res: DataModel[] }>({ res: [] });
  const [indexState, setIndexState] = useState(0);
  const [addressState, setAddressState] =
    useState<{ res: { placeName: string; coordinates: { lat: number; long: number } } }>();

  useEffect(() => {
    (function initUserLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLocationState({ latitude, longitude });
          setShimmerState(false);
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (addressState) {
      const latitude = addressState.res.coordinates.lat;
      const longitude = addressState.res.coordinates.long;
      setLocationState({ latitude, longitude });
    }
  }, [addressState]);

  useEffect(() => {
    if (locationState) {
      setShimmerState(() => true);
      fetch(`http://localhost:3001/api/weather/${locationState.latitude}/${locationState.longitude}`)
        .then((response) => response.json())
        .then((e) => {
          let address = addressState?.res.placeName;
          setDataState({ res: getData(e.weeklyArray, address) });
          setShimmerState(() => false);
        })
        .catch((error) => {
          setShimmerState(true);
        });
    }
  }, [locationState]);

  const handleClick = (index: number): void => {
    setIndexState(index);
  };

  const onNewLocation = (coordinates: { lat: number; long: number }, placeName: string): void => {
    setAddressState({ res: { placeName, coordinates } });
  };

  const getSmallCardData = (
    data: DataModel[]
  ): {
    day: string;
    icon: string;
    maxTemp: number;
    minTemp: number;
  }[] => {
    return data.map((e) => {
      return {
        day: e.day,
        icon: e.image,
        maxTemp: e.maxTemp,
        minTemp: e.minTemp,
      };
    });
  };

  if (dataState.res && dataState.res.length > 0) {
    return (
      <>
        <FlexDiv>
          <SkeletonLoaderContext.Provider value={shimmerState}>
            <GeoAutoInputBox onNewLocation={onNewLocation} />
            <OutermostDiv>
              <MiddleDiv>
                <WrapperInnerDiv>
                  <MainCard data={dataState.res[indexState]} />
                  <SmallCardContainer
                    onClickProp={handleClick}
                    data={getSmallCardData(dataState.res)}
                    currentSelected={indexState}
                  />
                </WrapperInnerDiv>
              </MiddleDiv>
            </OutermostDiv>
          </SkeletonLoaderContext.Provider>
        </FlexDiv>
        )
      </>
    );
  } else {
    return (
      <FlexDiv>
        <GeoAutoInputBoxSkeletonLoader />
        <OutermostDiv>
          <MiddleDiv>
            <WrapperInnerDiv>
              <MainCardSkeletonLoader />
              <SmallCardContainerSkeletonLoader />
            </WrapperInnerDiv>
          </MiddleDiv>
        </OutermostDiv>
      </FlexDiv>
    );
  }
};

export default WrapperCard;
