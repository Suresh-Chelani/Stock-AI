import React, { Component } from "react";
import ReactGA from "react-ga";
import $ from "jquery";
import "./App.css";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import About from "./Components/About";
import Work from "./Components/Work";
import Contact from "./Components/Contact";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      foo: "bar",
      Data: {}
    };

    ReactGA.initialize("UA-110570651-1");
    ReactGA.pageview(window.location.pathname);
  }

  getData() {
    $.ajax({
      url: "./Data.json",
      dataType: "json",
      cache: false,
      success: function(data) {
        this.setState({ Data: data });
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(err);
        alert(err);
      }
    });
  }

  componentDidMount() {
    this.getData();
  }

  render() {
    return (
      <div className="App">
        <Header data={this.state.Data.main} />
        <About data={this.state.Data.main} />
        <Work data={this.state.Data.resume} />
        <Contact data={this.state.Data.main} />
        <Footer data={this.state.Data.main} /> 
      </div>
    );
  }
}

export default App;
