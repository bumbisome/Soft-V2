document.addEventListener('DOMContentLoaded', function() {
    let players = [];
    const playerNameInput = document.getElementById('playerNameInput');
    const lineupBody = document.getElementById('lineupBody');
    const benchBody = document.getElementById('benchBody');

    playerNameInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && this.value.trim() !== '') {
            addPlayer(this.value.trim());
            this.value = '';  // Clear the input field after adding
        }
    });

    function addPlayer(name) {
        const newPlayer = {
            name: name,
            position: '',
            id: players.length + 1,
            order: players.length + 1,
            notes: ''  // Additional field for notes
        };
        players.push(newPlayer);
        updateTables();
    }

    function updateTables() {
        updateLineupTable();
        updateBenchTable();
    }

    function updateLineupTable() {
        lineupBody.innerHTML = '';
        players.forEach((player, index) => {
            const row = lineupBody.insertRow();
            setRowData(row, player, index);
        });
    }

    function setRowData(row, player, index) {
        row.setAttribute('draggable', 'true');
        row.setAttribute('id', 'player-' + player.id);
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>
                <select onchange="updatePlayerPosition(this, ${player.id})">
                    <option value="">Assign Position</option>
                    <option value="Pitcher">Pitcher</option>
                    <option value="Catcher">Catcher</option>
                    <option value="First Base">First Base</option>
                    <option value="Second Base">Second Base</option>
                    <option value="Third Base">Third Base</option>
                    <option value="Shortstop">Shortstop</option>
                    <option value="Left Field">Left Field</option>
                    <option value="Right Center Field">Right Center Field</option>
                    <option value="Left Center Field">Left Center Field</option>
                    <option value="Right Field">Right Field</option>
                    <option value="Bench">Bench</option>
                </select>
            </td>
            <td><button onclick="removePlayer(${player.id})">Delete</button></td>
        `;
        row.cells[2].children[0].value = player.position;
        setupDraggableRows(row);
    }

    function updateBenchTable() {
        benchBody.innerHTML = '';
        players.filter(player => player.position === "Bench").forEach(player => {
            const benchRow = benchBody.insertRow();
            setBenchRowData(benchRow, player);
        });
    }

    function setBenchRowData(benchRow, player) {
        benchRow.innerHTML = `
            <td>${player.name}</td>
            <td><input type="text" value="${player.notes}" oninput="updateNotes(this.value, ${player.id})"></td>
        `;
    }

    window.updatePlayerPosition = (select, playerId) => {
        const player = players.find(p => p.id === playerId);
        player.position = select.value;
        updateTables();  // Refresh both tables when position changes
    };

    window.updateNotes = (notes, playerId) => {
        const player = players.find(p => p.id === playerId);
        player.notes = notes;
    };

    window.removePlayer = (playerId) => {
        players = players.filter(p => p.id !== playerId);
        updateTables();
    };

    function setupDraggableRows(row) {
        row.addEventListener('dragstart', handleDragStart, false);
        row.addEventListener('dragover', handleDragOver, false);
        row.addEventListener('drop', handleDrop, false);
        row.addEventListener('dragend', handleDragEnd, false);
    }

    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.currentTarget.style.opacity = '0.5';
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(e) {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const dragStartElem = document.getElementById(id);
        const dropTarget = e.target.closest('tr');
        if (dragStartElem && dropTarget && dragStartElem !== dropTarget) {
            const indexFrom = [...dragStartElem.parentNode.children].indexOf(dragStartElem);
            const indexTo = [...dropTarget.parentNode.children].indexOf(dropTarget);
            if (indexFrom < indexTo) {
                dropTarget.after(dragStartElem);
            } else {
                dropTarget.before(dragStartElem);
            }
            updatePlayerOrder();
        }
    }

    function handleDragEnd(e) {
        e.currentTarget.style.opacity = '1';
    }

    function updatePlayerOrder() {
        Array.from(lineupBody.children).forEach((row, index) => {
            const playerId = parseInt(row.id.split('-')[1]);
            const player = players.find(p => p.id === playerId);
            player.order = index + 1;
            row.cells[0].textContent = index + 1;
        });
    }

    window.generateField = function() {
        const baseballField = document.getElementById('baseballField');
        baseballField.innerHTML = '';
        players.filter(p => p.position !== "Bench").forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-position';
            playerDiv.textContent = player.name;
            const positionCoords = getPositionCoords(player.position);
            playerDiv.style.left = positionCoords.x + '%';
            playerDiv.style.top = positionCoords.y + '%';
            baseballField.appendChild(playerDiv);
        });
    };

        function getPositionCoords(position) {
        const positionMap = {
            'Pitcher': {x: 45, y: 60}, 'Catcher': {x: 45, y: 85},
            'First Base': {x: 65, y: 55}, 'Second Base': {x: 57, y: 45},
            'Third Base': {x: 28, y: 55}, 'Shortstop': {x: 35, y: 45},
            'Left Field': {x: 15, y: 38}, 'Right Center Field': {x: 63, y: 22},
            'Left Center Field': {x: 30, y: 22}, 'Right Field': {x: 75, y: 38}
        };
        return positionMap[position] || {x: 100, y: 1}; // Default center position if undefined
    }
});
