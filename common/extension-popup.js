const setEmojiSize = async (size) => {
  console.log(`setting stored size to: ${size}`);

  await browser.storage.local.set({ size });

  browser.storage.local
    .get("size")
    .then((result) => console.log(`saved size as: ${result.size}`));
};

const setRadioChecked = (radioId) => {
  const radio = document.getElementById(radioId);
  radio.checked = true;
};

const addEmojiSizeRadioEventListeners = () => {
  console.log("add event listeners");
  const sizeInputs = document.querySelectorAll('input[name="size"]');

  sizeInputs.forEach((sizeInput) =>
    sizeInput.addEventListener("change", (e) => {
      console.log("value of event is: " + e.target.value);
      setEmojiSize(e.target.value);
    })
  );
};

const init = async () => {
  const defaultSize = "beeeg-E-smolz";
  const { size: storedSize } = await browser.storage.local.get("size");
  const size = storedSize || defaultSize;

  console.log(`stored size: ${storedSize}`);

  setEmojiSize(size);
  setRadioChecked(size);
};

addEmojiSizeRadioEventListeners();
init().catch(console.error);
