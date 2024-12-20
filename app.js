// app.js

// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', function () {

  // Positions List
  const positions = [
    'Pitcher', 'Catcher', 'First Base', 'Second Base', 'Third Base',
    'Shortstop', 'Left Field', 'Left Center Field', 'Right Center Field', 'Right Field',
    'Bench'
  ];

  // Position Coordinates for Field Diagram
  const positionCoordinates = {
  'Pitcher': { top: '65%', left: '50%' },
    'Catcher': { top: '90%', left: '50%' },
    'First Base': { top: '60%', left: '80%' },
    'Second Base': { top: '40%', left: '65%' },
    'Third Base': { top: '60%', left: '20%' },
    'Shortstop': { top: '40%', left: '35%' },
    'Left Field': { top: '35%', left: '10%' },
    'Left Center Field': { top: '20%', left: '35%' },
    'Right Center Field': { top: '20%', left: '65%' },
    'Right Field': { top: '35%', left: '90%' },
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

  // Function to display the roster with position selection, remove button, and batting order numbers
  function displayRoster() {
    const rosterList = document.getElementById('rosterList');
    rosterList.innerHTML = '';
    let players = loadPlayers();

    players.forEach((player, index) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-between');
      li.dataset.playerId = player.id; // Store player ID in data attribute

      // Create a div for the player info
      const infoDiv = document.createElement('div');
      infoDiv.classList.add('d-flex', 'align-items-center');

      // Drag Handle
      const dragHandle = document.createElement('span');
      dragHandle.classList.add('drag-handle', 'mr-2');
      const dragIcon = document.createElement('i');
      dragIcon.classList.add('fas', 'fa-grip-lines'); // Font Awesome grip lines icon
      dragHandle.appendChild(dragIcon);

      // Batting Order Number
      const numberSpan = document.createElement('span');
      numberSpan.textContent = index + 1 + '.';
      numberSpan.classList.add('lineup-number', 'mr-2');

      // Player Name Input (Editable)
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = player.name;
      nameInput.classList.add('form-control', 'lineup-name', 'mr-2');
      nameInput.addEventListener('change', function () {
        // Check for duplicate names
        if (players.some((p) => p.name === this.value && p.id !== player.id)) {
          alert('A player with this name already exists!');
          this.value = player.name; // Revert to old name
        } else {
          player.name = this.value;
          savePlayers(players);
          displayRoster();
          displayFieldDiagram();
          displayBenchPlayers();
        }
      });

      // Position Select Dropdown
      const positionSelect = document.createElement('select');
      positionSelect.classList.add('form-control', 'ml-2', 'position-select');
      positionSelect.innerHTML = `<option value="">Select Position</option>` + positions
        .map(pos => `<option value="${pos}" ${player.position === pos ? 'selected' : ''}>${pos}</option>`)
        .join('');
      positionSelect.addEventListener('change', function () {
        player.position = this.value;
        savePlayers(players);
        displayFieldDiagram();
        displayBenchPlayers();
      });

      // Append drag handle, number, name input, and position select to infoDiv
      infoDiv.appendChild(dragHandle);
      infoDiv.appendChild(numberSpan);
      infoDiv.appendChild(nameInput);
      infoDiv.appendChild(positionSelect);

      // Remove Button
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-button');
      removeButton.addEventListener('click', function () {
        if (confirm(`Are you sure you want to remove ${player.name}?`)) {
          // Remove player from the array
          players = players.filter((p) => p.id !== player.id);
          savePlayers(players);
          // Update displays
          displayRoster();
          displayFieldDiagram();
          displayBenchPlayers();
        }
      });

      // Append infoDiv and remove button to the list item
      li.appendChild(infoDiv);
      li.appendChild(removeButton);
      rosterList.appendChild(li);
    });
  }

  // Function to update batting lineup numbering
  function updateLineupNumbers() {
    const rosterItems = document.querySelectorAll('#rosterList li');
    rosterItems.forEach((li, index) => {
      const numberSpan = li.querySelector('.lineup-number');
      if (numberSpan) {
        numberSpan.textContent = (index + 1) + '.';
      }
    });
  }

  // Initialize Sortable for roster list with drag handle
  const sortable = Sortable.create(document.getElementById('rosterList'), {
    animation: 150,
    handle: '.drag-handle',
    onEnd: function () {
      const players = loadPlayers();
      const newOrder = [];
      const rosterItems = document.querySelectorAll('#rosterList li');
      rosterItems.forEach(li => {
        const playerId = li.dataset.playerId;
        const player = players.find(p => p.id === playerId);
        if (player) {
          newOrder.push(player);
        }
      });
      savePlayers(newOrder);
      updateLineupNumbers();
      displayFieldDiagram();
      displayBenchPlayers();
    }
  });

  // Save the new batting lineup order when "Save Lineup" is clicked
  document.getElementById('saveLineup').addEventListener('click', function () {
    alert('Lineup saved!');
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

    players.forEach(player => {
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
          player.notes = this.value;
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
        // Assign a unique ID to the new player
        const playerId = Date.now().toString(); // Use timestamp as unique ID
        players.push({ id: playerId, name: playerName });
        savePlayers(players);
        displayRoster();
        displayFieldDiagram();
        displayBenchPlayers();
        playerNameInput.value = '';
      }
    }
  });

  // Initial display of roster, field diagram, and bench players
  displayRoster();
  displayFieldDiagram();
  displayBenchPlayers();

});
