export type QuestionType = 'multiple-choice' | 'sequence' | 'pattern' | 'count' | 'compare' | 'match';

export interface PrepQuestion {
  id: string;
  ageGroup: 5 | 6;
  questionText: string;
  choices: string[];
  correctIndex: number;
  type: QuestionType;
  emoji: string;
}

export interface PrepCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  questions: PrepQuestion[];
}

export const PREP_CATEGORIES: PrepCategory[] = [
  {
    id: 'story-math',
    name: 'STORY MATH MASTER',
    emoji: '🧮',
    color: '#f97316',
    questions: [
      { id: 'sm-5-1', ageGroup: 5, questionText: 'Aiden has 3 apples. His friend gives him 2 more. How many apples does Aiden have now?', choices: ['4', '5', '6'], correctIndex: 1, type: 'multiple-choice', emoji: '🧮' },
      { id: 'sm-5-2', ageGroup: 5, questionText: 'There are 8 birds sitting on a fence. 3 fly away. How many birds are left?', choices: ['8', '5', '3'], correctIndex: 1, type: 'multiple-choice', emoji: '🧮' },
      { id: 'sm-5-3', ageGroup: 5, questionText: 'Aiden has 4 toy cars. He shares them equally with 1 friend so they each get the same amount. How many does each person get?', choices: ['2', '3', '4'], correctIndex: 0, type: 'multiple-choice', emoji: '🧮' },
      { id: 'sm-5-4', ageGroup: 5, questionText: 'Aiden bakes 5 cookies. His dog gets 2. How many cookies does Aiden get?', choices: ['3', '2', '1'], correctIndex: 0, type: 'multiple-choice', emoji: '🧮' },
      { id: 'sm-5-5', ageGroup: 5, questionText: 'There are 6 fish in a tank. Aiden adds 2 more fish. How many fish are in the tank?', choices: ['7', '8', '10'], correctIndex: 1, type: 'multiple-choice', emoji: '🧮' },
      { id: 'sm-5-6', ageGroup: 5, questionText: 'Aiden has 9 grapes. He eats 4. How many are left?', choices: ['4', '5', '6'], correctIndex: 1, type: 'multiple-choice', emoji: '🧮' },
      { id: 'sm-6-1', ageGroup: 6, questionText: 'Aiden has 6 strawberries. He eats 2 of them. Then his mom gives him 4 more. How many strawberries does he have now?', choices: ['6', '8', '10'], correctIndex: 1, type: 'multiple-choice', emoji: '🧮' },
      { id: 'sm-6-2', ageGroup: 6, questionText: 'There are 12 birds on a fence. 5 fly away, then 3 more land. How many birds are on the fence now?', choices: ['8', '10', '12'], correctIndex: 1, type: 'multiple-choice', emoji: '🧮' },
      { id: 'sm-6-3', ageGroup: 6, questionText: 'Aiden has 9 stickers. He gives the same number to each of his 3 friends. How many stickers does each friend get?', choices: ['2', '3', '4'], correctIndex: 1, type: 'multiple-choice', emoji: '🧮' },
      { id: 'sm-6-4', ageGroup: 6, questionText: 'Aiden bakes 15 cookies. He gives 6 to his classmates and eats 3 himself. How many cookies are left?', choices: ['6', '9', '3'], correctIndex: 1, type: 'multiple-choice', emoji: '🧮' },
      { id: 'sm-6-5', ageGroup: 6, questionText: 'Aiden has 7 blue balloons and 5 red balloons. His sister pops 4 balloons. How many balloons are left?', choices: ['7', '8', '10'], correctIndex: 1, type: 'multiple-choice', emoji: '🧮' },
      { id: 'sm-6-6', ageGroup: 6, questionText: 'Aiden scores 8 points in a game. His friend scores double that. How many points does his friend have?', choices: ['14', '16', '18'], correctIndex: 1, type: 'multiple-choice', emoji: '🧮' },
    ],
  },
  {
    id: 'mystery-number',
    name: 'MYSTERY NUMBER HUNT',
    emoji: '🔍',
    color: '#8b5cf6',
    questions: [
      { id: 'mn-5-1', ageGroup: 5, questionText: '3 + ___ = 7. What number goes in the blank?', choices: ['4', '5', '6'], correctIndex: 0, type: 'multiple-choice', emoji: '🔍' },
      { id: 'mn-5-2', ageGroup: 5, questionText: '10 - ___ = 6. What number goes in the blank?', choices: ['3', '4', '5'], correctIndex: 1, type: 'multiple-choice', emoji: '🔍' },
      { id: 'mn-5-3', ageGroup: 5, questionText: 'The star means a secret number. If ⭐ + ⭐ = 8, what does one ⭐ equal?', choices: ['3', '4', '6'], correctIndex: 1, type: 'multiple-choice', emoji: '🔍' },
      { id: 'mn-5-4', ageGroup: 5, questionText: '2 + ___ = 9. What number goes in the blank?', choices: ['5', '6', '7'], correctIndex: 2, type: 'multiple-choice', emoji: '🔍' },
      { id: 'mn-5-5', ageGroup: 5, questionText: '🌟 = 3. What is 🌟 + 🌟?', choices: ['4', '5', '6'], correctIndex: 2, type: 'multiple-choice', emoji: '🔍' },
      { id: 'mn-5-6', ageGroup: 5, questionText: '___ - 3 = 5. What is the missing number?', choices: ['5', '7', '9'], correctIndex: 1, type: 'multiple-choice', emoji: '🔍' },
      { id: 'mn-5-7', ageGroup: 5, questionText: '4 + ___ = 10. What goes in the blank?', choices: ['5', '6', '7'], correctIndex: 1, type: 'multiple-choice', emoji: '🔍' },
      { id: 'mn-6-1', ageGroup: 6, questionText: '___ + 6 = 14. What number goes in the blank?', choices: ['6', '7', '8'], correctIndex: 2, type: 'multiple-choice', emoji: '🔍' },
      { id: 'mn-6-2', ageGroup: 6, questionText: '20 - ___ = 13. What number goes in the blank?', choices: ['6', '7', '8'], correctIndex: 1, type: 'multiple-choice', emoji: '🔍' },
      { id: 'mn-6-3', ageGroup: 6, questionText: '⭐ + ⭐ + ⭐ = 12. What does one ⭐ equal?', choices: ['3', '4', '6'], correctIndex: 1, type: 'multiple-choice', emoji: '🔍' },
      { id: 'mn-6-4', ageGroup: 6, questionText: '5 + ___ = 17. What number goes in the blank?', choices: ['10', '11', '12'], correctIndex: 2, type: 'multiple-choice', emoji: '🔍' },
      { id: 'mn-6-5', ageGroup: 6, questionText: '🍎 = 4. What is 🍎 + 🍎 + 🍎?', choices: ['10', '11', '12'], correctIndex: 2, type: 'multiple-choice', emoji: '🔍' },
      { id: 'mn-6-6', ageGroup: 6, questionText: '🐸 + 🌟 = 10. 🌟 = 3. What does 🐸 equal?', choices: ['5', '7', '9'], correctIndex: 1, type: 'multiple-choice', emoji: '🔍' },
      { id: 'mn-6-7', ageGroup: 6, questionText: '🍕 + 🍕 = 18. What does one 🍕 equal?', choices: ['7', '9', '11'], correctIndex: 1, type: 'multiple-choice', emoji: '🔍' },
    ],
  },
  {
    id: 'shape-pattern',
    name: 'SHAPE PATTERN DETECTIVE',
    emoji: '🔷',
    color: '#06b6d4',
    questions: [
      { id: 'sp-5-1', ageGroup: 5, questionText: 'Look at the pattern: 🔴 🔵 🔴 🔵 ___. What comes next?', choices: ['🔵', '🔴', '🔶'], correctIndex: 0, type: 'pattern', emoji: '🔷' },
      { id: 'sp-5-2', ageGroup: 5, questionText: 'Look at the pattern: ⭐ ⭐ 🌙 ⭐ ⭐ ___. What comes next?', choices: ['🌙', '⭐', '☀️'], correctIndex: 0, type: 'pattern', emoji: '🔷' },
      { id: 'sp-5-3', ageGroup: 5, questionText: 'Which shape is different from all the others? 🔴 🔴 🔴 🔵 🔴', choices: ['🔵', '🔴', '🔶'], correctIndex: 0, type: 'multiple-choice', emoji: '🔷' },
      { id: 'sp-5-4', ageGroup: 5, questionText: 'The pattern goes: 1 shape, 2 shapes, 3 shapes. How many shapes come next? ◼ ◼◼ ◼◼◼ ___', choices: ['3', '4', '5'], correctIndex: 1, type: 'sequence', emoji: '🔷' },
      { id: 'sp-5-5', ageGroup: 5, questionText: 'Look at the pattern: 🐶 🐱 🐶 🐱 🐶 ___. What comes next?', choices: ['🐶', '🐱', '🐦'], correctIndex: 1, type: 'pattern', emoji: '🔷' },
      { id: 'sp-5-6', ageGroup: 5, questionText: 'Which one does NOT belong? 🔺 🔺 🔴 🔺', choices: ['🔴', '🔺', '🔶'], correctIndex: 0, type: 'multiple-choice', emoji: '🔷' },
      { id: 'sp-5-7', ageGroup: 5, questionText: 'The pattern goes big, small, big, small. Which comes after: big, small, big ___?', choices: ['big', 'small', 'medium'], correctIndex: 1, type: 'sequence', emoji: '🔷' },
      { id: 'sp-6-1', ageGroup: 6, questionText: 'Look at the pattern: 🔺 🔶 🔵 🔺 🔶 ___. What comes next?', choices: ['🔵', '🔺', '🔶'], correctIndex: 0, type: 'pattern', emoji: '🔷' },
      { id: 'sp-6-2', ageGroup: 6, questionText: 'Look at the pattern: 🟥 🟥 🟦 🟥 🟥 🟦 ___. What comes next?', choices: ['🌙', '🟥', '🟦'], correctIndex: 0, type: 'pattern', emoji: '🔷' },
      { id: 'sp-6-3', ageGroup: 6, questionText: 'Look at the row: big circle, small circle, big square, small square, big triangle, ___. What comes next?', choices: ['small triangle', 'big circle', 'small square'], correctIndex: 0, type: 'sequence', emoji: '🔷' },
      { id: 'sp-6-4', ageGroup: 6, questionText: 'A pattern adds 2 each time: 2, 4, 6, ___. What comes next?', choices: ['7', '8', '9'], correctIndex: 1, type: 'sequence', emoji: '🔷' },
      { id: 'sp-6-5', ageGroup: 6, questionText: 'Look at the pattern: 🐶 🐱 🐦 🐶 🐱 🐦 🐶 ___. What comes next?', choices: ['🐶', '🐱', '🐦'], correctIndex: 1, type: 'pattern', emoji: '🔷' },
      { id: 'sp-6-6', ageGroup: 6, questionText: 'Which shape does NOT belong in this group? circle, oval, sphere, square', choices: ['circle', 'oval', 'square'], correctIndex: 2, type: 'multiple-choice', emoji: '🔷' },
      { id: 'sp-6-7', ageGroup: 6, questionText: 'A growing pattern: 🌟 🌟🌟 🌟🌟🌟 🌟🌟🌟🌟 ___. How many stars come next?', choices: ['4', '5', '6'], correctIndex: 1, type: 'sequence', emoji: '🔷' },
    ],
  },
  {
    id: 'number-ninja',
    name: 'NUMBER NINJA',
    emoji: '🥷',
    color: '#10b981',
    questions: [
      { id: 'nn-5-1', ageGroup: 5, questionText: 'Which number is bigger: 4 or 7?', choices: ['4', '7', 'same'], correctIndex: 1, type: 'compare', emoji: '🥷' },
      { id: 'nn-5-2', ageGroup: 5, questionText: 'Count the stars: ⭐⭐⭐⭐⭐. How many are there?', choices: ['3', '5', '4'], correctIndex: 1, type: 'count', emoji: '🥷' },
      { id: 'nn-5-3', ageGroup: 5, questionText: 'Which group has MORE? 🍎🍎🍎 or 🍊🍊🍊🍊🍊', choices: ['🍎🍎🍎', '🍊🍊🍊🍊🍊', 'same'], correctIndex: 1, type: 'compare', emoji: '🥷' },
      { id: 'nn-5-4', ageGroup: 5, questionText: 'What number comes after 6?', choices: ['5', '7', '8'], correctIndex: 1, type: 'sequence', emoji: '🥷' },
      { id: 'nn-5-5', ageGroup: 5, questionText: 'Count backwards: 5, 4, 3, ___. What comes next?', choices: ['4', '2', '1'], correctIndex: 1, type: 'sequence', emoji: '🥷' },
      { id: 'nn-5-6', ageGroup: 5, questionText: 'Which is smallest: 2, 8, or 5?', choices: ['2', '5', '8'], correctIndex: 0, type: 'compare', emoji: '🥷' },
      { id: 'nn-5-7', ageGroup: 5, questionText: 'How many 🐸 are there? 🐸🐸🐸🐸🐸🐸🐸', choices: ['6', '7', '8'], correctIndex: 1, type: 'count', emoji: '🥷' },
      { id: 'nn-5-8', ageGroup: 5, questionText: 'Fill in the blank: 3, 4, ___, 6', choices: ['4', '5', '6'], correctIndex: 1, type: 'sequence', emoji: '🥷' },
      { id: 'nn-6-1', ageGroup: 6, questionText: 'Put these numbers in order from smallest to biggest: 9, 3, 15, 6', choices: ['3, 6, 9, 15', '6, 3, 9, 15', '9, 6, 3, 15'], correctIndex: 0, type: 'compare', emoji: '🥷' },
      { id: 'nn-6-2', ageGroup: 6, questionText: 'Aiden has 12 points and his friend has 8. How many MORE points does Aiden have?', choices: ['3', '4', '5'], correctIndex: 1, type: 'count', emoji: '🥷' },
      { id: 'nn-6-3', ageGroup: 6, questionText: 'Which number is between 11 and 14?', choices: ['10', '12', '15'], correctIndex: 1, type: 'compare', emoji: '🥷' },
      { id: 'nn-6-4', ageGroup: 6, questionText: 'What number comes right before 17?', choices: ['14', '15', '16'], correctIndex: 2, type: 'sequence', emoji: '🥷' },
      { id: 'nn-6-5', ageGroup: 6, questionText: 'Count by 2s: 2, 4, 6, 8, ___. What comes next?', choices: ['9', '10', '11'], correctIndex: 1, type: 'sequence', emoji: '🥷' },
      { id: 'nn-6-6', ageGroup: 6, questionText: 'Which number is closest to 10: 7, 12, or 15?', choices: ['7', '12', '15'], correctIndex: 1, type: 'compare', emoji: '🥷' },
      { id: 'nn-6-7', ageGroup: 6, questionText: 'Aiden counts 5 red fish and 7 blue fish. How many more blue fish are there?', choices: ['1 more blue', '2 more blue', '3 more blue'], correctIndex: 1, type: 'count', emoji: '🥷' },
      { id: 'nn-6-8', ageGroup: 6, questionText: 'Fill in the blanks: 5, 10, ___, 20, ___', choices: ['15 and 25', '12 and 22', '13 and 23'], correctIndex: 0, type: 'sequence', emoji: '🥷' },
    ],
  },
  {
    id: 'word-wizard',
    name: 'WORD CONNECTION WIZARD',
    emoji: '🧙',
    color: '#ec4899',
    questions: [
      { id: 'ww-5-1', ageGroup: 5, questionText: 'Dog goes with puppy. Cat goes with ___?', choices: ['kitten', 'cub', 'chick'], correctIndex: 0, type: 'match', emoji: '🧙' },
      { id: 'ww-5-2', ageGroup: 5, questionText: 'Shoe goes on your foot. Hat goes on your ___?', choices: ['hand', 'head', 'neck'], correctIndex: 1, type: 'match', emoji: '🧙' },
      { id: 'ww-5-3', ageGroup: 5, questionText: 'Apple is a fruit. Carrot is a ___?', choices: ['fruit', 'vegetable', 'meat'], correctIndex: 1, type: 'match', emoji: '🧙' },
      { id: 'ww-5-4', ageGroup: 5, questionText: 'Day is bright. Night is ___?', choices: ['loud', 'dark', 'warm'], correctIndex: 1, type: 'match', emoji: '🧙' },
      { id: 'ww-5-5', ageGroup: 5, questionText: 'You eat with a fork. You drink with a ___?', choices: ['spoon', 'plate', 'cup'], correctIndex: 2, type: 'match', emoji: '🧙' },
      { id: 'ww-5-6', ageGroup: 5, questionText: 'Rain is wet. Sun is ___?', choices: ['cold', 'hot', 'windy'], correctIndex: 1, type: 'match', emoji: '🧙' },
      { id: 'ww-5-7', ageGroup: 5, questionText: '🍌 is yellow. 🍎 is ___?', choices: ['red', 'blue', 'green'], correctIndex: 0, type: 'match', emoji: '🧙' },
      { id: 'ww-6-1', ageGroup: 6, questionText: 'Bird flies. Fish ___. Which word completes the pair the same way?', choices: ['swims', 'runs', 'jumps'], correctIndex: 0, type: 'match', emoji: '🧙' },
      { id: 'ww-6-2', ageGroup: 6, questionText: 'Pen is to writing as scissors is to ___?', choices: ['cutting', 'drawing', 'gluing'], correctIndex: 0, type: 'match', emoji: '🧙' },
      { id: 'ww-6-3', ageGroup: 6, questionText: 'Doctor works in a hospital. Teacher works in a ___?', choices: ['store', 'school', 'park'], correctIndex: 1, type: 'match', emoji: '🧙' },
      { id: 'ww-6-4', ageGroup: 6, questionText: 'Ice is cold. Fire is ___?', choices: ['hot', 'big', 'loud'], correctIndex: 0, type: 'match', emoji: '🧙' },
      { id: 'ww-6-5', ageGroup: 6, questionText: 'A wheel is part of a car. A wing is part of a ___?', choices: ['boat', 'plane', 'train'], correctIndex: 1, type: 'match', emoji: '🧙' },
      { id: 'ww-6-6', ageGroup: 6, questionText: 'Kitten grows into a cat. Puppy grows into a ___?', choices: ['bear', 'dog', 'wolf'], correctIndex: 1, type: 'match', emoji: '🧙' },
      { id: 'ww-6-7', ageGroup: 6, questionText: 'Sad is the opposite of happy. Fast is the opposite of ___?', choices: ['quick', 'slow', 'loud'], correctIndex: 1, type: 'match', emoji: '🧙' },
    ],
  },
  {
    id: 'story-detective',
    name: 'STORY DETECTIVE',
    emoji: '📖',
    color: '#f59e0b',
    questions: [
      { id: 'sd-5-1', ageGroup: 5, questionText: 'Aiden went to the park. He saw 3 dogs and 2 cats. Which animal did he see MORE of?', choices: ['cats', 'dogs', 'same'], correctIndex: 1, type: 'multiple-choice', emoji: '📖' },
      { id: 'sd-5-2', ageGroup: 5, questionText: 'Mia is cold. She puts on her coat. WHY did Mia put on her coat?', choices: ['to look nice', 'to stay warm', 'to go swimming'], correctIndex: 1, type: 'multiple-choice', emoji: '📖' },
      { id: 'sd-5-3', ageGroup: 5, questionText: 'Aiden felt tired after playing all day. What would help him feel better?', choices: ['run faster', 'take a rest', 'eat ice cream'], correctIndex: 1, type: 'multiple-choice', emoji: '📖' },
      { id: 'sd-5-4', ageGroup: 5, questionText: 'Lily has a red umbrella. It is raining outside. Why does Lily take her umbrella?', choices: ['it looks cool', 'to stay dry', 'it is heavy'], correctIndex: 1, type: 'multiple-choice', emoji: '📖' },
      { id: 'sd-5-5', ageGroup: 5, questionText: "A story says: 'The cat sat by the warm fireplace on a cold night.' Why was the cat by the fireplace?", choices: ['to sleep', 'to stay warm', 'to eat'], correctIndex: 1, type: 'multiple-choice', emoji: '📖' },
      { id: 'sd-5-6', ageGroup: 5, questionText: 'In a story, it says Jake was hungry. What would Jake probably do next?', choices: ['go to sleep', 'find food', 'play outside'], correctIndex: 1, type: 'multiple-choice', emoji: '📖' },
      { id: 'sd-5-7', ageGroup: 5, questionText: "Aiden's story says he was happy at the park. What is a word that means the SAME as happy?", choices: ['sad', 'angry', 'joyful'], correctIndex: 2, type: 'multiple-choice', emoji: '📖' },
      { id: 'sd-6-1', ageGroup: 6, questionText: 'Aiden read that you should sleep 10 hours a night. He slept 8 hours. How many more hours should he have slept?', choices: ['1 hour', '2 hours', '3 hours'], correctIndex: 1, type: 'multiple-choice', emoji: '📖' },
      { id: 'sd-6-2', ageGroup: 6, questionText: 'Sam ate breakfast, then brushed his teeth, then went to school. What did Sam do FIRST?', choices: ['brush teeth', 'go to school', 'eat breakfast'], correctIndex: 2, type: 'multiple-choice', emoji: '📖' },
      { id: 'sd-6-3', ageGroup: 6, questionText: "The story says the body repairs itself while you sleep. What does 'repair' mean here?", choices: ['fix and grow', 'eat and drink', 'run and jump'], correctIndex: 0, type: 'multiple-choice', emoji: '📖' },
      { id: 'sd-6-4', ageGroup: 6, questionText: 'Tom goes to bed at 8pm and wakes up at 7am. How many hours did Tom sleep?', choices: ['9', '10', '11'], correctIndex: 2, type: 'multiple-choice', emoji: '📖' },
      { id: 'sd-6-5', ageGroup: 6, questionText: "A passage says: 'Eating chocolate before sleep makes it harder to fall asleep.' What would be the BEST snack before bed?", choices: ['chocolate cake', 'warm milk', 'candy bar'], correctIndex: 1, type: 'multiple-choice', emoji: '📖' },
      { id: 'sd-6-6', ageGroup: 6, questionText: 'The story lists three things that help you sleep: no screens, a dark room, and a quiet space. Which ONE would help most if your room is very bright?', choices: ['turn off the lights', 'turn off the TV', 'make the room quiet'], correctIndex: 0, type: 'multiple-choice', emoji: '📖' },
      { id: 'sd-6-7', ageGroup: 6, questionText: "A story says: 'It is important to exercise every day to stay healthy.' What does 'exercise' mean?", choices: ['move your body', 'eat vegetables', 'drink water'], correctIndex: 0, type: 'multiple-choice', emoji: '📖' },
    ],
  },
];
