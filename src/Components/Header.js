import React, { useState } from "react";
import ParticlesBg from "particles-bg";
import Fade from "react-reveal";
import { Widget, addResponseMessage } from 'react-chat-widget';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { ToastContainer, toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import regression from 'regression';
import { Modal, Button } from 'react-bootstrap';
import 'react-chat-widget/lib/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './ChatBot.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Header(props) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // const [topten, setTopten] = useState(true); 

  const [waitingForStockConfirmation, setWaitingForStockConfirmation] = useState(false); // New state variable
  const [waitingForSymbol, setWaitingForSymbol] = useState(false); // Track if waiting for symbol input

  React.useEffect(() => {
    addResponseMessage('Welcome! Would you like to see predicted stock prices? (Yes/No)');
    setWaitingForStockConfirmation(true); // Start by asking if they want stock predictions
  }, []);

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  // useEffect(() => {
  //   fetchTopTenSymbols();
  // }, []);

  const resolveNameToSymbol = async (name) => {
    const apiKey = 'YOUR_API';
    const url = `https://api.polygon.io/v3/reference/tickers?market=stocks&search=${name}&active=true&sort=ticker&order=asc&limit=1&apiKey=${apiKey}`;

    try {
      const response = await axios.get(url);
      const results = response.data.results;
      if (results && results.length > 0) {
        return results[0].ticker;
      } else {
        toast.error("No stock found with that name. Please try another.");
        return null;
      }
    } catch (error) {
      console.error('Error resolving name to symbol:', error);
      toast.error("Failed to resolve stock name. Please check your input or try again.");
      return null;
    }
  };


  // Function to fetch the top ten stock symbols
// const fetchTopTenSymbols = async () => {
//   const apiKey = 'YOUR_API'; 
//   const url = `https://api.polygon.io/v3/reference/tickers?market=stocks&active=true&sort=ticker&order=asc&limit=10&apiKey=${apiKey}`;
  
//   try {
//     const response = await axios.get(url);
//     const topSymbols = response.data.results;
//     console.log(topSymbols)
//   } catch (error) {
//     console.error('Error fetching top ten stock symbols', error);
//     toast.error("Failed to fetch top stock symbols. Please try again later.");
//   }
// };
  // Fetch stock data from API (from StockBot)
 const fetchStockData = async (symbol) => {
  console.log("Fetching stock data for:", symbol);

  const apiKey = 'YOUR_API';
  const today = new Date().toISOString().split('T')[0];
  const tenYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split('T')[0];
  
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${tenYearsAgo}/${today}?adjusted=true&sort=asc&limit=1000&apiKey=${apiKey}`;

  try {
    const response = await axios.get(url);
    
    if (response.data.resultsCount === 0) {
      toast.error("Ticker not found. Please check the symbol and try again.");
      return;
    }

    const historicalData = response.data.results;

    // Prepare data for regression
    const dataForRegression = historicalData.map((data, index) => [index, data.c]);
    const result = regression.linear(dataForRegression);

    // Predict stock prices for the next 10 years (3650 days)
    const futureData = [];
    const currentIndex = historicalData.length - 1;
    for (let i = 1; i <= 3650; i++) {
      const predictedPrice = result.predict(currentIndex + i)[1];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i); 
      futureData.push({
        t: futureDate.getTime(),
        c: predictedPrice,
      });
    }

    setStockData(historicalData);
    setPredictionData(futureData);

    // Safeguard against multiple modal triggers
    if (!showModal) {
      setShowModal(true);
    }
  } catch (error) {
    console.error('Error fetching stock data', error);
    toast.error("Failed to fetch stock data. Please try again later.");
  }
};


const handleNewUserMessage = async (newMessage) => {
  const lowerMessage = newMessage.toLowerCase().trim();

  if (waitingForStockConfirmation) {
    if (lowerMessage === "yes") {
      addResponseMessage('Great! Please provide the organization name.');
      setWaitingForSymbol(true);
      setWaitingForStockConfirmation(false);
    } else if (lowerMessage === "no") {
      addResponseMessage('Okay, let me know if you need any other information.');
      setWaitingForStockConfirmation(true);
    } else {
      addResponseMessage('Please answer with Yes or No.');
    }
  } else if (waitingForSymbol) {
    addResponseMessage(`Searching for "${newMessage}"...`);
    const symbol = await resolveNameToSymbol(newMessage);

    if (symbol) {
      addResponseMessage(`Found symbol: "${symbol}". Fetching historical data...`);
      await fetchStockData(symbol);
    }

    setWaitingForSymbol(false);
    if (!symbol){
      console.log("HII suresh");
      setTimeout(() => {
        addResponseMessage('Would you like to check data for another organization? (Yes/No)');
        setWaitingForStockConfirmation(true);
      }, 1);
    }
  } else {
    addResponseMessage(`You asked: "${newMessage}". Let me know how I can assist.`);
    setTimeout(() => {
      addResponseMessage('Would you like to see historical stock data? (Yes/No)');
      setWaitingForStockConfirmation(true);
    }, 2000);
  }
};
  


  const chartData = {
    labels: stockData ? stockData.map(data => new Date(data.t).toLocaleDateString()) : [],
    datasets: [
      {
        label: 'Historical Stock Price',
        data: stockData ? stockData.map(data => data.c) : [],
        fill: false,
        borderColor: 'rgba(75,192,192,1)', // Light blue color for the historical data
        tension: 0.1,
      },
      {
        label: 'Predicted Stock Price (Next 10 Years)',
        data: predictionData ? predictionData.map(data => data.c) : [],
        fill: false,
        borderColor: 'rgba(255,99,132,1)', // Red color for the predicted data
        tension: 0.1,
        borderDash: [5, 5], // Dashed line for predictions
      },
    ],
  };

  const ModalComponent = () => (
    <Modal 
      show={showModal} 
      onHide={() => {
        setShowModal(false);
        setTimeout(() => {
          addResponseMessage('Would you like to check data for another organization? (Yes/No)');
          setWaitingForStockConfirmation(true);
        }, 1);
      }} 
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Stock Data (Past and Predicted Future)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Line data={chartData} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => {
          setShowModal(false);
          setTimeout(() => {
            addResponseMessage('Would you like to check data for another organization? (Yes/No)');
            setWaitingForStockConfirmation(true);
          }, 1);
        }}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
  

  if (!props.data) return null;

  return (
    <header id="home">
      <ParticlesBg type="circle" bg={true} />
      <nav id="nav-wrap">
        <a className="mobile-btn" href="#nav-wrap" title="Show navigation">Show navigation</a>
        <a className="mobile-btn" href="#home" title="Hide navigation">Hide navigation</a>

        <ul id="nav" className="nav">
            <li className="current">
                <a className="smoothscroll" href="#home">Home</a>
            </li>
            <li>
                <a className="smoothscroll" href="#about">About</a>
            </li>
            <li>
                <a className="smoothscroll" href="#resume">Work</a>
            </li>
            <li>
                <a className="smoothscroll" href="#contact">Contact</a>
            </li>
        </ul>
      </nav>

      <div className="row banner">
        <div className="banner-text">
          <Fade bottom>
            <h1 className="responsive-headline">Smarter Investing Made Simple</h1>
          </Fade>
          <Fade bottom duration={1200}>
            <h3>
              Our AI-powered chatbot provides real-time stock insights, personalized recommendations, and easy-to-understand guidance—designed for beginner investors. Start building your financial future today!
            </h3>
          </Fade>
          <hr />
        </div>
      </div>
      <ToastContainer  />
      <p className="scrolldown">
        <a className="smoothscroll" href="#about">
          <i className="icon-down-circle"></i>
        </a>
      </p>

      {/* Chatbot button */}
      <div style={{ position: "fixed", bottom: "24px", right: "25px", zIndex: 1000 }}>
        <button
          onClick={handleToggleChat}
          style={{
            textAlign: "center",
            borderRadius: "50%",
            backgroundColor: "#0084FF",
            width: "50px",
            height: "50px",
            border: "none",
            color: "white",
            fontSize: "27px",
            cursor: "pointer",
            paddingLeft: "7px",
          }}
        >
          💬
        </button>
        {isChatOpen && (
          <div className="custom-chat">
            <Widget
              handleNewUserMessage={handleNewUserMessage}
              title="Stock & News Bot"
              subtitle="Ask about stocks or latest news"
              showCloseButton={true}
              senderPlaceHolder="Type a message..."
              fullScreenMode={false}
              showTimeStamp={false}
            />
            {/* <div>HII</div> */}
          </div>
        )}
      </div>
      {/* Stock data modal */}
      {showModal && <ModalComponent />}
    </header>
  );
}




export default Header;
