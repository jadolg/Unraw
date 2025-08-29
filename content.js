function createUnrawButton() {
  if (document.getElementById('unraw-button')) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'unraw-button';
  button.textContent = 'View on GitHub';
  button.style.position = 'fixed';
  button.style.top = '10px';
  button.style.right = '10px';
  button.style.zIndex = '9999';
  button.style.backgroundColor = '#24292f';
  button.style.color = 'white';
  button.style.border = '1px solid #57606a';
  button.style.padding = '8px 12px';
  button.style.borderRadius = '6px';
  button.style.cursor = 'pointer';
  button.style.fontSize = '14px';

  button.onmouseover = function() {
    this.style.backgroundColor = '#57606a';
  };
  button.onmouseout = function() {
    this.style.backgroundColor = '#24292f';
  };


  button.onclick = function() {
    const rawUrl = window.location.href;
    const regex = /https:\/\/raw.githubusercontent.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.*)/;
    const match = rawUrl.match(regex);

    if (match && match.length === 5) {
      const user = match[1];
      const repo = match[2];
      const branch = match[3];
      const filePath = match[4];
      const newUrl = `https://github.com/${user}/${repo}/blob/${branch}/${filePath}`;
      window.location.href = newUrl;
    } else {
      console.error("Could not parse raw GitHub URL.");
    }
  };

  document.body.appendChild(button);
}

createUnrawButton();
