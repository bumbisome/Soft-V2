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

  // Function to display the roster with position selection, remove button, and batting order numbers
  function displayRoster() {
    const rosterList = document.getElementById('rosterList');
    rosterList.innerHTML = '';
    let players = loadPlayers();

    players.forEach((player) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-between');

      // Create a div for the player info
      const infoDiv = document.createElement('div');
      infoDiv.classList.add('d-flex', 'align-items-center');

      // Drag Handle
      const dragHandle = document.createElement('span');
      dragHandle.classList.add('drag-handle', 'mr-2');
      dragHandle.innerHTML = '&#9776;'; // Unicode character for a hamburger menu icon

      // Batting Order Number
      const numberSpan = document.createElement('span');
      numberSpan.textContent = players.indexOf(player) + 1 + '.';
      numberSpan.classList.add('lineup-number', 'mr-2');

      // Player Name Input (Editable)
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = player.name;
      nameInput.classList.add('form-control', 'lineup-name', 'mr-2');
      nameInput.addEventListener('change', function () {
        // Check for duplicate names
        if (players.some((p) => p.name === this.value && p !== player)) {
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
          players = players.filter((p) => p !== player);
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
    onUpdate: function () {
      const newOrder = [];
      const players = loadPlayers();
      const namesInOrder = Array.from(document.getElementById('rosterList').children).map(li => li.querySelector('.lineup-name').value);

      namesInOrder.forEach(name => {
        const player = players.find(p => p.name === name);
        if (player) newOrder.push(player);
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
  function displayFiel
