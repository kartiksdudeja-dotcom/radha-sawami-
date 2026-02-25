// Utility function to detect gender from name
export const detectGenderFromName = (name) => {
  if (!name) return 'Male';

  const lowerName = name.toLowerCase().trim();

  // Female indicators
  const femaleIndicators = [
    'rani', 'devi', 'maa', 'mata', 'bai', 'ba', 'ben', 'smt', 'srimati',
    'sudha', 'priya', 'anita', 'divya', 'neha', 'pooja', 'isha', 'kavya',
    'nikita', 'shreya', 'sneha', 'aisha', 'zara', 'sara', 'hema', 'sonia',
    'rekha', 'meera', 'geeta', 'kiran', 'niketa', 'diya', 'maya', 'ria',
    'tina', 'ritu', 'seema', 'deepa', 'nisha', 'pallavi', 'swati', 'priyanka',
    'akshara', 'akella', 'shailendra', 'savitri', 'savita', 'savitribai',
    'kumari', 'kumari', 'datta', 'devi', 'sharma', 'gupta', 'patel', 'khan',
    'begum', 'bibi', 'begim', 'mrs', 'ms', 'miss', 'lady', 'girl', 'woman',
    'ma', 'mom', 'mother', 'sister', 'aunt', 'auntie', 'nani', 'dadi',
    'bhabhi', 'bahu', 'patni', 'wife', 'bride', 'daughter', 'granddaughter'
  ];

  // Male indicators
  const maleIndicators = [
    'kumar', 'raj', 'singh', 'sharma', 'gupta', 'patel', 'khan', 'reddy',
    'das', 'nair', 'pillai', 'iyer', 'rao', 'babu', 'sah', 'bhat', 'verma',
    'trivedi', 'pandey', 'mishra', 'agarwal', 'joshi', 'kulkarni', 'desai',
    'mahajan', 'kapoor', 'malhotra', 'bedi', 'arora', 'chopra', 'dhawan',
    'sinha', 'dutta', 'roy', 'banerjee', 'chatterjee', 'bose', 'dasgupta',
    'mukherjee', 'saxena', 'dwivedi', 'shrivastava', 'rastogi', 'maurya',
    'yadav', 'singh', 'thakur', 'chauhan', 'rathod', 'solanki', 'rajput',
    'sahni', 'sethi', 'mittal', 'thapar', 'oberoi', 'wazir', 'sarin',
    'bhatnagar', 'dalmia', 'goenka', 'birla', 'tata', 'ambani', 'adani',
    'mr', 'master', 'sir', 'shri', 'sri', 'shrimatiji', 'rev', 'son', 'boy',
    'man', 'brother', 'uncle', 'dada', 'grandfather', 'father', 'husband',
    'groom', 'prince', 'grandson', 'lord', 'dev', 'maharaj', 'pandit', 'swami'
  ];

  // Check for female indicators
  for (let indicator of femaleIndicators) {
    if (lowerName.includes(indicator)) {
      return 'Female';
    }
  }

  // Check for male indicators
  for (let indicator of maleIndicators) {
    if (lowerName.includes(indicator)) {
      return 'Male';
    }
  }

  // Default heuristic: names ending in 'a' or 'i' are often female (Hindi/Indian names)
  if (lowerName.endsWith('a') || lowerName.endsWith('i')) {
    return 'Female';
  }

  // Default to Male
  return 'Male';
};
