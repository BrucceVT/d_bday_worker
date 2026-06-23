ALTER TABLE birthdays ADD COLUMN nickname TEXT;

UPDATE birthdays SET
  nickname = SUBSTR(name, INSTR(name, '(') + 1, LENGTH(name) - INSTR(name, '(') - 1),
  name = TRIM(SUBSTR(name, 1, INSTR(name, '(') - 1))
WHERE name LIKE '%(%';
