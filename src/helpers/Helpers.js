
/*
 * Tiniru Doc
 * Version 0.1, 2019
 * 
 * @website - https://tiniru.com
 * 
 */

export function toUrl(url) {
    return encodeURI(url.replace(/ /g, '-').replace(/[^\w.-]+/g,'').toLowerCase());
}
export function postData(url,data={}){
    // Default options are marked with *
      return fetch(url, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          //mode: "cors", // no-cors, cors, *same-origin
          //cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          //credentials: "same-origin", // include, *same-origin, omit
          //headers: {
          //    "Content-Type": "application/json",
              // "Content-Type": "application/x-www-form-urlencoded",
          //},
          //redirect: "follow", // manual, *follow, error
          referrer: "no-referrer", // no-referrer, *client
          body: JSON.stringify(data), // body data type must match "Content-Type" header
      })
      .then(response => response.json()); // parses response to JSON
  }

export function generateId() {
    let now = new Date();
    let timestamp = now.getFullYear().toString();
    let month = now.getMonth() + 1;
    timestamp += (month < 10 ? '0' : '') + month.toString();
    timestamp += (now.getDate() < 10 ? '0' : '') + now.getDate().toString();
    timestamp += (now.getHours() < 10 ? '0' : '') + now.getHours().toString();
    timestamp += (now.getMinutes() < 10 ? '0' : '') + now.getMinutes().toString();
    timestamp += (now.getSeconds() < 10 ? '0' : '') + now.getSeconds().toString();
    timestamp += (now.getMilliseconds() < 100 ? '0' : '') + now.getMilliseconds().toString();
    return timestamp;
}
