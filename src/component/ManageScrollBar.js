import React from 'react';

class ScrollBar extends React.Component {
    render() {
        const {width, height} = this.props;
        return (
            <div className="scrollbar"
                 style={{
                     position: 'fixed',
                     top: 0,
                     left: 0,
                     right: 0,
                     backgroundColor: '#ced4da',
                     borderBottom: 'solid 1px #868e96',
                     height,
                 }}
            >
                <div
                    className="scrollbar"
                    id="hoge" style={{
                    width: `${width}%`,
                    transition: 'width 0.5s',
                    height,
                    backgroundColor: "#495057"
                }}/>
            </div>
        );
    }
}


ScrollBar.defaultProps = {
    height: 10,
    width: 0
};


class ManageScrollBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: 0,
            scrollBarRate: 0
        };
        this.ScrollRateCalculation = this.ScrollRateCalculation.bind(this);
    }

    ScrollRateCalculation() {
        let innerHeight = window.innerHeight; //A
        let bodyElement = document.getElementById('___gatsby');//B1
        let rect = bodyElement.getBoundingClientRect();//B2
        let heightIsHtml = rect.height; //B3
        let scrollMax = Math.ceil(heightIsHtml - innerHeight); //C = B3 - A
        let scrollY = document.documentElement.scrollTop || document.body.scrollTop;//D
        let scrollRate = parseInt((scrollY / scrollMax) * 100, 10); //E = (D / C) *100
        this.setState({
            scrollY: scrollY,
            scrollBarRate: scrollRate
        });
    }

    componentDidMount() {
        this.ScrollRateCalculation();

        document.addEventListener('scroll', this.ScrollRateCalculation);
        window.addEventListener('hashchange', this.ScrollRateCalculation);
        document.addEventListener('click', this.ScrollRateCalculation);
    }

    render() {
        if (this.state.scrollBarRate === 0) {
            return null;
        }
        return (
            <ScrollBar className="scrollbar" width={this.state.scrollBarRate}/>
        )
    }
}

export default ManageScrollBar;