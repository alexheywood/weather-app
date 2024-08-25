import { useState, useEffect, useRef } from "react";
import { IoLocationSharp } from "react-icons/io5";
import Forecast from "./Forecast";
import GridLoader from "react-spinners/GridLoader";
import { postcodeValidator } from "postcode-validator";

function App() {
  const [bgColour, setBgColour] = useState("#1F2041");
  const [currentTemp, setCurrentTemp] = useState("");
  const [icon, setIcon] = useState("");
  const [textCondition, setTextCondition] = useState("");
  const [location, setLocation] = useState("EC2V 8AF");
  const [forecast, setForecast] = useState({});
  const [wind, setWind] = useState(0);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const postcodeInput = useRef();

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDeviceLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      const GPSLocation =
        navigator.geolocation.getCurrentPosition(setGPSLocation);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  async function getPostcode(lat, lon) {
    const response = await fetch(
      `https://api.postcodes.io/postcodes?lon=${lon}&lat=${lat}`
    );
    const data = await response.json();
    if (data.status === 200 && data.result.length > 0) {
      return data.result[0].postcode;
    } else {
      throw new Error("Postcode not found");
    }
  }

  async function setGPSLocation(location) {
    const lat = location.coords.latitude;
    const lon = location.coords.longitude;
    getPostcode(lat, lon).then((item) => {
      setLocation(item);
      setLoading(false);
    });
  }

  const updateLocation = () => {
    if (!postcodeInput.current.value) {
      setEdit(false);
      return;
    }

    if (postcodeValidator(postcodeInput.current.value, "GB")) {
      setLoading(true);
      setLocation(postcodeInput.current.value.trim());
      setEdit(false);
    } else {
      alert("Please input a valid UK postcode.");
      postcodeInput.current.style.color = "red";
    }
  };

  async function getForecast() {
    const url = `https://api.weatherapi.com/v1/forecast.json?q=${location}&days=5&key=${
      import.meta.env.VITE_API_KEY
    }`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      const iconUrl = json.current.condition.icon;
      const newIconUrl = iconUrl.replace("64x64", "128x128");
      setIcon("http:" + newIconUrl);
      setTextCondition(json.current.condition.text);
      setLocation(json.location.name + ", " + json.location.country);
      setCurrentTemp(Math.floor(json.current.temp_c) + "°");
      setForecast(json.forecast.forecastday);
      setWind(json.current.wind_mph);

      if (json.current.is_day) {
        setBgColour("#1AA7EC");
      } else {
        setBgColour("#1F2041");
      }

      setLoading(false);
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    getForecast();
  }, [location]);

  return (
    <>
      <main>
        <div
          className="vh-100"
          style={{
            backgroundColor: bgColour,
          }}
        >
          {loading ? (
            <>
              <div className="text-center"></div>

              <div className="d-flex justify-content-center align-items-center vh-100">
                <GridLoader
                  className="align-items-center"
                  color="white"
                  size="30px"
                  speedMultiplier={0.3}
                />
              </div>
            </>
          ) : (
            <>
              <div className="container pt-3 px-3 text-secondary d-flex justify-content-between fs-3s">
                <button onClick={getDeviceLocation} className="btn btn-outline">
                  <IoLocationSharp color="white" size={30} />
                </button>

                {edit ? <div className="container text-center"></div> : null}

                {!edit ? (
                  <button
                    className="btn btn-outline-light"
                    onClick={() => {
                      setEdit(true);
                    }}
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <input
                      ref={postcodeInput}
                      placeholder="Enter postcode"
                      className="mx-2 p-2 bg-none rounded"
                      type="text"
                      style={{ backgroundColor: "white" }}
                    ></input>
                    <button
                      className="p-2 btn btn-outline-light"
                      onClick={() => {
                        updateLocation();
                      }}
                    >
                      Save
                    </button>
                  </>
                )}
              </div>

              <div className="mb-5 container text-center align-middle">
                <img src={icon} width="50%" style={{ maxWidth: "300px" }} />
                <div className="row mt-2 text-white">
                  <div className="col bg-white rounded bg-opacity-25">
                    <h1 className="font-bold" style={{ fontSize: "90px" }}>
                      {currentTemp}
                    </h1>
                  </div>
                  <div className="col mt-4">
                    <h2>{location}</h2>
                    <h2>{textCondition}</h2>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col text-white text-xl">
                    <div className="col" style={{ fontSize: "20px" }}>
                      <p>Wind: {wind} mph</p>
                      <p></p>
                    </div>
                  </div>
                  <div className="col"></div>
                </div>
              </div>

              <div className="text-white text-center fs-1">
                <div className="container font-bold">
                  {!forecast.length > 0 ? (
                    <p>Loading...</p>
                  ) : (
                    forecast.map((item) => {
                      const date = new Date(item.date);
                      const day = days[date.getDay()];
                      return (
                        <Forecast
                          key={day}
                          day={day}
                          icon={item.day.condition.icon}
                          temp={item.day.avgtemp_c}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default App;
