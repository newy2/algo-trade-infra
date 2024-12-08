import http from "http";
import https from "https";

export async function retryCall({ retryCount, delay, func }) {
  for (let i = 0; i < retryCount; i++) {
    try {
      if (await func()) {
        return true;
      }
    } catch (e) {
      console.error("[retryCall] error: ", e);
    }

    await sleep(delay);
  }
  return false;
}

export function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function validate(list) {
  list.forEach(each => {
    if (each.expected !== each.actual) {
      throw new Error(`[validate][${each.key}] expected(${each.expected})와 actual(${each.actual})이 다릅니다.`);
    }
  });
}

export class ApiHelper {
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
    return url.startsWith("http://") ? http : https;
  }
}