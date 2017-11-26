import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
   background-color: green;
   display: flex;
   flex-direction: column;
   height: 100vh;
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

  componentDidMount() {

  }


  render () {
    return <Wrapper>
      VisitorPage
      <WiperWrapper>
        <SwipeBall/>
      </WiperWrapper>
      <audio autoPlay loop>
        <source src="https://s3.ap-northeast-2.amazonaws.com/static.holdonnn.me/mp3/e-sens-visitor.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </Wrapper>
  }
}

export default VisitorPage
