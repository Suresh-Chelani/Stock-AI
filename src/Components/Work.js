import React, { Component } from "react";
import Slide from "react-reveal";

class Work extends Component {


  render() {
    if (!this.props.data) return null;

    const work = this.props.data.work.map(function (work) {
      return (
        <div key={work.company}>
          <h3>{work.company}</h3>
          <p className="info">
            {work.title}
            <span>&bull;</span> <em className="date">{work.years}</em>
          </p>
          <p>{work.description}</p>
        </div>
      );
    });

  
    return (
      <section id="resume">
        <Slide left duration={1300}>
          <div className="row work" style={{marginLeft:'13vw'}}>
            <div className="three columns header-col">
              <h1>
                <span>Work</span>
              </h1>
            </div>

            <div className="nine columns main-col">{work}</div>
          </div>
        </Slide>
      </section>
    );
  }
}

export default Work;
