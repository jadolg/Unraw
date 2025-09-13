function parseRawGitHubUrl(rawUrl) {
  const regex = /https:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.*)/;
  const match = rawUrl.match(regex);

  if (!match || match.length !== 5) {
    return null;
  }

  const [, user, repo, branch, filePath] = match;
  return {
    user,
    repo,
    branch,
    filePath,
    githubUrl: `https://github.com/${user}/${repo}/blob/${branch}/${filePath}`
  };
}

function getButtonStyles() {
  return {
    position: 'fixed',
    top: '10px',
    right: '10px',
    zIndex: '9999',
    backgroundColor: '#24292f',
    color: 'white',
    border: '1px solid #57606a',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  };
}

function applyStylesToButton(button, styles) {
  Object.assign(button.style, styles);
}

function createButton(config = {}) {
  const button = document.createElement('button');
  button.id = config.id || 'unraw-button';
  button.textContent = config.text || 'View on GitHub';
  
  const styles = config.styles || getButtonStyles();
  applyStylesToButton(button, styles);

  return button;
}

function addHoverEffects(button) {
  button.onmouseover = function() {
    this.style.backgroundColor = '#57606a';
  };
  button.onmouseout = function() {
    this.style.backgroundColor = '#24292f';
  };
}

function handleButtonClick() {
  const rawUrl = window.location.href;
  const urlData = parseRawGitHubUrl(rawUrl);

  if (urlData) {
    window.location.href = urlData.githubUrl;
  } else {
    console.error("Could not parse raw GitHub URL.");
  }
}

function createUnrawButton() {
  if (document.getElementById('unraw-button')) {
    return;
  }

  const button = createButton();
  addHoverEffects(button);
  button.onclick = handleButtonClick;

  document.body.appendChild(button);
}

createUnrawButton();
