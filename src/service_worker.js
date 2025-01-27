// chrome.runtime.onMessage.addListener(async (message) => {
//   if (message.action === "onSignIn") {
//     const token = await chrome.storage.local.get(["token"]);

//     console.log(token);

//     const queryOptions = { active: true, currentWindow: true };

//     const signInMessage = {
//       action: "onSignInServiceWorkerResponse",
//       authenticated: true,
//     };

//     const [tab] = await chrome.tabs.query(queryOptions);

//     console.log(tab);

//     if (tab?.id) {
//       // await chrome.tabs.sendMessage(tab.id, signInMessage);
//     }
//   }
// });
