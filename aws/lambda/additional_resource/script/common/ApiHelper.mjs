import https from "https";
import http from "http";

export default class ApiHelper {
  call({ url, body, ...options }) {
    return new Promise((resolve, reject) => {
      const req = this.getClient(url).request(url, {
        ...options
      }, res => {
        const chunks = [];

        res.on("data", data => chunks.push(data));
        res.on("end", () => {
          const resBody = Buffer.concat(chunks);
          switch (res.headers["content-type"]) {
            case "application/json":
              res.body = JSON.parse(resBody);
              break;
            default:
              res.body = resBody.toString();
              break;
          }
          resolve(res);
        });
      });

      req.on("error", reject);
      if (body) {
        req.write(body);
      }
      req.end();
    });
  }

  getClient(url) {
    return url.startsWith("https://") ? https : http;
  }
}