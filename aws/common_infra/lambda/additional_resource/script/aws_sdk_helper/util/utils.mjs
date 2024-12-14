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