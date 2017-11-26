import React from 'react'
import Link from 'gatsby-link'
import styled from 'styled-components'
import {media} from '../utils/style'
import ImgFace from './visitor/esens_face.png'
import ImgEyeLeft from './visitor/esens_left.png'
import ImgEyeRight from './visitor/esens_right.png'

const Wrapper = styled.div`
   color: white;
   background-color: black;
   display: flex;
   flex-direction: column;
   height: 100vh;
   align-items: center;
   width: 100wh;
   overflow-x: hidden;
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
`

const FaceWrapper = styled.div`
   position: relative;
   width: 100%;
   display: flex;
   justify-content: center;
   align-items: center;
`

const Face = styled.div`
   width: 420px;
   ${media.mobile`width: ${420 * 0.6}px;`} 
   height: 500px;
   ${media.mobile`height: ${500 * 0.6}px;`} 
   background-image: url('${props => props.backgroundImage}');
   background-size: contain;
   z-index: 11;
   margin: 0 auto;
`

const Eyes = styled.div`
  width: 100%;
  position: absolute;
  top: calc(50% - 85px);
  ${media.mobile`top: calc(50% - ${85 * 0.6}px);`}
  text-align: center;
  z-index: 10;
  transform: translate(${props => props.x}px);
  transition: all ${props => props.dragging ? 0 : 1}s;
`

const EyeLeft = styled.img`
  margin-bottom: 0;
  padding-right: 12px;
  margin-left: -8px;
  ${media.mobile`height: 24px;`}
  ${media.mobile`padding-right: 8px;`}
  ${media.mobile`margin-left: -4px;`}
`

const EyeRight = styled.img`
  margin-bottom: 0;
  ${media.mobile`height: 24px;`}
`


const WiperWrapper = styled.div`
  width: 100%;
  margin-top: auto;
  height: 60px;
  text-align: center;
  position: relative;
`

const SwipeBall = styled.div`
  background-color: #495057;
  color: #f8f9fa;
  cursor: pointer;
  width: 60px;
  height: 60px;
  border-radius: 100%;
  position: absolute;
  top:0;
  left: ${props => props.dragEndX ? `${(props.dragEndX - 30)}px` : `calc(50% - 30px)`};
`

const Header = styled(Link)`
  margin-left: auto;
  padding: 0.4rem;
  font-size: 0.8rem;
  color: inherit;
`

const Audio = styled.audio`

`


class VisitorPage extends React.Component {

  state = {
    swing: true,
    dragging: false,
    dragStartX: null,
    dragEndX: null,
    width: 0,
  };

  componentDidMount() {
    setInterval(() => this.setState({swing: !this.state.swing}), 1500)
  }

  swipeStart = (e) => {
    const dragStartX = e.touches ? e.touches[0].pageX : e.clientX
    this.setState({
      dragging: true,
      dragStartX,
    })
  }

  swipeEnd = () => {
    this.setState({dragging: false});
  }

  swipeMove = (e) => {
    if (!this.state.dragging) {
      e.preventDefault();
      return;
    }
    const dragEndX = e.touches ? e.touches[0].pageX : e.clientX;
    const width = this.getWindowWidth();
    this.setState({
      dragEndX: Math.min(Math.max(dragEndX, -15), width + 15)
    });
  }

  getEyesX = () => {
    if (!this.state.dragging) {
      return this.state.swing ? 6 : -6;
    }
    const width = this.getWindowWidth();
    return ((Math.min(Math.max(this.state.dragEndX, 0), width) / width) - 0.5) * 12;
  }

  getWindowWidth = () => {
    const w = window,
      d = document,
      el = d.documentElement,
      g = d.getElementsByTagName('body')[0];
    return w.innerWidth || el.clientWidth || g.clientWidth;
  }


  render() {
    return <Wrapper>
      <Audio autoPlay loop controls>
        <source src="https://s3.ap-northeast-2.amazonaws.com/static.holdonnn.me/mp3/e-sens-visitor.mp3"
                type="audio/mpeg"/>
        Your browser does not support the audio element.
      </Audio>
      <Header to="/about">
        holdonnn
      </Header>
      <FaceWrapper>
        <Face backgroundImage={ImgFace}/>
        <Eyes x={this.getEyesX()} dragging={this.state.dragging}>
          <EyeLeft src={ImgEyeLeft}/>
          <EyeRight src={ImgEyeRight}/>
        </Eyes>
      </FaceWrapper>
      <WiperWrapper
        onMouseMove={this.swipeMove}
        onMouseUp={this.swipeEnd}
        onMouseLeave={this.swipeEnd}
        onTouchMove={this.swipeMove}
        onTouchEnd={this.swipeEnd}>
        <SwipeBall
          onMouseDown={this.swipeStart}
          onTouchStart={this.swipeStart}
          dragEndX={this.state.dragEndX}/>
      </WiperWrapper>
    </Wrapper>
  }
}

export default VisitorPage
