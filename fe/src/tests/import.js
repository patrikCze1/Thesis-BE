import axios from "axios";

const func = async () => {
  const run = async (data, i) => {
    const offset = 0;
    const limit = 100;
    const returnActive = true;
    const returnTracks = true;
    //   data.username = `${i}u`;
    //   data.email = `${i}a@a.com`;
    //   await axios.post(`http://localhost:8080/api/users`, data, {
    await axios.get(
      `http://localhost:8080/api/tracks/me?offset=${offset}&limit=${limit}&returnActive=${returnActive}&returnTracks=${returnTracks}`,
      {
        // await axios.post(`http://localhost:8080/api/tracks/`, data, {
        withCredentials: true,
        headers: {
          Cookie:
            "Auth-Token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo2LCJ1c2VybmFtZSI6InRlc3RlciIsInBhc3N3b3JkIjoiJDJiJDEwJExVS0lTOG5DTXNSYjRvS1ZxYTVSUi53M3JaVVVyNy5KWjByWmFYaVpPRXUwcjdGN3Y2QWt1IiwiZW1haWwiOiJwYXRyaWsudGlwZWtAZW1haWwuY3oiLCJwaG9uZSI6Iis0MjA3MzQyMzI5MjIiLCJmaXJzdE5hbWUiOiJUZXN0IiwibGFzdE5hbWUiOiLFoHTDrXBlayIsInBvc2l0aW9uIjoidGVzdGVyIiwic2V4IjoiTSIsInJvbGVzIjpbImFkbWluIl0sInBhc3N3b3JkUmVzZXRIYXNoIjpudWxsLCJhbGxvd0VtYWlsTm90aWZpY2F0aW9uIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDIyLTA0LTA3VDE1OjAzOjUxLjAwMFoiLCJ1cGRhdGVkQXQiOiIyMDIyLTA1LTA0VDExOjQzOjU0LjAwMFoiLCJkZWFjdGl2YXRlZCI6ZmFsc2UsImRlbGV0ZWRBdCI6bnVsbH0sImlhdCI6MTY1MTY5NjExNCwiZXhwIjoxNjUxNzEwNTE0fQ.CGzM5yfoQuU6YSwnU5LK46PocZWOIi_MiaznzfXuFwY; XSRF-TOKEN=YtrNWK5q-fOmD4EsqQLfCsWQNNi0quBJwq38",
        },
      }
    );
  };

  const data = {
    // firstName: "test",
    // lastName: "test",
    // password: "1234",
    // roles: ["user"],
    beginAt: new Date(),
    endAt: new Date(),
  };

  console.time();
  for (let i = 0; i < 1; ++i) {
    await run(data, i);
  }

  //await axios.get(`/api/users${params}`);

  console.timeEnd();
};

func();
