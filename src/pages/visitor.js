import React from 'react'
import styled from 'styled-components'
import ImgFace from './visitor/esens_face.png'
import ImgEyeLeft from './visitor/esens_left.png'
import ImgEyeRight from './visitor/esens_right.png'

const Wrapper = styled.div`
   background-color: green;
   display: flex;
   flex-direction: column;
   height: 100vh;
   align-items: center;
`

const FaceWrapper = styled.div`
   position: relative;
   background-color: red;
   width: 100%;
   height: 100%;
   display: flex;
   justify-content: center;
   align-items: center;
`

const Face = styled.div`
   width: 420px;
   height: 500px;
   background-image: url('${props => props.backgroundImage}');
   z-index: 11;
`

const Eyes = styled.div`
  background-color: green;
  width: 100%;
  position: absolute;
  top: calc(50% - 85px);
  text-align: center;
  z-index: 10;
  transform: translate(${props => props.x}px);
  transition: all 1s;
`

const EyeLeft = styled.img`
  // margin-left: -10px; 
  margin-bottom: 0;
  padding-right: 12px;
  margin-left: -8px;
`

const EyeRight = styled.img`
  margin-bottom: 0;
`


const WiperWrapper = styled.div`
   margin-top: auto;
   background-color: red;
   height: 200px;
   text-align: center;
`

const SwipeBall = styled.div`
  background-color: black;
  cursor: pointer;
  width: 100px;
  height: 100px;
  border-radius: 100%;
  margin: 0 auto;
`


class VisitorPage extends React.Component {

  state = {
    swing: true
  }

  componentDidMount() {
    setInterval(() => this.setState({swing: !this.state.swing}), 1000 )
  }

  render() {
    return <Wrapper>
      <FaceWrapper>
        <Face backgroundImage={ImgFace}/>
        <Eyes x={this.state.swing ? 8 : -8}>
          <EyeLeft src={ImgEyeLeft}/>
          <EyeRight src={ImgEyeRight}/>
        </Eyes>
      </FaceWrapper>
      <WiperWrapper>
        <SwipeBall/>
      </WiperWrapper>
      {/*<audio autoPlay loop>*/}
      {/*<source src="https://s3.ap-northeast-2.amazonaws.com/static.holdonnn.me/mp3/e-sens-visitor.mp3" type="audio/mpeg" />*/}
      {/*Your browser does not support the audio element.*/}
      {/*</audio>*/}
    </Wrapper>
  }
}

export default VisitorPage
