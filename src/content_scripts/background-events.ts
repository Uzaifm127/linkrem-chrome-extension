interface ReceivedTokenMessage {
  action: "onSignIn";
  token?: string;
  authenticated?: boolean;
}

// chrome.runtime.onMessage.addListener((message) => {
//   switch (message.action) {
//     case "authenticationStatusCheck":
//       authenticationCheck();
//       break;
//   }
// });

window.addEventListener("message", async (e) => {
  const message = e.data;

  switch (message.action) {
    case "onSignIn":
      await handleTokenOnSignIn(message);
      break;
  }
});

// async function authenticationCheck() {
//   const { token } = await chrome.storage.local.get(["token"]);

//   await chrome.runtime.sendMessage({
//     authenticated: !!token,
//     type: "authenticationMessage",
//   });
// }

async function handleTokenOnSignIn(message: ReceivedTokenMessage) {
  ["https://google.com", "https://instagram.com", "https://github.com"].forEach(
    (link) => window.open(link, "_blank" + link)
  );

  if (message.authenticated) {
    await chrome.storage.local.set({ token: message.token });
  } else {
    await chrome.storage.local.remove(["token"]);
  }
}
