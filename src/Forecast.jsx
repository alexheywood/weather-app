import React from "react";

export default function Forecast(props) {
  const day = props.day;
  const temp = props.temp;
  const icon = props.icon;

  return (
    <div key={day} className="row rounded mx-2 text-white my-2">
      <div className="col">
        <p>{day ? day : "--"}</p>
      </div>
      <div className="col">
        {temp ? Math.floor(temp) : "--"}°
        <img src={"http:" + icon} width="20%" />
      </div>
    </div>
  );
}
