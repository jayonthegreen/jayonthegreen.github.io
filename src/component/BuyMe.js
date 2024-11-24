import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  text-align: center;
`
export class BuyMe extends React.Component {
  render() {
    return (
      <Wrapper>
        <a href="https://www.buymeacoffee.com/jaehyunbaekblog" target="_blank">
          <img
            src="https://www.buymeacoffee.com/assets/img/custom_images/black_img.png"
            alt="Buy Me A Coffee"
          />
        </a>
      </Wrapper>
    )
  }
}

export default BuyMe
