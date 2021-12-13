import React, { useEffect, useState } from "react";
import { getDeltaTime } from "../../service/date/date.service";

export default function DeltaTimer({ start }) {
  const [time, setTime] = useState(getDeltaTime(start));

  useEffect(() => {
    const timer = setInterval(() => {
      const deltaTime = getDeltaTime(start);
      setTime(deltaTime);

      if (start) document.title = deltaTime + " | React app";
      else document.title = "React app";
    }, 1000);

    return () => clearInterval(timer);
  }, [start]);

  return <>{time}</>;
}
