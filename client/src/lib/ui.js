
export function updateList(activities) {
  const list = document.getElementById('list');
  list.innerHTML = activities.map(a => 
    `<li>${a.type}: ${a.duration} min, ${a.calories} cal (${a.date.toLocaleDateString()})</li>`
  ).join('');
}

export function clearInputs() {
  document.getElementById('type').value = '';
  document.getElementById('duration').value = '';
  document.getElementById('calories').value = '';
}
