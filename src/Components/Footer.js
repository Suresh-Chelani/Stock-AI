import React, { Component } from "react";
import Fade from "react-reveal";

class Footer extends Component {
  render() {
    if (!this.props.data) return null;

    const networks = this.props.data.social.map(function (network) {
      return (
        <li key={network.name}>
          <a href={network.url}>
            <i className={network.className}></i>
          </a>
        </li>
      );
    });

    return (
      <footer>
        <div className="row" style={{marginLeft:'13vw', textAlign:'center'}}>
          <div>
            <p style={{}}>
            <strong>WealthWiseAI</strong> is a cutting-edge financial chatbot founded by <strong>Shubham Sharma</strong>, designed to empower beginner investors with real-time stock predictions and insights. Leveraging the power of AI, WealthWiseAI simplifies stock market data, helping users make informed investment decisions by predicting future stock prices. Whether you're new to investing or looking for an easy way to understand market trends, WealthWiseAI is your go-to tool for smarter financial choices.
            </p>
          </div>
          <Fade bottom>
            <div className="twelve columns">
              <ul className="social-links">{networks}</ul>

              <ul className="copyright">
                <li>&copy; Copyright 2024 Shubham Sharma</li>
                <li>
                  Design by{" "}
                  <a title="Styleshout" href="https://www.linkedin.com/in/suresh-chelani-a34b6a248/">
                    me
                  </a>
                </li>
              </ul>
            </div>
          </Fade>
        </div>
      </footer>
    );
  }
}

export default Footer;
