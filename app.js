const folderButton = document.getElementById('open-folder');

if (folderButton) {
  folderButton.addEventListener('click', () => {
    alert(
      'To open your local project, serve this Sorcerer folder with a static server and keep it beside your game project.'
    );
  });
}
