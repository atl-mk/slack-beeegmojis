const linkToInjectedStyles = document.createElement("link");
linkToInjectedStyles.id = "slack-beeegmoji-styles";
linkToInjectedStyles.rel = "stylesheet";
linkToInjectedStyles.type = "text/css";
document.head.appendChild(linkToInjectedStyles);

const updateStyle = (size) => {
  console.log(`applying style: ${size}`);

  const smolStylesUrl = chrome.runtime.getURL("/slack-smolbois.css");
  const beeegEsmolzStylesUrl = chrome.runtime.getURL(
    "/slack-beeeg-E-smolz.css"
  );
  const beeegStylesUrl = chrome.runtime.getURL("/slack-beeegmojis.css");

  switch (size) {
    case "smolbois":
      linkToInjectedStyles.href = smolStylesUrl;
      break;
    case "beeegmojis":
      linkToInjectedStyles.href = beeegStylesUrl;
      break;
    case "beeeg-E-smolz":
    default:
      linkToInjectedStyles.href = beeegEsmolzStylesUrl;
      break;
  }
};

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "size" in changes) {
    updateStyle(changes.size.newValue);
  }
});

browser.storage.local.get("size").then((result) => updateStyle(result.size));

console.log("loading");
