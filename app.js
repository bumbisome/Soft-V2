// app.js

// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', function() {

  // Positions List
  const positions = [
    'Pitcher', 'Catcher', 'First Base', 'Second Base', 'Third Base',
    'Shortstop', 'Left Field', 'Center Field', 'Right Field'
  ];

  // Position Coordinates for Field Diagram
  const positionCoordinates = {
    'Pitcher': { top: '45%', left: '50%' },
    'Catcher': { top: '60%', left: '50%' },
    'First Base': { top: '50%', left: '80%' },
    'Second Base': { top: '30%', left: '60%' },
    'Third Base': { top: '50%', left: '20%' },
    'Shortstop': { top: '30%', left: '40%' },
    'Left Field': { top: '10%', left: '20%' },
    'Center Field': { top: '5%', left: '50%' },
    'Right Field': { top: '10%', left: '80%' },
  };

  // Function to load players from LocalStorage
  function loadPlayers() {
    return JSON.parse(localStorage.getItem('players')) || [];
  }

  // Function to save players to LocalStorage
  function savePlayers(players) {
    localStorage.setItem('players', JSON.stringify(players));
  }

  // Function to display players in the list with position selection and remove button
  function displayPlayers() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    let players = loadPlayers();

    players.forEach((player, index) => {
      const li = document.createElement('li');

      const nameSpan = document.createElement('span');
      nameSpan.textContent = player.name;

      // Position Select Dropdown
      const positionSelect = document.createElement('select');
      positionSelect.innerHTML = `<option value="">Select Position</option>` + positions
        .map(pos => `<option value="${pos}" ${player.position === pos ? 'selected' : ''}>${pos}</option>`)
        .join('');
      positionSelect.addEventListener('change', function () {
        players[index].position = this.value;
        savePlayers(players);
        displayFieldDiagram();
      });

      // Remove Button
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.classList.add('remove-button');
      removeButton.addEventListener('click', function () {
        if (confirm(`Are you sure you want to remove ${player.name}?`)) {
          // Remove player from the array
          players.splice(index, 1);
          savePlayers(players);
          // Update displays
          displayPlayers();
          displayLineup();
          displayFieldDiagram();
        }
      });

      // Append elements to the list item
      li.appendChild(nameSpan);
      li.appendChild(positionSelect);
      li.appendChild(removeButton);
      playerList.appendChild(li);
    });
  }

  // Function to display the batting lineup
  function displayLineup() {
    const battingLineup = document.getElementById('battingLineup');
    battingLineup.innerHTML = '';
    const players = loadPlayers();

    players.forEach(player => {
      const li = document.createElement('li');
      li.textContent = player.name;
      battingLineup.appendChild(li);
    });
  }

  // Initialize Sortable for batting lineup
  const sortable = Sortable.create(document.getElementById('battingLineup'), {
    animation: 150,
  });

  // Save the new batting lineup order
  document.getElementById('saveLineup').addEventListener('click', function () {
    const newOrder = [];
    const players = loadPlayers();
    const namesInOrder = Array.from(document.getElementById('battingLineup').children).map(li => li.textContent);

    namesInOrder.forEach(name => {
      const player = players.find(p => p.name === name);
      if (player) newOrder.push(player);
    });

    savePlayers(newOrder);
    displayPlayers();
    displayFieldDiagram();
  });

  // Function to display the field diagram
  function displayFieldDiagram() {
    const fieldDiagram = document.getElementById('fieldDiagram');
    fieldDiagram.innerHTML = '';
    const players = loadPlayers();

    players.forEach(player => {
      if (player.position && positionCoordinates[player.position]) {
        const pos = positionCoordinates[player.position];
        const label = document.createElement('div');
        label.classList.add('position-label');
        label.style.top = pos.top;
        label.style.left = pos.left;
        label.textContent = player.name;
        fieldDiagram.appendChild(label);
      }
    });
  }

  // Event listener for adding a new player
  document.getElementById('playerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const playerNameInput = document.getElementById('playerName');
    const playerName = playerNameInput.value.trim();
    if (playerName) {
      let players = loadPlayers();

      // Check for duplicate player names
      if (players.some(p => p.name === playerName)) {
        alert('Player already exists!');
      } else {
        players.push({ name: playerName });
        savePlayers(players);
        displayPlayers();
        displayLineup();
        displayFieldDiagram();
        playerNameInput.value = '';
      }
    }
  });

  // Initial display of players, lineup, and field diagram
  displayPlayers();
  displayLineup();
  displayFieldDiagram();

});
