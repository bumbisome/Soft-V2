// app.js

// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', function() {

  // Positions List
  const positions = [
    'Pitcher', 'Catcher', 'First Base', 'Second Base', 'Third Base',
    'Shortstop', 'Left Field', 'Left Center Field', 'Right Center Field', 'Right Field',
    'Bench'
  ];

  // Position Coordinates for Field Diagram
  const positionCoordinates = {
    'Pitcher': { top: '45%', left: '50%' },
    'Catcher': { top: '60%', left: '50%' },
    'First Base': { top: '50%', left: '80%' },
    'Second Base': { top: '30%', left: '55%' },
    'Third Base': { top: '50%', left: '20%' },
    'Shortstop': { top: '30%', left: '45%' },
    'Left Field': { top: '15%', left: '20%' },
    'Left Center Field': { top: '10%', left: '35%' },
    'Right Center Field': { top: '10%', left: '65%' },
    'Right Field': { top: '15%', left: '80%' },
    // 'Bench' position doesn't have coordinates
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
      li.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-between');

      const nameDiv = document.createElement('div');
      nameDiv.textContent = player.name;

      // Position Select Dropdown
      const positionSelect = document.createElement('select');
      positionSelect.classList.add('form-control', 'ml-2');
      positionSelect.style.width = '150px';
      positionSelect.innerHTML = `<option value="">Select Position</option>` + positions
        .map(pos => `<option value="${pos}" ${player.position === pos ? 'selected' : ''}>${pos}</option>`)
        .join('');
      positionSelect.addEventListener('change', function () {
        players[index].position = this.value;
        savePlayers(players);
        displayFieldDiagram();
        displayBenchPlayers();
      });

      // Remove Button
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-button');
      removeButton.addEventListener('click', function () {
        if (confirm(`Are you sure you want to remove ${player.name}?`)) {
          // Remove player from the array
          players.splice(index, 1);
          savePlayers(players);
          // Update displays
          displayPlayers();
          displayLineup();
          displayFieldDiagram();
          displayBenchPlayers();
        }
      });

      // Append elements to the list item
      li.appendChild(nameDiv);
      li.appendChild(positionSelect);
      li.appendChild(removeButton);
      playerList.appendChild(li);
    });
  }

  // Function to display the batting lineup with numbers
  function displayLineup() {
    const battingLineup = document.getElementById('battingLineup');
    battingLineup.innerHTML = '';
    const players = loadPlayers();

    players.forEach((player, index) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'align-items-center');

      // Create a span for the batting order number
      const numberSpan = document.createElement('span');
      numberSpan.textContent = index + 1 + '.';
      numberSpan.classList.add('lineup-number');

      // Create a span for the player name
      const nameSpan = document.createElement('span');
      nameSpan.textContent = player.name;
      nameSpan.classList.add('lineup-name', 'ml-2');

      // Append number and name to the list item
      li.appendChild(numberSpan);
      li.appendChild(nameSpan);
      battingLineup.appendChild(li);
    });
  }

  // Function to update batting lineup numbering
  function updateLineupNumbers() {
    const battingLineupItems = document.querySelectorAll('#battingLineup li');
    battingLineupItems.forEach((li, index) => {
      const numberSpan = li.querySelector('.lineup-number');
      if (numberSpan) {
        numberSpan.textContent = index + 1 + '.';
      }
    });
  }

  // Initialize Sortable for batting lineup
  const sortable = Sortable.create(document.getElementById('battingLineup'), {
    animation: 150,
    onUpdate: function () {
      updateLineupNumbers();
    }
  });

  // Save the new batting lineup order
  document.getElementById('saveLineup').addEventListener('click', function () {
    const newOrder = [];
    const players = loadPlayers();
    const namesInOrder = Array.from(document.getElementById('battingLineup').children).map(li => li.querySelector('.lineup-name').textContent);

    namesInOrder.forEach(name => {
      const player = players.find(p => p.name === name);
      if (player) newOrder.push(player);
    });

    savePlayers(newOrder);
    displayPlayers();
    displayFieldDiagram();
    displayBenchPlayers();
  });

  // Function to display the field diagram
  function displayFieldDiagram() {
    const fieldDiagram = document.getElementById('fieldDiagram');
    fieldDiagram.innerHTML = '';
    const players = loadPlayers();

    players.forEach(player => {
      if (player.position && player.position !== 'Bench' && positionCoordinates[player.position]) {
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

  // Function to display bench players
  function displayBenchPlayers() {
    const benchTableBody = document.querySelector('#benchTable tbody');
    benchTableBody.innerHTML = '';
    const players = loadPlayers();

    players.forEach((player, index) => {
      if (player.position === 'Bench') {
        const tr = document.createElement('tr');

        // Player Name
        const nameTd = document.createElement('td');
        nameTd.textContent = player.name;

        // Notes
        const notesTd = document.createElement('td');
        const notesInput = document.createElement('input');
        notesInput.type = 'text';
        notesInput.value = player.notes || '';
        notesInput.classList.add('form-control');
        notesInput.addEventListener('input', function () {
          players[index].notes = this.value;
          savePlayers(players);
        });
        notesTd.appendChild(notesInput);

        tr.appendChild(nameTd);
        tr.appendChild(notesTd);
        benchTableBody.appendChild(tr);
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
        displayBenchPlayers();
        playerNameInput.value = '';
      }
    }
  });

  // Initial display of players, lineup, field diagram, and bench players
  displayPlayers();
  displayLineup();
  displayFieldDiagram();
  displayBenchPlayers();

});
