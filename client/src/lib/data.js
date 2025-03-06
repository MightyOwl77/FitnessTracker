
export class FitnessTracker {
  constructor() {
    this.activities = JSON.parse(localStorage.getItem('activities')) || [];
  }

  addActivity(type, duration, calories) {
    const activity = {
      type,
      duration: parseFloat(duration),
      calories: parseFloat(calories),
      date: new Date()
    };
    this.activities.push(activity);
    localStorage.setItem('activities', JSON.stringify(this.activities));
    return activity;
  }

  getActivities() {
    return this.activities;
  }
}
