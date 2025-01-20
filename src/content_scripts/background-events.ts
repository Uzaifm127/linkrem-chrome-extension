interface ReceivedMessage {
  action: "onSignIn";
  token?: string;
  authenticated?: boolean;
}

window.addEventListener("message", async (e) => {
  const message = e.data;

  switch (message.action) {
    case "onSignIn":
      onSignInAuthenticationCheck(message);
      break;
  }
});

async function onSignInAuthenticationCheck(message: ReceivedMessage) {
  const { token } = await chrome.storage.local.get(["token"]);

  if (token) {
    await chrome.runtime.sendMessage({
      type: "authenticationMessage",
      authenticated: true,
    });
    return;
  }

  if (message.authenticated) {
    await chrome.storage.local.set({ token: message.token });
  }

  await chrome.runtime.sendMessage({
    type: "authenticationMessage",
    authenticated: message.authenticated,
  });
}
