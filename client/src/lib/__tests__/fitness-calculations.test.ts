
import { calculateBMR, calculateCalorieDeficit, calculateMacros } from '../fitness-calculations';

describe('BMR Calculation', () => {
  test('calculates BMR correctly for males', () => {
    const bmr = calculateBMR(80, 180, 30, 'male');
    expect(bmr).toBeCloseTo(1810, 0); // Allow some rounding difference
  });

  test('calculates BMR correctly for females', () => {
    const bmr = calculateBMR(65, 165, 30, 'female');
    expect(bmr).toBeCloseTo(1400, 0); // Allow some rounding difference
  });
});

describe('Calorie Deficit Calculation', () => {
  test('calculates moderate deficit correctly', () => {
    const result = calculateCalorieDeficit(
      80, // current weight
      70, // target weight
      12, // weeks
      2400, // maintenance calories
      20, // current body fat
      15, // target body fat
      'moderate',
      3, // weight lifting sessions
      2, // cardio sessions
      8000, // steps per day
      0, // refeed days
      0 // diet break weeks
    );
    
    expect(result).toHaveProperty('dailyFoodCalorieTarget');
    expect(result.dailyFoodCalorieTarget).toBeLessThan(2400); // Should be less than maintenance
  });
});

describe('Macro Calculation', () => {
  test('prioritizes protein based on body fat percentage', () => {
    const macros = calculateMacros(80, 1800, 20, 'beginner');
    
    expect(macros).toHaveProperty('protein');
    expect(macros).toHaveProperty('carbs');
    expect(macros).toHaveProperty('fat');
    
    // Protein should be relatively high for fat loss
    expect(macros.protein).toBeGreaterThanOrEqual(160); // At least 2g per kg
  });
});
