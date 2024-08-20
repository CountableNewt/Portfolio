function copyToClipboard(link) {
  navigator.clipboard.writeText(link).then(() => {
    setTimeout(() => {
      console.log("Copied!")
      alert("Copied!")
    }, 200);
  }).catch(err => {
    console.error("Could not copy text: ", err)
  })
}
