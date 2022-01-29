import React, { useEffect, useState } from "react";
import i18n from "../../../i18n";
import { getDeltaTime } from "../../service/date/date.service";

export default function DeltaTimer({ start }) {
  const [time, setTime] = useState(getDeltaTime(start));

  useEffect(() => {
    const timer = setInterval(() => {
      const deltaTime = getDeltaTime(start);
      setTime(deltaTime);

      if (start) document.title = deltaTime + " | " + i18n.t("app.title");
      else document.title = i18n.t("app.title");
    }, 1000);

    return () => clearInterval(timer);
  }, [start]);

  return <>{time}</>;
}
