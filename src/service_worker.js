chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "forwardMessage") {
    console.log("console in service worker");
  }
});
